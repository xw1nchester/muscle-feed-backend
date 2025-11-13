// npm run test
// npm run test src/order/order.service.spec.ts
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { DaySkipType } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { FreezeDto } from '@admin/order/dto/admin-order-request.dto';
import { CityService } from '@city/city.service';
import { DishService } from '@dish/dish.service';
import { MenuService } from '@menu/menu.service';
import { PromocodeService } from '@promocode/promocode.service';
import { RedisService } from '@redis/redis.service';
import { SettingsService } from '@settings/settings.service';
import { WeekDay } from '@shared/enums/weekday.enum';
import { DeliveryMap } from '@shared/types/delivery-map.type';
import { UploadService } from '@upload/upload.service';
import { UserService } from '@user/user.service';

import { OrderService } from './order.service';

interface getDaysWithSkipInfoInput {
    initialFirstDeliveryDate: Date;
    daysCount: number;
    deliveryMap: DeliveryMap;
    skippedWeekdays: WeekDay[];
    freezes: FreezeDto[];
}

interface getDaysWithSkipInfoInputOutputItem {
    date: Date;
    isSkipped: boolean;
    daySkipType: DaySkipType;
}

interface getDaysWithSkipInfoTestCase {
    name: string;
    input: getDaysWithSkipInfoInput;
    expected: getDaysWithSkipInfoInputOutputItem[];
}

