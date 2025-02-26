import {
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Query
} from '@nestjs/common';

import { Public } from '@auth/decorators';

import { DishService } from './dish.service';

@Public()
@Controller('dish')
export class DishController {
    constructor(private readonly dishService: DishService) {}

    @Get('type')
    async getTypes() {
        return await this.dishService.getTypes();
    }

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('search') search: string,
        @Query(
            'dish_type_id',
            new DefaultValuePipe(undefined),
            new ParseIntPipe({ optional: true })
        )
        dishTypeId: number
    ) {
        return await this.dishService.find({
            page,
            limit,
            isPublished: true,
            search,
            dishTypeId,
            isIndividualOrderAvailable: true
        });
    }
}
