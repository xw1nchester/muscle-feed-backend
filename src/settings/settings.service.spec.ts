import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@prisma/prisma.service';

import { RedisService } from '@redis/redis.service';
import { WeekDay } from '@shared/enums/weekday.enum';
import { DeliveryMap } from '@shared/types/delivery-map.type';
import { UploadService } from '@upload/upload.service';

import { SettingsService } from './settings.service';

interface getDeliveryMapTestCase {
    name: string;
    resolvedDeliveryWeekdays: WeekDay[];
    expected: DeliveryMap;
}

// npm run test settings.service
describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettingsService,
                {
                    provide: PrismaService,
                    useValue: {}
                },
                {
                    provide: UploadService,
                    useValue: {}
                },
                {
                    provide: RedisService,
                    useValue: {}
                }
            ]
        }).compile();

        service = module.get<SettingsService>(SettingsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getDeliveryMap', () => {
        const otherSettings = {
            id: 1,
            cycleStartDate: new Date(),
            email: 'test@mail.ru',
            phoneNumber: '12345678'
        };

        const testCases: getDeliveryMapTestCase[] = [
            {
                name: 'mon + wed + sat',
                resolvedDeliveryWeekdays: [1, 3, 6],
                expected: {
                    '1': { isDelivery: true, daysToNext: 2 },
                    '2': { isDelivery: false, daysToNext: 1 },
                    '3': { isDelivery: true, daysToNext: 3 },
                    '4': { isDelivery: false, daysToNext: 2 },
                    '5': { isDelivery: false, daysToNext: 1 },
                    '6': { isDelivery: true, daysToNext: 2 },
                    '7': { isDelivery: false, daysToNext: 1 }
                }
            },
            {
                name: 'only monday',
                resolvedDeliveryWeekdays: [1],
                expected: {
                    '1': { isDelivery: true, daysToNext: 7 },
                    '2': { isDelivery: false, daysToNext: 6 },
                    '3': { isDelivery: false, daysToNext: 5 },
                    '4': { isDelivery: false, daysToNext: 4 },
                    '5': { isDelivery: false, daysToNext: 3 },
                    '6': { isDelivery: false, daysToNext: 2 },
                    '7': { isDelivery: false, daysToNext: 1 }
                }
            },
            {
                name: 'mon + tue + wed + thu + fri + sat + sun (every day)',
                resolvedDeliveryWeekdays: [1, 2, 3, 4, 5, 6, 7],
                expected: {
                    '1': { isDelivery: true, daysToNext: 1 },
                    '2': { isDelivery: true, daysToNext: 1 },
                    '3': { isDelivery: true, daysToNext: 1 },
                    '4': { isDelivery: true, daysToNext: 1 },
                    '5': { isDelivery: true, daysToNext: 1 },
                    '6': { isDelivery: true, daysToNext: 1 },
                    '7': { isDelivery: true, daysToNext: 1 }
                }
            },
            {
                name: 'weekends only (sat + sun)',
                resolvedDeliveryWeekdays: [6, 7],
                expected: {
                    '1': { isDelivery: false, daysToNext: 5 },
                    '2': { isDelivery: false, daysToNext: 4 },
                    '3': { isDelivery: false, daysToNext: 3 },
                    '4': { isDelivery: false, daysToNext: 2 },
                    '5': { isDelivery: false, daysToNext: 1 },
                    '6': { isDelivery: true, daysToNext: 1 },
                    '7': { isDelivery: true, daysToNext: 6 }
                }
            },
            {
                name: 'mid-week only (wed)',
                resolvedDeliveryWeekdays: [3],
                expected: {
                    '1': { isDelivery: false, daysToNext: 2 },
                    '2': { isDelivery: false, daysToNext: 1 },
                    '3': { isDelivery: true, daysToNext: 7 },
                    '4': { isDelivery: false, daysToNext: 6 },
                    '5': { isDelivery: false, daysToNext: 5 },
                    '6': { isDelivery: false, daysToNext: 4 },
                    '7': { isDelivery: false, daysToNext: 3 }
                }
            },
            {
                name: 'every 2 days (mon + wed + fri + sun)',
                resolvedDeliveryWeekdays: [1, 3, 5, 7],
                expected: {
                    '1': { isDelivery: true, daysToNext: 2 },
                    '2': { isDelivery: false, daysToNext: 1 },
                    '3': { isDelivery: true, daysToNext: 2 },
                    '4': { isDelivery: false, daysToNext: 1 },
                    '5': { isDelivery: true, daysToNext: 2 },
                    '6': { isDelivery: false, daysToNext: 1 },
                    '7': { isDelivery: true, daysToNext: 1 }
                }
            },
            {
                name: 'end-start wrap-around (fri + mon)',
                resolvedDeliveryWeekdays: [5, 1],
                expected: {
                    '1': { isDelivery: true, daysToNext: 4 },
                    '2': { isDelivery: false, daysToNext: 3 },
                    '3': { isDelivery: false, daysToNext: 2 },
                    '4': { isDelivery: false, daysToNext: 1 },
                    '5': { isDelivery: true, daysToNext: 3 },
                    '6': { isDelivery: false, daysToNext: 2 },
                    '7': { isDelivery: false, daysToNext: 1 }
                }
            },
            {
                name: 'alternate days (tue + thu + sat)',
                resolvedDeliveryWeekdays: [2, 4, 6],
                expected: {
                    '1': { isDelivery: false, daysToNext: 1 },
                    '2': { isDelivery: true, daysToNext: 2 },
                    '3': { isDelivery: false, daysToNext: 1 },
                    '4': { isDelivery: true, daysToNext: 2 },
                    '5': { isDelivery: false, daysToNext: 1 },
                    '6': { isDelivery: true, daysToNext: 3 },
                    '7': { isDelivery: false, daysToNext: 2 }
                }
            },
            {
                name: 'random mid-week (tue + fri)',
                resolvedDeliveryWeekdays: [2, 5],
                expected: {
                    '1': { isDelivery: false, daysToNext: 1 },
                    '2': { isDelivery: true, daysToNext: 3 },
                    '3': { isDelivery: false, daysToNext: 2 },
                    '4': { isDelivery: false, daysToNext: 1 },
                    '5': { isDelivery: true, daysToNext: 4 },
                    '6': { isDelivery: false, daysToNext: 3 },
                    '7': { isDelivery: false, daysToNext: 2 }
                }
            },
            {
                name: 'no one',
                resolvedDeliveryWeekdays: [],
                expected: {
                    '1': { isDelivery: false, daysToNext: undefined },
                    '2': { isDelivery: false, daysToNext: undefined },
                    '3': { isDelivery: false, daysToNext: undefined },
                    '4': { isDelivery: false, daysToNext: undefined },
                    '5': { isDelivery: false, daysToNext: undefined },
                    '6': { isDelivery: false, daysToNext: undefined },
                    '7': { isDelivery: false, daysToNext: undefined }
                }
            }
        ];

        test.each(testCases)(
            '$name',
            async ({ resolvedDeliveryWeekdays, expected }) => {
                jest.spyOn(service, 'findFirst').mockResolvedValue({
                    ...otherSettings,
                    deliveryWeekdays: resolvedDeliveryWeekdays
                });

                const result = await service.getDeliveryMap();

                expect(service.findFirst).toHaveBeenCalledTimes(1);
                expect(result).toStrictEqual(expected);
            }
        );
    });
});
