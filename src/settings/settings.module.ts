import { Module } from '@nestjs/common';

import { RedisModule } from '@redis/redis.module';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
    imports: [RedisModule],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService]
})
export class SettingsModule {}
