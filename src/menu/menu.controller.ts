import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';

import { Public } from '@auth/decorators';

import { MenuService } from './menu.service';
import { DateValidationPipe } from './pipes/date-validation.pipe';

@Public()
@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

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

    @Get(':id')
    async getMealPlanDtoById(
        @Param('id', ParseIntPipe) id: number,
        @Query('start_date', DateValidationPipe) startDate: Date,
        @Query('limit', new DefaultValuePipe(7), ParseIntPipe) limit: number
    ) {
        return await this.menuService.getMealPlanDtoById(id, startDate, limit);
    }
}
