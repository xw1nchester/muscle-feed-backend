import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { ReviewService } from '@review/review.service';

import { ReviewRequestDto } from './dto/review-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.MODERATOR)
@Controller('admin/review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('published', ParseBoolPipe) isPublished: boolean
    ) {
        return await this.reviewService.find({
            page,
            limit,
            isPublished
        });
    }

    @Post()
    async create(@Body() dto: ReviewRequestDto) {
        return await this.reviewService.adminCreate(dto);
    }

    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.reviewService.getDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ReviewRequestDto
    ) {
        return this.reviewService.update(id, dto);
    }

    @Patch(':id/toggle-publish')
    async togglePublish(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.togglePublish(id);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.delete(id);
    }
}
