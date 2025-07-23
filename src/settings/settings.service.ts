import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma/prisma.service';

import { ContactRequestDto } from '@admin/settings/dto/contact-request.dto';
import { CycleStartDateRequestDto } from '@admin/settings/dto/cycle-start-date-request.dto';
import { RedisService } from '@redis/redis.service';
import { UploadService } from '@upload/upload.service';
import { getTodayZeroDate } from '@utils';

@Injectable()
export class SettingsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly uploadService: UploadService
        // private readonly redisService: RedisService
    ) {}

    async findFirst() {
        return await this.prismaService.settings.findFirst();
    }

    async getSettingsDto() {
        // await this.redisService.set('ping', 'pong', 60);
        // const value = await this.redisService.get('ping');
        // console.log({ cachedValue: value });

        const settings = await this.findFirst();
        const socials = await this.prismaService.social.findMany();

        return { settings: { ...settings, socials } };
    }

    async updateCycleStartDate({ cycleStartDate }: CycleStartDateRequestDto) {
        const { id } = await this.findFirst();

        await this.prismaService.settings.update({
            where: { id },
            data: {
                cycleStartDate
            }
        });

        return await this.getSettingsDto();
    }

    async updateContactInfo({
        phoneNumber,
        email,
        socials
    }: ContactRequestDto) {
        const { id } = await this.findFirst();

        await this.prismaService.$transaction(async prisma => {
            await prisma.settings.update({
                where: { id },
                data: {
                    phoneNumber,
                    email
                }
            });

            const socialsData = await prisma.social.findMany({
                select: { icon: true }
            });

            for (const { icon } of socialsData) {
                if (!socials.find(social => social.icon == icon)) {
                    this.uploadService.delete(icon);
                }
            }

            await prisma.social.deleteMany();

            for (const data of socials) {
                await prisma.social.create({ data });
            }
        });

        return await this.getSettingsDto();
    }

    async getNextDeliveryDate(stepDays: number) {
        const { cycleStartDate } = await this.findFirst();
        const today = getTodayZeroDate();

        const diffDays = Math.floor(
            (today.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const offset = (stepDays - (diffDays % stepDays)) % stepDays;

        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + offset);

        return nextDate;
    }
}
