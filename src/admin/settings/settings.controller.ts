import { Body, Controller, Patch, UseGuards } from '@nestjs/common';

import { Role as RoleEnum } from '@prisma/client';

import { Role } from '@auth/decorators';
import { RoleGuard } from '@auth/guards/role.guard';
import { SettingsService } from '@settings/settings.service';

import { ContactRequestDto } from './dto/contact-request.dto';
import { CycleStartDateRequestDto } from './dto/cycle-start-date-request.dto';
import { DeliveryConfigDto } from './dto/delivery-config.dto';

@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller('admin/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Patch('cycle-start-date')
    async updateCycleStartDate(@Body() dto: CycleStartDateRequestDto) {
        return await this.settingsService.updateCycleStartDate(dto);
    }

    @Patch('delivery-config')
    async updateDeliveryConfig(@Body() dto: DeliveryConfigDto) {
        return await this.settingsService.updateDeliveryConfig(dto);
    }

    @Patch('contact')
    async updateContactInfo(@Body() dto: ContactRequestDto) {
        return await this.settingsService.updateContactInfo(dto);
    }
}
