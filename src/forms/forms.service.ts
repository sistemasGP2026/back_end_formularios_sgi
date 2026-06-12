import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Form, FormDocument } from './schema/form.schema';
import mongoose, { Model } from 'mongoose';
import { CreateFormDto } from './dto/create-form.dto';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { FormMapper } from 'src/helpers/form.mapper';
import { AccessType } from 'src/common';
import { UsersService } from 'src/users/users.service';
import { UpdateFormDto } from './dto/update-form.dto';
import { EmailService } from 'src/email/email.service';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { access } from 'fs';

@Injectable()
export class FormsService {
    constructor(
        @InjectModel(Form.name) private formSchema: Model<FormDocument>,
        private readonly userService: UsersService,
        private readonly emailService: EmailService
    ) { }

    async getAllForms() {
        return await this.formSchema.find({ deleted: false }).exec()
    }

    async getFormByCode(code: string) {
        return await this.formSchema.findOne({ code }).exec()
    }

    async createForm(dto: CreateFormDto, creatorId: string): Promise<FormDocument> {
        const creator = await this.userService.findUserById(creatorId);

        if (!creator) {
            throw new BadRequestException(`Usuario desactivado o eliminado`);
        }
        const exists = await this.formSchema.findOne({
            code: dto.code.toUpperCase(),
        }).exec();

        if (exists) {
            throw new BadRequestException(
                `Ya existe un formulario con el código '${dto.code}'`,
            );
        }

        const isRestricted =
            !dto.accessType || dto.accessType === AccessType.RESTRICTED;

        const usernames = isRestricted
            ? [...new Set((dto.permissions?.users ?? []).map((p) => p.username.toLowerCase()))]
            : [];

        let usersMap = new Map<string, UserDocument>();

        if (usernames.length > 0) {
            const users = await this.userService.findActiveByUsernames(usernames);

            usersMap = new Map(users.map((u) => [u.username, u]));

            const missing = usernames.filter((u) => !usersMap.has(u));
            if (missing.length > 0) {
                throw new BadRequestException(
                    `Los siguientes usuarios no existen o están inactivos: ${missing.join(', ')}`,
                );
            }
        }

        const entity = FormMapper.toEntity(dto, creator, usersMap);

        return this.formSchema.create(entity);
    }

    async updateForm(code: string, dto: UpdateFormDto, userId: string) {
        const existForm = await this.formSchema.findOne({ code, deleted: false });

        if (!existForm) {
            throw new NotFoundException(`Formulario eliminado o inexistente`);
        }

        if (existForm.createdBy.userId.toString() !== userId) {
            throw new ForbiddenException();
        }

        const hasChanges = this.hasFormChanges(existForm, dto);
        if (!hasChanges) return existForm;

        const updatePayload = {
            ...dto,
            version: dto.version ?? existForm.version + 1,
        };

        const updated = await this.formSchema.findOneAndUpdate(
            { code, deleted: false },
            { $set: updatePayload },
            { returnDocument: 'after' }
        ).exec();

        return updated;
    }

    private hasFormChanges(current: any, dto: any): boolean {
        const keys = Object.keys(dto);

        return keys.some((key) => {
            return JSON.stringify(current[key]) !== JSON.stringify(dto[key]);
        });
    }

    async assignUserPermissionToForm(assignPermission: AssignPermissionDto) {

        const form = await this.getFormByCode(assignPermission.formCode);

        if (!form) {
            throw new BadRequestException(`Formulario no encontrado`)
        }

        const users: User[] =
            await this.userService.findActiveByUsernames(
                assignPermission.usernames
            );

        if (users.length === 0) {
            throw new BadRequestException('Ningun usuario encontrado')
        }

        const userPermission = users.map((u) => ({
            userId: new mongoose.Types.ObjectId(u._id),
            name: u.fullName,
            username: u.username,
            email: u.email,
        }));

        form.permissions.users.push(...userPermission);

        await form.save();

        await Promise.all(
            users.map((u) =>
                this.emailService.sendAssignedFormNotification(
                    u.email,
                    form.name,
                    u.fullName
                )
            )
        );

        return userPermission;
    }

    async getFormsByCategory(category: string): Promise<Form[]> {
        return await this.formSchema.find({ category })
            .lean()
            .sort({ code: 1 })
            .exec()
    }

    async deleteUserPermission(formCode: string, username: string) {

        const form = await this.formSchema.findOne({
            code: formCode
        });

        if (!form) {
            throw new BadRequestException('Formulario no encontrado');
        }

        await this.formSchema.updateOne({ code: formCode },
            {
                $pull: {
                    "permissions.users": {
                        username: username
                    }
                }
            }
        );

        return {
            message: 'Usuario removido del formulario'
        };
    }

    async getMyFormsAssigned(username: string): Promise<Form[]> {
        return this.formSchema.find({
            deleted: false,
            "permissions.users.username": username
        })
            .lean()
            .exec();
    }

    async getAllPublicForms(): Promise<Form[]> {
        return await this.formSchema.find({ accessType: AccessType.PUBLIC })
    }

    async deleteForm(code: string): Promise<void> {
        const form = await this.formSchema.findOne({ code, deleted: false });
        if (!form) throw new NotFoundException(`Formulario no encontrado`);

        await this.formSchema.findOneAndUpdate(
            { code },
            { $set: { deleted: true } },
            { returnDocument: 'after' }
        ).exec();
    }

    async activateForm(code: string) {
        const form = await this.formSchema.findOne({ code, deleted: true });
        if (!form) throw new NotFoundException(`Formulario no encontrado`);

        await this.formSchema.findOneAndUpdate(
            { code },
            { $set: { deleted: false } },
            { returnDocument: 'after' }
        ).exec();
    }

    async assignApproverToForm(dto: AssignPermissionDto) {
  const form = await this.getFormByCode(dto.formCode);
  if (!form) throw new BadRequestException('Formulario no encontrado');

  const users = await this.userService.findActiveByUsernames(dto.usernames);
  if (users.length === 0) throw new BadRequestException('Ningún usuario encontrado');

  const approverPermissions = users.map(u => ({
    userId:   new mongoose.Types.ObjectId(u._id),
    name:     u.fullName,
    username: u.username,
    email:    u.email,
  }));

  // Evita duplicados
  for (const ap of approverPermissions) {
    const exists = form.permissions.approvers?.some(
      a => a.username === ap.username
    );
    if (!exists) form.permissions.approvers.push(ap);
  }

  await form.save();
  return approverPermissions;
}

async removeApproverFromForm(formCode: string, username: string) {
  await this.formSchema.updateOne(
    { code: formCode },
    { $pull: { 'permissions.approvers': { username } } }
  );
  return { message: 'Aprobador removido' };
}
}
