import { Module } from '@nestjs/common';

import { BeforeAfterController } from './before-after.controller';
import { BeforeAfterService } from './before-after.service';

@Module({
    controllers: [BeforeAfterController],
    providers: [BeforeAfterService],
    exports: [BeforeAfterService]
})
export class BeforeAfterModule {}
