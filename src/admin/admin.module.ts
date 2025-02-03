import { Module } from '@nestjs/common';

import { TeamModule } from '@team/team.module';

import { TeamController } from './team/team.controller';
import { UploadController } from './upload/upload.controller';

@Module({
    imports: [TeamModule],
    controllers: [TeamController, UploadController]
})
export class AdminModule {}
