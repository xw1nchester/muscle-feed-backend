import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { options } from './config';
import { STRATEGIES } from './strategies';
import { GUARDS } from './guards';
import { UserModule } from '@user/user.module';

@Module({
    imports: [PassportModule, JwtModule.registerAsync(options()), UserModule],
    controllers: [AuthController],
    providers: [AuthService, ...STRATEGIES, ...GUARDS]
})
export class AuthModule {}
