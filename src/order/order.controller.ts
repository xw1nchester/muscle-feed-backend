import { Controller, Get } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Public()
    @Get('payment-method')
    async getPaymentMethods() {
        return await this.orderService.getPaymentMethods();
    }
}
