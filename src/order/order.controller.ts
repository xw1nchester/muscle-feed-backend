import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';

import { OrderRequestDto } from './dto/order-request.dto';
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
}
