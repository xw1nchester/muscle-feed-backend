import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@prisma/prisma.service';

import { ContactRequestDto } from '@admin/settings/dto/contact-request.dto';
import { CycleStartDateRequestDto } from '@admin/settings/dto/cycle-start-date-request.dto';
import { DeliveryConfigDto } from '@admin/settings/dto/delivery-config.dto';
import { RedisService } from '@redis/redis.service';
import { DeliveryMap } from '@shared/types/delivery-map.type';
import { UploadService } from '@upload/upload.service';
import { addDays, getTodayZeroDate, getWeekdayNumber } from '@utils';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly uploadService: UploadService,
        private readonly redisService: RedisService
    ) {}

    async findFirst() {
        const cacheKey = 'settings';

        const cached = (await this.redisService.get(cacheKey)) as
            | {
                  id: number;
                  cycleStartDate: Date;
                  deliveryWeekdays: number[];
                  phoneNumber: string;
                  email: string;
              }
            | undefined;

        if (cached) {
            this.logger.debug(`Received settings from the cache`);
            return cached;
        }

        const settings = await this.prismaService.settings.findFirst();

        this.redisService.set(cacheKey, JSON.stringify(settings), 0);

        this.logger.debug(`Cached settings`);

        return settings;
    }

    async getSettingsDto() {
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

        // await this.redisService.del('settings');
        await this.redisService.clear();

        return await this.getSettingsDto();
    }

    async updateDeliveryConfig(dto: DeliveryConfigDto) {
        const deliveryWeekdays = [...new Set(dto.deliveryWeekdays)];

        if (deliveryWeekdays.length == 0) {
            throw new BadRequestException(
                'Необходимо выбрать хотя бы один день недели'
            );
        }

        const { id } = await this.findFirst();

        await this.prismaService.settings.update({
            where: { id },
            data: {
                deliveryWeekdays: deliveryWeekdays.sort((a, b) => a - b)
            }
        });

        // await this.redisService.del('settings');
        await this.redisService.clear();

        return await this.getSettingsDto();
    }

    async getDeliveryMap(): Promise<DeliveryMap> {
        const { deliveryWeekdays } = await this.findFirst();
        const deliveryMap = {} as DeliveryMap;

        for (let day = 1; day <= 7; day++) {
            const daysToNext = deliveryWeekdays
                .map(d => (d > day ? d - day : d + 7 - day))
                .sort((a, b) => a - b)[0];
            deliveryMap[day] = {
                isDelivery: deliveryWeekdays.includes(day),
                daysToNext
            };
        }

        return deliveryMap;
    }

    async isDeliveryDate(date: Date) {
        const { deliveryWeekdays } = await this.findFirst();
        const weekday = getWeekdayNumber(date);
        return deliveryWeekdays.includes(weekday);
    }

    async getNextDeliveryDate() {
        const today = getTodayZeroDate();
        const weekday = getWeekdayNumber(today);
        const deliveryMap = await this.getDeliveryMap();
        const diff = deliveryMap[weekday].daysToNext;
        return addDays(today, diff);
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

        await this.redisService.del('settings');

        return await this.getSettingsDto();
    }
}
