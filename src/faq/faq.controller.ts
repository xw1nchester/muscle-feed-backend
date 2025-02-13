import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { FaqService } from './faq.service';

@Public()
@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) {}

    @Get('category')
    async findCategories() {
        return await this.faqService.findCategories();
    }

    @Get()
    async find(
        @Query('faq_category_id', new ParseIntPipe({ optional: true }))
        faqCategoryId: number
    ) {
        return await this.faqService.find(faqCategoryId);
    }
}
