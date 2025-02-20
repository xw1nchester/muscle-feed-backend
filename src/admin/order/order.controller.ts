import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Query,
    UseGuards
} from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { OrderStatus } from '@order/enums/order-status.enum';
import { OrderService } from '@order/order.service';

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
}
