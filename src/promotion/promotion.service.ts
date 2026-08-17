import { Injectable, NotFoundException } from '@nestjs/common';

import { Promotion } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { PromotionRequestDto } from '@admin/promotion/dto/promotion-request.dto';
import { PaginationDto } from '@dto/pagination.dto';
import { extractLocalizedFields } from '@utils';

@Injectable()
export class PromotionService {
    constructor(private readonly prismaService: PrismaService) {}

    private get promotionRepository() {
        return this.prismaService.promotion;
    }

    createDto(promotion: Promotion) {
        const {
            id,
            picture,
            actionType,
            order,
            isPublished,
            createdAt,
            updatedAt
        } = promotion;

        const localizedFields = extractLocalizedFields(promotion);

        return {
            id,
            picture,
            ...localizedFields,
            actionType,
            order,
            isPublished,
            createdAt,
            updatedAt
        };
    }

    async getById(id: number) {
        const promotion = await this.promotionRepository.findFirst({
            where: { id }
        });

        if (!promotion) {
            throw new NotFoundException('Акция не найдена');
        }

        return promotion;
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

        const promotionsData = await this.promotionRepository.findMany({
            where,
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
            take: limit,
            skip
        });

        const promotions = promotionsData.map(promotion =>
            this.createDto(promotion)
        );

        const totalCount = await this.promotionRepository.count({
            where
        });

        return new PaginationDto(
            'promotions',
            promotions,
            totalCount,
            limit,
            page
        );
    }

    async adminCreate(dto: PromotionRequestDto) {
        const createdPromotion = await this.promotionRepository.create({
            data: dto
        });

        return { promotion: this.createDto(createdPromotion) };
    }

    async getDtoById(id: number) {
        const promotion = await this.getById(id);

        return { promotion: this.createDto(promotion) };
    }

    async update(id: number, dto: PromotionRequestDto) {
        await this.getById(id);

        const updatedPromotion = await this.promotionRepository.update({
            where: { id },
            data: dto
        });

        return { promotion: this.createDto(updatedPromotion) };
    }

    async togglePublish(id: number) {
        const { isPublished } = await this.getById(id);

        const updatedPromotion = await this.promotionRepository.update({
            where: { id },
            data: { isPublished: !isPublished }
        });

        return { promotion: this.createDto(updatedPromotion) };
    }

    async delete(id: number) {
        const existingPromotion = await this.getById(id);

        await this.promotionRepository.delete({ where: { id } });

        return { promotion: this.createDto(existingPromotion) };
    }
}
