import { Module } from '@nestjs/common';


import { MailerModule } from '@nestjs-modules/mailer';

import { options } from './config';
import { MailService } from './mail.service';


@Module({
    imports: [MailerModule.forRootAsync(options())],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
