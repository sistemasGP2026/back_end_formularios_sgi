import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user.response.dto';
import { UserRole } from 'src/common';
import { UpdateFormDto } from 'src/forms/dto/update-form.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
    ) { }

    async getAllUsers(): Promise<UserResponse[]> {

        const users = await this.userSchema.find()
            .lean()
            .exec();

        if (users.length === 0) return [];

        return users.map(user => ({
            id: user._id.toString(),
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            rol: user.roles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            active: user.active
        }));
    }

    async createUser(data: CreateUserDto) {

        const allowedRoles = [UserRole.ADMIN, UserRole.USER, UserRole.APPROVER];
        const passwordHashed = await bcrypt.hash(data.password, 10)

        const existEmail = await this.userSchema.findOne({ email: data.email })
        const existUsername = await this.userSchema.findOne({ username: data.username })

        if (existEmail) {
            throw new BadRequestException(`El email: ${data.email}, ya esta en uso`)
        }
        if (existUsername) {
            throw new BadRequestException(`El usuario: ${data.username}, ya esta en uso`)
        }

        if (!allowedRoles.includes(data.roles)) {
            throw new BadRequestException(`El rol ${data.roles} no es valido`)
        }

        const user: User = {
            fullName: data.fullName,
            email: data.email,
            username: data.username,
            roles: data.roles,
            password: passwordHashed,
            deleted: false,
            createdAt: new Date()
        }

        const userCreated = await this.userSchema.create(user);
        return plainToInstance(User, userCreated.toObject())
    }

    async findUserById(id: string): Promise<UserDocument | null> {
        return this.userSchema.findOne({
            _id: id,
            active: true,
        });
    }

    async findActiveByUsername(username: string): Promise<UserDocument | null> {
        return this.userSchema.findOne({
            username,
            active: true,
            deleted: false,
        })
            .select('+password')
            .exec();
    }

    async findActiveByUsernames(usernames: string[]): Promise<UserDocument[]> {
        return this.userSchema.find({
            username: { $in: usernames },
            active: true,
            deleted: false,
        }).exec();
    }

    async editUser(id: string, userData: UpdateUserDto) {
        const cleanData = Object.fromEntries(
            Object.entries(userData).filter(([_, v]) => v !== undefined && v !== null)
        )

        const userNew = await this.userSchema.findByIdAndUpdate(id,
            { $set: userData },
            { returnDocument: 'after' }
        )
            .select('-__v -password')
            .lean()
            .exec()

        if (!userNew) {
            throw new BadRequestException(
                `Usuario con el id: ${id}, no existe`);
        }

        return userNew;
    }

    async getUserByEmail(email: string) {

        return await this.userSchema
            .findOne({ email })
            .select('-__v -_id')
            .lean()
            .exec();

    }

    async deleteUserById(id: string) {
        const usuario = await this.userSchema.findById(id);

        if (!usuario) return;

        usuario.active = false;
        usuario.deleted = true;
        usuario.save();
        return {
            msg: 'usuario eliminado'
        }
    }

    async activateUserById(id: string) {
        const usuario = await this.userSchema.findById(id);

        if (!usuario) return;

        usuario.active = true;
        usuario.deleted = false;
        usuario.save();
        return {
            msg: 'usuario activado'
        }
    }

    async resetPassword(id: string, dto: ResetPasswordDto) {
        const hashed = await bcrypt.hash(dto.newPassword, 10);

        const user = await this.userSchema.findByIdAndUpdate(
            id,
            { $set: { password: hashed } },
            { returnDocument: 'after' }
        )
            .select('-__v -password')
            .lean()
            .exec();

        if (!user) throw new NotFoundException(`Usuario con id: ${id} no encontrado`);

        return { message: 'Contraseña actualizada correctamente' };
    }
}
