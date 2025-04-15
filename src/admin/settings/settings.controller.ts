import { Body, Controller, Patch, UseGuards } from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { SettingsService } from '@settings/settings.service';

import { SettingsRequestDto } from './dto/settings-request.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Patch()
    async update(@Body() dto: SettingsRequestDto) {
        return await this.settingsService.update(dto);
    }
}
