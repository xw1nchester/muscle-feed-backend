import {
    BadRequestException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { UserService } from '@user/user.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    private async getRefreshToken(userId: number, userAgent: string) {
        const existingToken = await this.prismaService.token.findFirst({
            where: {
                userId,
                userAgent
            }
        });

        const token = v4();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14);

        return this.prismaService.token.upsert({
            where: {
                token: existingToken ? existingToken.token : ''
            },
            update: {
                token,
                expiryDate
            },
            create: {
                token,
                expiryDate,
                userId,
                userAgent
            }
        });
    }

    private async generateTokens(user: User, userAgent: string) {
        const accessToken = this.jwtService.sign({
            id: user.id,
            email: user.email,
            roles: user.roles
        });

        const refreshToken = await this.getRefreshToken(user.id, userAgent);

        return {
            accessToken,
            refreshToken
        };
    }

    createDto(user: User) {
        const { id, email, isVerified, roles } = user;
        return { id, email, isVerified, roles };
    }

    async register(dto: AuthRequestDto, userAgent: string) {
        const existingUser = await this.userService.getByEmail(dto.email);

        if (existingUser) {
            throw new BadRequestException(
                'Пользователь с таким email уже зарегистрирован'
            );
        }

        const user = await this.userService.create(dto);

        const tokens = await this.generateTokens(user, userAgent);

        return { user: this.createDto(user), tokens };
    }

    async login(dto: AuthRequestDto, userAgent: string) {
        const existingUser = await this.userService.getByEmail(dto.email);

        if (
            !existingUser ||
            !compareSync(dto.password, existingUser.password)
        ) {
            throw new BadRequestException(
                'Неверное имя пользователя или пароль'
            );
        }

        const tokens = await this.generateTokens(existingUser, userAgent);

        return { user: this.createDto(existingUser), tokens };
    }

    async refresh(token: string, userAgent: string) {
        if (!token) {
            throw new UnauthorizedException();
        }

        const tokenData = await this.prismaService.token.findFirst({
            where: { token }
        });

        if (!tokenData || new Date(tokenData.expiryDate) < new Date()) {
            throw new UnauthorizedException();
        }

        const user = await this.userService.getById(tokenData.userId);

        return this.generateTokens(user, userAgent);
    }

    async deleteRefreshToken(token: string) {
        if (!token) {
            throw new UnauthorizedException();
        }

        return this.prismaService.token.deleteMany({
            where: {
                token
            }
        });
    }
}
