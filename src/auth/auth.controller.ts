import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { Cookie, UserAgent } from './decorators';
import { Token } from '@prisma/client';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

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

    @Post('register')
    async register(
        @Body() dto: AuthRequestDto,
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

    @Post('login')
    async login(
        @Body() dto: AuthRequestDto,
        @UserAgent() userAgent: string,
        @Res() res: Response
    ) {
        const { user, tokens } = await this.authService.login(dto, userAgent);

        this.setRefreshTokenToCookie(res, tokens.refreshToken);

        res.json({ user, accessToken: tokens.accessToken });
    }

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

    @Get('logout')
    async logout(
        @Cookie(REFRESH_TOKEN) refreshToken: string,
        @Res() res: Response
    ) {
        await this.authService.deleteRefreshToken(refreshToken);

        res.clearCookie(REFRESH_TOKEN);

        res.sendStatus(HttpStatus.OK);
    }
}
