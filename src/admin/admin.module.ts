import { Module } from '@nestjs/common';

import { CityModule } from '@city/city.module';
import { DishModule } from '@dish/dish.module';
import { FaqModule } from '@faq/faq.module';
import { MenuModule } from '@menu/menu.module';
import { ReviewModule } from '@review/review.module';
import { TeamModule } from '@team/team.module';

import { CityController } from './city/city.controller';
import { DishController } from './dish/dish.controller';
import { FaqController } from './faq/faq.controller';
import { MenuController } from './menu/menu.controller';
import { ReviewController } from './review/review.controller';
import { TeamController } from './team/team.controller';
import { UploadController } from './upload/upload.controller';

@Module({
    imports: [
        TeamModule,
        DishModule,
        ReviewModule,
        MenuModule,
        FaqModule,
        CityModule
    ],
    controllers: [
        TeamController,
        UploadController,
        DishController,
        ReviewController,
        MenuController,
        FaqController,
        CityController
    ]
})
export class AdminModule {}
