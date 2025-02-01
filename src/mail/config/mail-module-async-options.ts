import { join } from 'path';

import { ConfigService } from '@nestjs/config';

import { MailerOptions } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

const mailerModuleOptions = (configService: ConfigService): MailerOptions => ({
    transport: {
        host: configService.get('SMTP_HOST'),
        port: configService.get('SMTP_PORT'),
        auth: {
            user: configService.get('SMTP_USERNAME'),
            pass: configService.get('SMTP_PASSWORD')
        }
    },
    defaults: {
        from: configService.get('SMTP_FROM')
    },
    template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new PugAdapter(),
        options: {
            strict: true
        }
    }
});

export const options = (): MailerAsyncOptions => ({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
        mailerModuleOptions(configService)
});
