import { Response } from 'express';

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
    Res,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Public, Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { OrderStatus } from '@order/enums/order-status.enum';
import { OrderService } from '@order/order.service';
import { DateValidationPipe } from '@validators';

import { AdminOrderRequestDto } from './dto/admin-order-request.dto';

// @UseGuards(RoleGuard)
// @Role(RoleEnum.MODERATOR)
@Public()
@Controller('admin/order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get('stats')
    async getStats() {
        return await this.orderService.getStats();
    }

    @Get('route-list')
    async getRouteList(
        @Res() res: Response,
        @Query('start_date', DateValidationPipe) startDate: Date,
        @Query('end_date', DateValidationPipe) endDate: Date
    ) {
        return await this.orderService.getRouteList(res, startDate, endDate);
    }

    @Get('insert')
    async getInserts(@Query('date', DateValidationPipe) date: Date) {
        return await this.orderService.getInserts(date);
    }

    @Get('dish-report')
    async getDishReport(
        @Res() res: Response,
        @Query('start_date', DateValidationPipe) startDate: Date,
        @Query('end_date', DateValidationPipe) endDate: Date
    ) {
        return await this.orderService.getDishReport(res, startDate, endDate);
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
}
