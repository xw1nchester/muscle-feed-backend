import { Injectable } from '@nestjs/common';

import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Language } from '@prisma/client';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendEmail({
        subject,
        to,
        template,
        context
    }: {
        subject: string;
        to: string;
        template: string;
        context: ISendMailOptions['context'];
    }) {
        try {
            await this.mailerService.sendMail({
                subject,
                to,
                template,
                context
            });
        } catch (error) {
            // TODO: залогировать нормальным образом
            console.log('Произошла ошибка при отправке письма', error);
        }
    }

    async sendVerificationCode({
        to,
        language,
        code
    }: {
        to: string;
        code: string;
        language: Language;
    }) {
        const subject =
            language == Language.RU ? 'Подтверждение почты' : 'אישור דואר';

        const template = language == Language.RU
            ? 'email-verification-ru'
            : 'email-verification-he';

        await this.sendEmail({
            subject,
            to,
            template,
            context: {
                code
            }
        });
    }
}
