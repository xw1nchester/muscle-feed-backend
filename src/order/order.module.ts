import { Module } from '@nestjs/common';

import { CityModule } from '@city/city.module';
import { MenuModule } from '@menu/menu.module';
import { UserModule } from '@user/user.module';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
    imports: [MenuModule, CityModule, UserModule],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule {}
