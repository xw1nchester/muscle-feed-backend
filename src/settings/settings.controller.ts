import { Controller, Get } from '@nestjs/common';

import { Public } from '@auth/decorators';

import { SettingsService } from './settings.service';

@Public()
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get('cycle-start-date')
    async getCycleStartDate() {
        return await this.settingsService.getCycleStartDate();
    }
}
