import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { FeedbackService } from '@feedback/feedback.service';

import { FeedbackRequestUpdateDto } from './dto/feedback-request-update.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.MODERATOR)
@Controller('admin/feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
    ) {
        return await this.feedbackService.find(page, limit);
    }

    @Get('unprocessed-count')
    async getUnprocessedCount() {
        return await this.feedbackService.getUnprocessedCount();
    }

    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.feedbackService.getDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: FeedbackRequestUpdateDto
    ) {
        return await this.feedbackService.update(id, dto);
    }
}
