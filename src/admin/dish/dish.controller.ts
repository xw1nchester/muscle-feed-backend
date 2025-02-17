import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { DishService } from '@dish/dish.service';

import { DishRequestDto } from './dto/dish-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/dish')
export class DishController {
    constructor(private readonly dishService: DishService) {}

    @Post()
    async create(@Body() dto: DishRequestDto) {
        return await this.dishService.create(dto);
    }

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('published', new ParseBoolPipe({ optional: true })) isPublished,
        @Query('search')
        search: string,
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
            isPublished,
            search,
            dishTypeId
        });
    }

    @Get(':id')
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.dishService.getDtoById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: DishRequestDto
    ) {
        return await this.dishService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.dishService.delete(id);
    }

    @Post(':id/copy')
    async copy(@Param('id', ParseIntPipe) id: number) {
        return await this.dishService.copy(id);
    }
}
