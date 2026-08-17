import {
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Query
} from '@nestjs/common';

import { Public } from '@auth/decorators';

import { PromotionService } from './promotion.service';

@Public()
@Controller('promotion')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) {}

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
    ) {
        return await this.promotionService.find({
            page,
            limit,
            isPublished: true
        });
    }
}
