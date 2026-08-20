import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@prisma/prisma.service';

import { ContactRequestDto } from '@admin/settings/dto/contact-request.dto';
import { CycleStartDateRequestDto } from '@admin/settings/dto/cycle-start-date-request.dto';
import { DeliveryConfigDto } from '@admin/settings/dto/delivery-config.dto';
import { DeliveryCutoffConfigDto } from '@admin/settings/dto/delivery-cutoff-config.dto';
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
                  nextDayOrderCutoffEnabled: boolean;
                  nextDayOrderCutoffMinutes: number;
                  businessTimeZone: string;
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

        const hours = Math.floor(settings.nextDayOrderCutoffMinutes / 60);
        const minutes = settings.nextDayOrderCutoffMinutes % 60;

        return {
            settings: {
                id: settings.id,
                cycleStartDate: settings.cycleStartDate,
                deliveryWeekdays: settings.deliveryWeekdays,
                phoneNumber: settings.phoneNumber,
                email: settings.email,
                deliveryCutoff: {
                    enabled: settings.nextDayOrderCutoffEnabled,
                    hours,
                    minutes,
                    timeZone: settings.businessTimeZone
                },
                socials
            }
        };
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

    async updateDeliveryCutoffConfig(dto: DeliveryCutoffConfigDto) {
        const { id } = await this.findFirst();

        const nextDayOrderCutoffMinutes = dto.hours * 60 + dto.minutes;

        await this.prismaService.settings.update({
            where: { id },
            data: {
                nextDayOrderCutoffEnabled: dto.enabled,
                nextDayOrderCutoffMinutes,
                ...(dto.timeZone && { businessTimeZone: dto.timeZone })
            }
        });

        await this.redisService.clear();

        return await this.getSettingsDto();
    }

    private getZonedDateParts(date: Date, timeZone: string) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(date);

        const get = (type: string) =>
            Number(parts.find(part => part.type === type)?.value);

        return {
            year: get('year'),
            month: get('month'),
            day: get('day'),
            hour: get('hour'),
            minute: get('minute')
        };
    }

    private getZonedDateKey(date: Date, timeZone: string) {
        const { year, month, day } = this.getZonedDateParts(date, timeZone);

        return [
            year,
            String(month).padStart(2, '0'),
            String(day).padStart(2, '0')
        ].join('-');
    }

    private getTomorrowZonedDateKey(now: Date, timeZone: string) {
        const { year, month, day } = this.getZonedDateParts(now, timeZone);

        const tomorrow = new Date(Date.UTC(year, month - 1, day + 1, 12));

        return this.getZonedDateKey(tomorrow, timeZone);
    }

    async isNextDayOrderCutoffReached(deliveryDate: Date, now = new Date()) {
        const {
            nextDayOrderCutoffEnabled,
            nextDayOrderCutoffMinutes,
            businessTimeZone
        } = await this.findFirst();

        if (!nextDayOrderCutoffEnabled) {
            return false;
        }

        const nowParts = this.getZonedDateParts(now, businessTimeZone);
        const currentMinutes = nowParts.hour * 60 + nowParts.minute;

        if (currentMinutes < nextDayOrderCutoffMinutes) {
            return false;
        }

        const deliveryDateKey = this.getZonedDateKey(
            deliveryDate,
            businessTimeZone
        );

        const tomorrowDateKey = this.getTomorrowZonedDateKey(
            now,
            businessTimeZone
        );

        return deliveryDateKey === tomorrowDateKey;
    }
}
