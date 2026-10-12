import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { Language, Review, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { ReviewRequestDto as AdminReviewRequestDto } from '@admin/review/dto/review-request.dto';
import { PaginationDto } from '@dto/pagination.dto';
import { UserService } from '@user/user.service';
import { extractLocalizedFields } from '@utils';

import { ReviewRequestDto } from './dto/review-request.dto';

@Injectable()
export class ReviewService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userService: UserService
    ) {}

    async getById(id: number) {
        const review = await this.prismaService.review.findFirst({
            include: { user: true },
            where: { id }
        });

        if (!review) {
            throw new NotFoundException('Отзыв не найден');
        }

        return review;
    }

    createDto(review: Review & { user: User }) {
        const { id, rating, picture, isPublished, user, createdAt, updatedAt } =
            review;

        const localizedFields = extractLocalizedFields(review);

        return {
            id,
            rating,
            picture,
            ...localizedFields,
            isPublished,
            user: user ? this.userService.createDto(user) : null,
            createdAt,
            updatedAt
        };
    }

    async create(
        { rating, picture, author, text, language }: ReviewRequestDto,
        userId?: number
    ) {
        const createdReview = await this.prismaService.review.create({
            data: {
                rating,
                picture,
                ...(language == Language.RU
                    ? {
                          authorRu: author,
                          textRu: text
                      }
                    : {
                          authorHe: author,
                          textHe: text
                      }),
                userId
            },
            include: { user: true }
        });

        return { review: this.createDto(createdReview) };
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

        const reviewsData = await this.prismaService.review.findMany({
            include: { user: true },
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const reviews = reviewsData.map(review => this.createDto(review));

        const totalCount = await this.prismaService.review.count({
            where
        });

        return new PaginationDto('reviews', reviews, totalCount, limit, page);
    }

    async adminCreate(dto: AdminReviewRequestDto) {
        !!dto.userId && (await this.userService.getById(dto.userId));

        const createdReview = await this.prismaService.review.create({
            data: dto,
            include: { user: true }
        });

        return { review: this.createDto(createdReview) };
    }

    async getDtoById(id: number) {
        const review = await this.getById(id);

        return { review: this.createDto(review) };
    }

    async update(id: number, dto: AdminReviewRequestDto) {
        await this.getById(id);

        !!dto.userId && (await this.userService.getById(dto.userId));

        const updatedReview = await this.prismaService.review.update({
            include: { user: true },
            where: { id },
            data: dto
        });

        return { review: this.createDto(updatedReview) };
    }

    async togglePublish(id: number) {
        const { authorRu, authorHe, textRu, textHe, isPublished } =
            await this.getById(id);

        if (!isPublished && (!authorRu || !authorHe || !textRu || !textHe)) {
            throw new BadRequestException(
                'У отзыва должны быть заполнены все поля'
            );
        }

        const updatedReview = await this.prismaService.review.update({
            include: { user: true },
            where: { id },
            data: { isPublished: !isPublished }
        });

        return { review: this.createDto(updatedReview) };
    }

    async delete(id: number) {
        const existingReview = await this.getById(id);

        await this.prismaService.review.delete({ where: { id } });

        return { review: this.createDto(existingReview) };
    }
}
