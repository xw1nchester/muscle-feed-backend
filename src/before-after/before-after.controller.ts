import {
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Query
} from '@nestjs/common';

import { Public } from '@auth/decorators';

import { BeforeAfterService } from './before-after.service';

@Public()
@Controller('before-after')
export class BeforeAfterController {
    constructor(private readonly beforeAfterService: BeforeAfterService) {}

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
    ) {
        return await this.beforeAfterService.find({
            page,
            limit,
            isPublished: true
        });
    }
}
