import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CodeModule } from '@code/code.module';
import { MailModule } from '@mail/mail.module';
import { UserModule } from '@user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { options } from './config';
import { GUARDS } from './guards';
import { STRATEGIES } from './strategies';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync(options()),
        UserModule,
        CodeModule,
        MailModule
    ],
    controllers: [AuthController],
    providers: [AuthService, ...STRATEGIES, ...GUARDS]
})
export class AuthModule {}
