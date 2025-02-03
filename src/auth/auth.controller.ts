import { Response } from 'express';

import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Token } from '@prisma/client';

import { AuthService } from './auth.service';
import { Cookie, CurrentUser, Public, UserAgent } from './decorators';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { CodeRequestDto } from './dto/code-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RecoveryPasswordRequestDto } from './dto/recovery-password-request.dto';
import { RecoveryRequestDto } from './dto/recovery-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { VerifyRecoveryRequestDto } from './dto/verify-recovery-request.dto';
import { JwtPayload } from './interfaces';

const REFRESH_TOKEN = 'refresh-token';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService
    ) {}

    private setRefreshTokenToCookie(res: Response, refreshToken: Token) {
        res.cookie(REFRESH_TOKEN, refreshToken.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(refreshToken.expiryDate),
            secure:
                this.configService.get('NODE_ENV', 'development') ===
                'production',
            path: '/'
        });
    }

    @Public()
    @Post('register')
    async register(
        @Body() dto: RegisterRequestDto,
        @UserAgent() userAgent: string,
        @Res() res: Response
    ) {
        const { user, tokens } = await this.authService.register(
            dto,
            userAgent
        );

        this.setRefreshTokenToCookie(res, tokens.refreshToken);

        res.json({ user, accessToken: tokens.accessToken });
    }

    @Public()
    @Post('login')
    async login(
        @Body() dto: LoginRequestDto,
        @UserAgent() userAgent: string,
        @Res() res: Response
    ) {
        const { user, tokens } = await this.authService.login(dto, userAgent);

        this.setRefreshTokenToCookie(res, tokens.refreshToken);

        res.json({ user, accessToken: tokens.accessToken });
    }

    @Public()
    @Get('refresh')
    async refresh(
        @Cookie(REFRESH_TOKEN) refreshToken: string,
        @UserAgent() agent: string,
        @Res() res: Response
    ) {
        const tokens = await this.authService.refresh(refreshToken, agent);

        this.setRefreshTokenToCookie(res, tokens.refreshToken);

        res.json({ accessToken: tokens.accessToken });
    }

    @Public()
    @Get('logout')
    async logout(
        @Cookie(REFRESH_TOKEN) refreshToken: string,
        @Res() res: Response
    ) {
        await this.authService.deleteRefreshToken(refreshToken);

        res.clearCookie(REFRESH_TOKEN);

        res.sendStatus(HttpStatus.OK);
    }

    @Get('resend-verification')
    async resendVerificationCode(@CurrentUser() user: JwtPayload) {
        await this.authService.resendVerificationCode(user.id);

        return HttpStatus.OK;
    }

    @Post('verify-email')
    async verify(
        @Body() { code }: CodeRequestDto,
        @CurrentUser() user: JwtPayload
    ) {
        await this.authService.verify(code, user.id);

        return HttpStatus.OK;
    }

    @Public()
    @Post('send-recovery')
    async sendRecoveryCode(@Body() dto: RecoveryRequestDto) {
        await this.authService.sendRecoveryCode(dto);

        return HttpStatus.OK;
    }

    @Public()
    @Post('verify-recovery')
    async verifyRecoveryCode(@Body() dto: VerifyRecoveryRequestDto) {
        return await this.authService.verifyRecoveryCode(dto);
    }

    @Public()
    @Post('recovery-password')
    async recoveryPassword(@Body() dto: RecoveryPasswordRequestDto) {
        await this.authService.recoveryPassword(dto);

        return HttpStatus.OK;
    }

    @Post('change-password')
    async changePassword(
        @Body() dto: ChangePasswordRequestDto,
        @CurrentUser() user: JwtPayload
    ) {
        await this.authService.changePassword(dto, user.id);

        return HttpStatus.OK;
    }
}
