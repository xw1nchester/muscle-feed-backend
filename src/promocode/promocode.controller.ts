import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';

import { Public } from '@auth/decorators';

import { PromocodeService } from './promocode.service';

@Public()
@Controller('promocode')
export class PromocodeController {
    constructor(private readonly promocodeService: PromocodeService) {}

    @Get(':code')
    async getByCodeAndCalculatePrice(
        @Param('code') code: string,
        @Query('price', new DefaultValuePipe(0), ParseIntPipe) price: number
    ) {
        return await this.promocodeService.getByCodeAndCalculatePrice(
            code,
            price
        );
    }
}
