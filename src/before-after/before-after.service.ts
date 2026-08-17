import { Injectable, NotFoundException } from '@nestjs/common';

import { BeforeAfter } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { BeforeAfterRequestDto } from '@admin/before-after/dto/before-after-request.dto';
import { PaginationDto } from '@dto/pagination.dto';
import { extractLocalizedFields } from '@utils';

@Injectable()
export class BeforeAfterService {
    constructor(private readonly prismaService: PrismaService) {}

    async getById(id: number) {
        const beforeAfter = await this.prismaService.beforeAfter.findFirst({
            where: { id }
        });

        if (!beforeAfter) {
            throw new NotFoundException('Запись до/после не найдена');
        }

        return beforeAfter;
    }

    createDto(beforeAfter: BeforeAfter) {
        const {
            id,
            beforePicture,
            afterPicture,
            weightBefore,
            weightAfter,
            calories,
            isPublished,
            createdAt,
            updatedAt
        } = beforeAfter;

        const localizedFields = extractLocalizedFields(beforeAfter);

        return {
            id,
            beforePicture,
            afterPicture,
            weightBefore,
            weightAfter,
            calories,
            ...localizedFields,
            isPublished,
            createdAt,
            updatedAt
        };
    }

    async find({
        page,
        limit,
        isPublished
    }: {
        page: number;
        limit: number;
        isPublished: boolean;
    }) {
        const where = { ...(isPublished != undefined && { isPublished }) };

        const skip = (page - 1) * limit;

        const beforeAfterData = await this.prismaService.beforeAfter.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const beforeAfter = beforeAfterData.map(item => this.createDto(item));

        const totalCount = await this.prismaService.beforeAfter.count({
            where
        });

        return new PaginationDto(
            'beforeAfter',
            beforeAfter,
            totalCount,
            limit,
            page
        );
    }

    async adminCreate(dto: BeforeAfterRequestDto) {
        const createdBeforeAfter = await this.prismaService.beforeAfter.create({
            data: dto
        });

        return { beforeAfter: this.createDto(createdBeforeAfter) };
    }

    async getDtoById(id: number) {
        const beforeAfter = await this.getById(id);

        return { beforeAfter: this.createDto(beforeAfter) };
    }

    async update(id: number, dto: BeforeAfterRequestDto) {
        await this.getById(id);

        const updatedBeforeAfter = await this.prismaService.beforeAfter.update({
            where: { id },
            data: dto
        });

        return { beforeAfter: this.createDto(updatedBeforeAfter) };
    }

    async togglePublish(id: number) {
        const { isPublished } = await this.getById(id);

        const updatedBeforeAfter = await this.prismaService.beforeAfter.update({
            where: { id },
            data: { isPublished: !isPublished }
        });

        return { beforeAfter: this.createDto(updatedBeforeAfter) };
    }

    async delete(id: number) {
        const existingBeforeAfter = await this.getById(id);

        await this.prismaService.beforeAfter.delete({ where: { id } });

        return { beforeAfter: this.createDto(existingBeforeAfter) };
    }
}
