import { Injectable, NotFoundException } from '@nestjs/common';

import { FeedbackRequest } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { FeedbackRequestUpdateDto } from '@admin/feedback/dto/feedback-request-update.dto';
import { PaginationDto } from '@dto/pagination.dto';

import { FeedbackRequestDto } from './dto/feedback-request.dto';

@Injectable()
export class FeedbackService {
    constructor(private readonly prismaService: PrismaService) {}

    private get feedbackRequestRepository() {
        return this.prismaService.feedbackRequest;
    }

    async getById(id: number) {
        const feedbackRequest = await this.feedbackRequestRepository.findFirst({
            where: { id }
        });

        if (!feedbackRequest) {
            throw new NotFoundException('Заявка не найдена');
        }

        return feedbackRequest;
    }

    createDto(feedbackRequest: FeedbackRequest) {
        const {
            id,
            feedbackRequestType,
            name,
            phone,
            cityName,
            isProcessed,
            createdAt,
            updatedAt
        } = feedbackRequest;

        return {
            id,
            feedbackRequestType,
            name,
            phone,
            cityName,
            isProcessed,
            createdAt,
            updatedAt
        };
    }

    async create(dto: FeedbackRequestDto) {
        const createdFeedbackRequest =
            await this.feedbackRequestRepository.create({
                data: dto
            });

        return {
            feedbackRequest: this.createDto(createdFeedbackRequest)
        };
    }

    async find(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const feedbackRequestsData =
            await this.feedbackRequestRepository.findMany({
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            });

        const feedbackRequests = feedbackRequestsData.map(feedbackRequest =>
            this.createDto(feedbackRequest)
        );

        const totalCount = await this.feedbackRequestRepository.count();

        return new PaginationDto(
            'feedbackRequests',
            feedbackRequests,
            totalCount,
            limit,
            page
        );
    }

    async getDtoById(id: number) {
        const feedbackRequest = await this.getById(id);

        return {
            feedbackRequest: this.createDto(feedbackRequest)
        };
    }

    async getUnprocessedCount() {
        const count = await this.feedbackRequestRepository.count({
            where: { isProcessed: false }
        });

        return { count };
    }

    async update(id: number, { isProcessed }: FeedbackRequestUpdateDto) {
        await this.getById(id);

        const updatedFeedbackRequest =
            await this.feedbackRequestRepository.update({
                where: { id },
                data: { isProcessed }
            });

        return {
            feedbackRequest: this.createDto(updatedFeedbackRequest)
        };
    }
}
