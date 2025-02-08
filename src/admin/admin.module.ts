import { Module } from '@nestjs/common';

import { DishModule } from '@dish/dish.module';
import { ReviewModule } from '@review/review.module';
import { TeamModule } from '@team/team.module';

import { DishController } from './dish/dish.controller';
import { ReviewController } from './review/review.controller';
import { TeamController } from './team/team.controller';
import { UploadController } from './upload/upload.controller';

@Module({
    imports: [TeamModule, DishModule, ReviewModule],
    controllers: [
        TeamController,
        UploadController,
        DishController,
        ReviewController
    ]
})
export class AdminModule {}
