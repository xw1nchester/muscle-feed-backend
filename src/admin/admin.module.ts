import { Module } from '@nestjs/common';

import { DishModule } from '@dish/dish.module';
import { MenuModule } from '@menu/menu.module';
import { ReviewModule } from '@review/review.module';
import { TeamModule } from '@team/team.module';

import { DishController } from './dish/dish.controller';
import { MenuController } from './menu/menu.controller';
import { ReviewController } from './review/review.controller';
import { TeamController } from './team/team.controller';
import { UploadController } from './upload/upload.controller';

@Module({
    imports: [TeamModule, DishModule, ReviewModule, MenuModule],
    controllers: [
        TeamController,
        UploadController,
        DishController,
        ReviewController,
        MenuController
    ]
})
export class AdminModule {}
