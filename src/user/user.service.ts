import { genSaltSync, hashSync } from 'bcrypt';

import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthRequestDto } from '@auth/dto/auth-request.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async getById(id: number) {
        const user = await this.prismaService.user.findFirst({ where: { id } });

        if (!user) {
            throw new NotFoundException('');
        }

        return user;
    }

    async getByEmail(email: string) {
        return await this.prismaService.user.findFirst({
            where: { email }
        });
    }

    async create({ email, password, language }: AuthRequestDto) {
        return await this.prismaService.user.create({
            data: {
                email,
                password: hashSync(password, genSaltSync(10)),
                language
            }
        });
    }

    async verify(id: number) {
        return await this.prismaService.user.update({
            where: {
                id
            },
            data: { isVerified: true }
        });
    }
}
