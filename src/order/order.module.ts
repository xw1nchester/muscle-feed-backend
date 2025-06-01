import { Module } from '@nestjs/common';

import { CityModule } from '@city/city.module';
import { DishModule } from '@dish/dish.module';
import { MenuModule } from '@menu/menu.module';
import { PromocodeModule } from '@promocode/promocode.module';
import { SettingsModule } from '@settings/settings.module';
import { UserModule } from '@user/user.module';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
    imports: [
        MenuModule,
        CityModule,
        UserModule,
        DishModule,
        PromocodeModule,
        SettingsModule
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule {}
