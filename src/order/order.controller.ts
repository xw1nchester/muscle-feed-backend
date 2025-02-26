import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';

import { OrderChangeRequestDto } from './dto/order-change-request.dto';
import { OrderRequestDto } from './dto/order-request.dto';
import { SelectDishDto } from './dto/select-dish.dto';
import { OrderStatus } from './enums/order-status.enum';
import { OrderService } from './order.service';
import { OrderPipe } from './pipes/order.pipe';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Public()
    @Get('payment-method')
    async getPaymentMethods() {
        return await this.orderService.getPaymentMethods();
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Post()
    async create(
        @Body(OrderPipe) dto: OrderRequestDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.orderService.create(dto, user.id);
    }

    @Get()
    async find(
        @CurrentUser() user: JwtPayload,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('status', new ParseEnumPipe(OrderStatus, { optional: true }))
        status: OrderStatus
    ) {
        return await this.orderService.find({
            page,
            limit,
            userId: user.id,
            status
        });
    }

    @Get(':id')
    async createDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.orderService.createDtoById(id);
    }

    @Get(':id/day')
    async findOrderDays(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.orderService.findOrderDays(id, user.id);
    }

    @Get('day/:id')
    async getSelectedOrderDayDishes(
        @Param('id', ParseIntPipe) dayId: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.orderService.getSelectedOrderDayDishes(
            dayId,
            user.id
        );
    }

    @Get('day/:id/replacement')
    async getReplacementOrderDayDishes(
        @Param('id', ParseIntPipe) dayId: number,
        @Query('dish_type_id', ParseIntPipe) dishTypeId: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.orderService.getReplacementOrderDayDishes(
            dayId,
            dishTypeId,
            user.id
        );
    }

    @Post('select')
    async selectDish(
        @Body() dto: SelectDishDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.orderService.selectDish(dto, user.id);
    }

    @Post(':id/change-request')
    async createChangeRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Body() dto: OrderChangeRequestDto
    ) {
        return await this.orderService.createChangeRequest(id, user.id, dto);
    }
}
