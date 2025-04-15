import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma/prisma.service';

import { SettingsRequestDto } from '@admin/settings/dto/settings-request.dto';

@Injectable()
export class SettingsService {
    constructor(private readonly prismaService: PrismaService) {}

    async findFirst() {
        return await this.prismaService.settings.findFirst();
    }

    async update(dto: SettingsRequestDto) {
        const { id } = await this.findFirst();

        const updatedSettings = await this.prismaService.settings.update({
            where: { id },
            data: {
                ...dto
            }
        });

        return { settings: updatedSettings };
    }

    async getCycleStartDate() {
        const { cycleStartDate } = await this.findFirst();
        return { cycleStartDate };
    }
}
