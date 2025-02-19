import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    ParseEnumPipe,
    ParseIntPipe,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';

import { OrderRequestDto } from './dto/order-request.dto';
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
}
