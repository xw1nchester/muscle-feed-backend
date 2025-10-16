import { Module } from '@nestjs/common';

import { DishModule } from '@dish/dish.module';
import { SettingsModule } from '@settings/settings.module';

import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
    imports: [DishModule, SettingsModule],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService]
})
export class MenuModule {}
