import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Post,
    Query
} from '@nestjs/common';

import { Public } from '@auth/decorators';

import { ReviewRequestDto } from './dto/review-request.dto';
import { ReviewService } from './review.service';

@Public()
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    async create(@Body() dto: ReviewRequestDto) {
        return await this.reviewService.create(dto);
    }

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
    ) {
        return await this.reviewService.find({
            page,
            limit,
            isPublished: true
        });
    }
}
