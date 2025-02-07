import { genSaltSync, hashSync } from 'bcrypt';

import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { RegisterRequestDto } from '@auth/dto/register-request.dto';

import { ProfileRequestDto } from './dto/profile-request.dto';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async getById(id: number) {
        const user = await this.prismaService.user.findFirst({ where: { id } });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return user;
    }

    async getByEmail(email: string) {
        return await this.prismaService.user.findFirst({
            where: { email }
        });
    }

    async create({ email, password, language }: RegisterRequestDto) {
        return await this.prismaService.user.create({
            data: {
                email,
                password: hashSync(password, genSaltSync(10)),
                language
            }
        });
    }

    createDto(user: User) {
        const { id, email, isVerified, roles, firstName, lastName, phone } =
            user;
        return { id, email, isVerified, roles, firstName, lastName, phone };
    }

    async verify(id: number) {
        return await this.prismaService.user.update({
            where: {
                id
            },
            data: { isVerified: true }
        });
    }

    async updatePassword(id: number, password: string) {
        return await this.prismaService.user.update({
            where: {
                id
            },
            data: {
                password: hashSync(password, genSaltSync(10))
            }
        });
    }

    async createDtoById(id: number) {
        const user = await this.getById(id);

        return { user: this.createDto(user) };
    }

    async updateProfile(id: number, dto: ProfileRequestDto) {
        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: dto
        });

        return { user: this.createDto(updatedUser) };
    }
}