// npm run test order.service
describe('OrderService', () => {
    let orderService: OrderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: PrismaService,
                    useValue: {}
                },
                {
                    provide: MenuService,
                    useValue: {}
                },
                {
                    provide: CityService,
                    useValue: {}
                },
                {
                    provide: UserService,
                    useValue: {}
                },
                {
                    provide: DishService,
                    useValue: {}
                },
                {
                    provide: PromocodeService,
                    useValue: {}
                },
                {
                    provide: ConfigService,
                    useValue: {}
                },
                {
                    provide: SettingsService,
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

        orderService = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(orderService).toBeDefined();
    });

    describe('getDaysWithSkipInfo', () => {
        const deliveryMap: DeliveryMap = {
            '1': {
                isDelivery: false,
                daysToNext: 1
            },
            '2': {
                isDelivery: true,
                daysToNext: 2
            },
            '3': {
                isDelivery: false,
                daysToNext: 1
            },
            '4': {
                isDelivery: true,
                daysToNext: 5
            },
            '5': {
                isDelivery: false,
                daysToNext: 4
            },
            '6': {
                isDelivery: false,
                daysToNext: 3
            },
            '7': {
                isDelivery: false,
                daysToNext: 2
            }
        };

        const getDaysWithSkipInfoTestCases: getDaysWithSkipInfoTestCase[] = [
            {
                name: 'no skips',
                input: {
                    initialFirstDeliveryDate: new Date('2025-10-07'),
                    daysCount: 4,
                    deliveryMap,
                    skippedWeekdays: [],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-10-07'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-10-08'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-09'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-10'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-11'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skip friday',
                input: {
                    initialFirstDeliveryDate: new Date('2025-10-07'),
                    daysCount: 4,
                    deliveryMap,
                    skippedWeekdays: [5],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-10-07'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-10-08'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-09'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-10-11'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-12'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skip friday+saturday',
                input: {
                    initialFirstDeliveryDate: new Date('2025-10-07'),
                    daysCount: 4,
                    deliveryMap,
                    skippedWeekdays: [5, 6],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-10-07'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-10-08'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-09'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-10-11'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-10-12'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-13'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'freeze one nearest day',
                input: {
                    initialFirstDeliveryDate: new Date('2025-10-07'),
                    daysCount: 4,
                    deliveryMap,
                    skippedWeekdays: [],
                    freezes: [
                        {
                            startDate: new Date('2025-10-08'),
                            endDate: new Date('2025-10-08')
                        }
                    ]
                },
                expected: [
                    {
                        date: new Date('2025-10-07'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-10-08'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-10-09'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-10'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-11'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-12'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'freeze all days for the next delivery',
                input: {
                    initialFirstDeliveryDate: new Date('2025-10-09'),
                    daysCount: 4,
                    deliveryMap,
                    skippedWeekdays: [],
                    freezes: [
                        {
                            startDate: new Date('2025-10-10'),
                            endDate: new Date('2025-10-11')
                        },
                        {
                            startDate: new Date('2025-10-12'),
                            endDate: new Date('2025-10-14')
                        }
                    ]
                },
                expected: [
                    {
                        date: new Date('2025-10-14'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-10-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-16'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-17'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-18'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'incorrect initial delivery date',
                input: {
                    initialFirstDeliveryDate: new Date('2025-10-11'),
                    daysCount: 4,
                    deliveryMap,
                    skippedWeekdays: [],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-10-14'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-10-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-16'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-17'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-18'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'mixed cases',
                input: {
                    initialFirstDeliveryDate: new Date('2025-10-09'),
                    daysCount: 4,
                    deliveryMap,
                    skippedWeekdays: [3, 4],
                    freezes: [
                        {
                            startDate: new Date('2025-10-10'),
                            endDate: new Date('2025-10-11')
                        }
                    ]
                },
                expected: [
                    {
                        date: new Date('2025-10-09'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-10-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-10-11'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-10-12'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-13'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-14'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-10-15'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-10-16'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-10-17'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            }
        ];

        test.each(getDaysWithSkipInfoTestCases)(
            '$name',
            async ({ input, expected }) => {
                const result = orderService.getDaysWithSkipInfo(
                    input.initialFirstDeliveryDate,
                    input.daysCount,
                    input.deliveryMap,
                    input.skippedWeekdays,
                    input.freezes
                );
                expect(result).toEqual(expected);
            }
        );
    });

    // тесты для старой логики getDaysWithSkipInfo
    // describe('getDaysWithSkipInfo', () => {
    //     const getDaysWithSkipInfoTestCases: getDaysWithSkipInfoTestCase[] = [
    //         {
    //             name: 'no skips',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-10'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [],
    //                 freezes: []
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-10'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-11'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-12'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-13'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'skips fridays 1',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-10'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [5],
    //                 freezes: []
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-10'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-11'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-12'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-13'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'skips fridays 2',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-18'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [5],
    //                 freezes: []
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-18'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-19'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-20'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-21'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-22'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-23'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'skips fridays 3',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-12'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [5],
    //                 freezes: []
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-12'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-13'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-16'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-17'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'skips fridays+saturdays 1',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-10'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [5, 6],
    //                 freezes: []
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-10'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-11'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-12'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-13'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-16'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'skips fridays+saturdays 2',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-18'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [5, 6],
    //                 freezes: []
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-18'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-19'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-20'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-21'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-22'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-23'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-24'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'skips fridays+saturdays 3',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-12'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [5, 6],
    //                 freezes: []
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-16'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-17'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-18'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'no weekday skips, one freeze',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-10'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [],
    //                 freezes: [
    //                     {
    //                         startDate: new Date('2025-06-12'),
    //                         endDate: new Date('2025-06-13')
    //                     }
    //                 ]
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-10'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-11'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-12'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.FROZEN
    //                 },
    //                 {
    //                     date: new Date('2025-06-13'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.FROZEN
    //                 },
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-16'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'no weekday skips, two freezes',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-10'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [],
    //                 freezes: [
    //                     {
    //                         startDate: new Date('2025-06-12'),
    //                         endDate: new Date('2025-06-13')
    //                     },
    //                     {
    //                         startDate: new Date('2025-06-15'),
    //                         endDate: new Date('2025-06-16')
    //                     }
    //                 ]
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-10'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-11'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-12'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.FROZEN
    //                 },
    //                 {
    //                     date: new Date('2025-06-13'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.FROZEN
    //                 },
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.FROZEN
    //                 },
    //                 {
    //                     date: new Date('2025-06-16'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.FROZEN
    //                 },
    //                 {
    //                     date: new Date('2025-06-17'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-18'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'freezing the day after the first delivery',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-10'),
    //                 daysCount: 4,
    //                 skippedWeekdays: [],
    //                 freezes: [
    //                     {
    //                         startDate: new Date('2025-06-11'),
    //                         endDate: new Date('2025-06-14')
    //                     }
    //                 ]
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-16'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-17'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-18'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'skips fridays+saturdays and one freeze',
    //             input: {
    //                 firstDeliveryDate: new Date('2025-06-12'),
    //                 daysCount: 5,
    //                 skippedWeekdays: [5, 6],
    //                 freezes: [
    //                     {
    //                         startDate: new Date('2025-06-19'),
    //                         endDate: new Date('2025-06-19')
    //                     }
    //                 ]
    //             },
    //             expected: [
    //                 {
    //                     date: new Date('2025-06-14'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.DELIVERY_ONLY
    //                 },
    //                 {
    //                     date: new Date('2025-06-15'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-16'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-17'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-18'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 },
    //                 {
    //                     date: new Date('2025-06-19'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.FROZEN
    //                 },
    //                 {
    //                     date: new Date('2025-06-20'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-21'),
    //                     isSkipped: true,
    //                     daySkipType: DaySkipType.WEEKDAY_SKIPPED
    //                 },
    //                 {
    //                     date: new Date('2025-06-22'),
    //                     isSkipped: false,
    //                     daySkipType: null
    //                 }
    //             ]
    //         }
    //     ];

    //     test.each(getDaysWithSkipInfoTestCases)(
    //         '$name',
    //         async ({ input, expected }) => {
    //             const result = orderService.getDaysWithSkipInfo(
    //                 input.firstDeliveryDate,
    //                 input.daysCount,
    //                 input.skippedWeekdays,
    //                 input.freezes
    //             );
    //             expect(result).toEqual(expected);
    //         }
    //     );
    // });
});
