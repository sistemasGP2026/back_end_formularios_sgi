import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendAssignedFormNotification(sendTo:string, formName:string, fullName: string){
        await this.mailerService.sendMail({
            to: sendTo,
            subject: 'Asignacion de formulario',
            template: 'assigned-form',
            context: {
                fullName, formName
            }
        })
    }
}
