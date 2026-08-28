import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenPayload } from 'src/jwt/dto/token.payload.interface';
import { JwtokenService } from 'src/jwt/jwtoken.service';
import { SignInDto } from './dto/signIn.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignInResponse } from './dto/signIn.response.dto';
import { plainToInstance } from 'class-transformer';
import { User, UserDocument } from 'src/users/schema/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtokenService
    ) { }

    async signIn(sigInDto: SignInDto): Promise<SignInResponse> {
        const user = await this.userService.findActiveByUsername(sigInDto.username);
        if (!user) {
            throw new BadRequestException(`Usuario ${sigInDto.username} no existe o esta deshabilitado`)
        }
        const passwordCoded = await bcrypt.compare(sigInDto.password, user.password);

        if (!passwordCoded) throw new BadRequestException(`Contraseña no valida`)

        const payload: TokenPayload = {
            sub: user.id.toString(),
            email: user.email,
            fullname: user.fullName,
            roles: user.roles,
            username: user.username
        }

        const { password, ...userWithoutPassword } = user.toObject();
        const userTransformed = plainToInstance(User, userWithoutPassword);

        const response: SignInResponse = {
            user: userTransformed,
            token: this.jwtService.generateToken(payload)
        }
        return response;
    }

    async checkToken(userFromToken: any) {
        if (!userFromToken?.sub) {
            throw new UnauthorizedException('Token inválido');
        }
        const user = await this.userService.findUserById(userFromToken.sub);

        if (!user) {
            throw new UnauthorizedException('Usuario no existe');
        }
        return this.buildAuthResponse(user);
    }

    async changeFirstPassword(newPassword: string, userId: string) {
        if(!newPassword){
            throw new BadRequestException("La nueva clave es requerida")
        }
        const user = await this.userService.findUserById(userId);

        if (!user) {
            throw new BadRequestException(`El usuario con: ${user.id} no existe o esta desactivado`)
        }

        if(!user.mustChangePassword){
            throw new BadRequestException(`El usuario ya cambio la clave`)
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.mustChangePassword = false;
        await user.save();
        return {
            'msg': 'Clave actualizada'
        }
    }


    private buildAuthResponse(user: UserDocument) {
        return {
            user,
            token: this.jwtService.generateToken({
                sub: user.id.toString(),
                email: user.email,
                fullname: user.fullName,
                roles: user.roles,
                username: user.username
            })
        };
    }
}
