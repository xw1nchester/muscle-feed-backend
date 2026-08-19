import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { FeedbackRequestDto } from './dto/feedback-request.dto';
import { FeedbackService } from './feedback.service';

@Public()
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Post()
    async create(@Body() dto: FeedbackRequestDto) {
        return await this.feedbackService.create(dto);
    }
}
