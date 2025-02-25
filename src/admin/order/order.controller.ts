import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { SelectDishDto } from '@order/dto/select-dish.dto';
import { OrderStatus } from '@order/enums/order-status.enum';
import { OrderService } from '@order/order.service';

import { AdminOrderRequestDto } from './dto/admin-order-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.MODERATOR)
@Controller('admin/order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get('stats')
    async getStats() {
        return await this.orderService.getStats();
    }

    @Get()
    async find(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('status', new ParseEnumPipe(OrderStatus, { optional: true }))
        status: OrderStatus
    ) {
        return await this.orderService.find({ page, limit, status });
    }

    @Get(':id')
    async getAdminInfoById(@Param('id', ParseIntPipe) id: number) {
        return await this.orderService.getAdminInfoById(id);
    }

    @Post()
    async create(@Body() dto: AdminOrderRequestDto) {
        return await this.orderService.adminCreate(dto);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdminOrderRequestDto
    ) {
        return await this.orderService.update(id, dto);
    }

    @Get(':id/day')
    async findOrderDays(@Param('id', ParseIntPipe) id: number) {
        return await this.orderService.findOrderDays(id);
    }

    @Get('day/:id')
    async getSelectedOrderDayDishes(@Param('id', ParseIntPipe) dayId: number) {
        return await this.orderService.getSelectedOrderDayDishes(dayId);
    }

    @Get('day/:id/replacement')
    async getReplacementOrderDayDishes(
        @Param('id', ParseIntPipe) dayId: number,
        @Query('dish_type_id', ParseIntPipe) dishTypeId: number
    ) {
        return await this.orderService.getReplacementOrderDayDishes(
            dayId,
            dishTypeId
        );
    }

    @Post('select')
    async selectDish(@Body() dto: SelectDishDto) {
        return await this.orderService.selectDish(dto);
    }
}
