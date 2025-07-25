import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query,
    UseInterceptors
} from '@nestjs/common';

import { Public } from '@auth/decorators';
import { DateValidationPipe } from '@validators';

import { MenuService } from './menu.service';

@Public()
@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(0)
    @CacheKey('menu:types')
    @Get('type')
    async getTypes() {
        return await this.menuService.getTypes(true);
    }

    @Get()
    async findByTypeId(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('menu_type_id', ParseIntPipe) menuTypeId: number
    ) {
        return await this.menuService.findPublishedByTypeId(
            page,
            limit,
            menuTypeId
        );
    }

    @Get('recomendation')
    async getRecomendations(@Query('calories', ParseIntPipe) calories: number) {
        return await this.menuService.getRecomendations(calories);
    }

    @Get('personal')
    async getPersonal(@Query('date', DateValidationPipe) date: Date) {
        return await this.menuService.getPersonal(date);
    }

    @Get(':id')
    async getPrimaryMenuDishesByDate(
        @Param('id', ParseIntPipe) id: number,
        @Query('date', DateValidationPipe) date: Date
    ) {
        return await this.menuService.getPrimaryMenuDishesByDate(id, date);
    }

    @Get(':id/replacement')
    async getReplacementsByDate(
        @Param('id', ParseIntPipe) id: number,
        @Query('date', DateValidationPipe) date: Date,
        @Query('dish_type_id', ParseIntPipe) dishTypeId: number
    ) {
        return await this.menuService.getReplacementsByDate(
            id,
            date,
            dishTypeId
        );
    }
}
