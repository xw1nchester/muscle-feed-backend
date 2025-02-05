import { Controller, Get } from '@nestjs/common';

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
}
