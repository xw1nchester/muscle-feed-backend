import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { SettingsService } from './settings.service';

@Public()
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(0)
    @CacheKey('settings')
    @Get()
    async getSettingsDto() {
        return await this.settingsService.getSettingsDto();
    }
}
