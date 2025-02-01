import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class CodeService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number) {
        await this.prismaService.code.deleteMany({
            where: {
                userId
            }
        });

        const randomCode = Math.floor(Math.random() * 1000000);
        const formattedCode = randomCode.toString().padStart(6, '0');

        const addMinutesToDate = (date: Date, minutes: number) => {
            const newDate = new Date(date);
            newDate.setMinutes(newDate.getMinutes() + minutes);
            return newDate;
        };

        const retryDate = addMinutesToDate(new Date(), 1);
        const expiryDate = addMinutesToDate(new Date(), 5);

        await this.prismaService.code.create({
            data: {
                userId,
                code: formattedCode,
                retryDate,
                expiryDate
            }
        });

        return formattedCode;
    }

    async recreate(userId: number) {
        const existingCode = await this.prismaService.code.findFirst({
            where: {
                userId,
                retryDate: {
                    gt: new Date()
                }
            }
        });

        if (existingCode) {
            throw new BadRequestException('Код уже отправлен');
        }

        return await this.create(userId);
    }

    async validateCode(code: string, userId: number) {
        const existingCode = await this.prismaService.code.findFirst({
            where: {
                userId,
                code,
                expiryDate: {
                    gt: new Date()
                }
            }
        });

        if (!existingCode) {
            throw new BadRequestException('Код недействителен или истек');
        }
    }
}
