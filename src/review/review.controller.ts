import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';

import { ReviewRequestDto } from './dto/review-request.dto';
import { ReviewService } from './review.service';

@Public()
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Post()
    async create(
        @Body() dto: ReviewRequestDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.reviewService.create(dto, user.id);
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
