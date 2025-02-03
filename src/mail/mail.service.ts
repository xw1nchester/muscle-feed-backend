import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

import { Language } from '@prisma/client';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) {}

    private async sendEmail({
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
            this.logger.error('Произошла ошибка при отправке письма', error);
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

        const template =
            language == Language.RU
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

    async sendRecoveryCode({
        to,
        language,
        code
    }: {
        to: string;
        code: string;
        language: Language;
    }) {
        const subject =
            language == Language.RU ? 'Восстановление пароля' : 'שחזור סיסמה';

        const template =
            language == Language.RU
                ? 'password-recovery-ru'
                : 'password-recovery-he';

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
