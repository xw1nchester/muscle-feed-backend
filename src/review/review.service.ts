import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { Language, Review } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { ReviewRequestDto as AdminReviewRequestDto } from '@admin/review/dto/review-request.dto';
import { PaginationDto } from '@dto/pagination.dto';
import { extractLocalizedFields } from '@utils';

import { ReviewRequestDto } from './dto/review-request.dto';

@Injectable()
export class ReviewService {
    constructor(private readonly prismaService: PrismaService) {}

    async getById(id: number) {
        const review = await this.prismaService.review.findFirst({
            where: { id }
        });

        if (!review) {
            throw new NotFoundException('Отзыв не найден');
        }

        return review;
    }

    createDto(review: Review) {
        const { id, picture } = review;

        const localizedFields = extractLocalizedFields(review);

        return {
            id,
            picture,
            ...localizedFields
        };
    }

    async create({ picture, author, text, language }: ReviewRequestDto) {
        const createdReview = await this.prismaService.review.create({
            data: {
                picture,
                ...(language == Language.RU
                    ? {
                          authorRu: author,
                          textRu: text
                      }
                    : {
                          authorHe: author,
                          textHe: text
                      })
            }
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
        const where = { isPublished };

        const skip = (page - 1) * limit;

        const reviewsData = await this.prismaService.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const reviews = reviewsData.map(review => this.createDto(review));

        const totalCount = await this.prismaService.review.aggregate({
            _count: { id: true },
            where
        });

        return new PaginationDto(
            'reviews',
            reviews,
            totalCount._count.id,
            limit,
            page
        );
    }

    async getDtoById(id: number) {
        const review = await this.getById(id);

        return { review };
    }

    async update(id: number, dto: AdminReviewRequestDto) {
        await this.getById(id);

        const updatedReview = await this.prismaService.review.update({
            where: { id },
            data: dto
        });

        return { review: this.createDto(updatedReview) };
    }
}
