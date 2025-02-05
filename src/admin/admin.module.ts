import { Module } from '@nestjs/common';

import { DishModule } from '@dish/dish.module';
import { TeamModule } from '@team/team.module';

import { DishController } from './dish/dish.controller';
import { TeamController } from './team/team.controller';
import { UploadController } from './upload/upload.controller';

@Module({
    imports: [TeamModule, DishModule],
    controllers: [TeamController, UploadController, DishController]
})
export class AdminModule {}
