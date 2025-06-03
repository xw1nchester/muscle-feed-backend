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
import { SettingsService } from '@settings/settings.service';
import { UploadService } from '@upload/upload.service';
import { UserService } from '@user/user.service';

import { WeekDay } from './enums/weekday.enum';
import { OrderService } from './order.service';

interface getDaysWithSkipInfoInput {
    firstDeliveryDate: Date;
    daysCount: number;
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

describe('OrderService', () => {
    let orderService: OrderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                PrismaService,
                MenuService,
                CityService,
                UserService,
                DishService,
                PromocodeService,
                ConfigService,
                SettingsService,
                UploadService
            ]
        }).compile();

        orderService = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(orderService).toBeDefined();
    });

    describe('getDaysWithSkipInfo', () => {
        const getDaysWithSkipInfoTestCases: getDaysWithSkipInfoTestCase[] = [
            {
                name: 'no skips',
                input: {
                    firstDeliveryDate: new Date('2025-06-10'),
                    daysCount: 4,
                    skippedWeekdays: [],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-06-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-11'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-12'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-13'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skips fridays 1',
                input: {
                    firstDeliveryDate: new Date('2025-06-10'),
                    daysCount: 4,
                    skippedWeekdays: [5],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-06-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-11'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-12'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-13'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skips fridays 2',
                input: {
                    firstDeliveryDate: new Date('2025-06-18'),
                    daysCount: 4,
                    skippedWeekdays: [5],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-06-18'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-19'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-20'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-21'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-22'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-23'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skips fridays 3',
                input: {
                    firstDeliveryDate: new Date('2025-06-12'),
                    daysCount: 4,
                    skippedWeekdays: [5],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-06-12'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-13'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-16'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-17'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skips fridays+saturdays 1',
                input: {
                    firstDeliveryDate: new Date('2025-06-10'),
                    daysCount: 4,
                    skippedWeekdays: [5, 6],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-06-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-11'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-12'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-13'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-16'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skips fridays+saturdays 2',
                input: {
                    firstDeliveryDate: new Date('2025-06-18'),
                    daysCount: 4,
                    skippedWeekdays: [5, 6],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-06-18'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-19'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-20'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-21'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-22'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-23'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-24'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skips fridays+saturdays 3',
                input: {
                    firstDeliveryDate: new Date('2025-06-12'),
                    daysCount: 4,
                    skippedWeekdays: [5, 6],
                    freezes: []
                },
                expected: [
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-16'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-17'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-18'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'no weekday skips, one freeze',
                input: {
                    firstDeliveryDate: new Date('2025-06-10'),
                    daysCount: 4,
                    skippedWeekdays: [],
                    freezes: [
                        {
                            startDate: new Date('2025-06-12'),
                            endDate: new Date('2025-06-13')
                        }
                    ]
                },
                expected: [
                    {
                        date: new Date('2025-06-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-11'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-12'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-06-13'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-16'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'no weekday skips, two freezes',
                input: {
                    firstDeliveryDate: new Date('2025-06-10'),
                    daysCount: 4,
                    skippedWeekdays: [],
                    freezes: [
                        {
                            startDate: new Date('2025-06-12'),
                            endDate: new Date('2025-06-13')
                        },
                        {
                            startDate: new Date('2025-06-15'),
                            endDate: new Date('2025-06-16')
                        }
                    ]
                },
                expected: [
                    {
                        date: new Date('2025-06-10'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-11'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-12'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-06-13'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-06-16'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-06-17'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-18'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'freezing the day after the first delivery',
                input: {
                    firstDeliveryDate: new Date('2025-06-10'),
                    daysCount: 4,
                    skippedWeekdays: [],
                    freezes: [
                        {
                            startDate: new Date('2025-06-11'),
                            endDate: new Date('2025-06-14')
                        }
                    ]
                },
                expected: [
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-16'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-17'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-18'),
                        isSkipped: false,
                        daySkipType: null
                    }
                ]
            },
            {
                name: 'skips fridays+saturdays and one freeze',
                input: {
                    firstDeliveryDate: new Date('2025-06-12'),
                    daysCount: 5,
                    skippedWeekdays: [5, 6],
                    freezes: [
                        {
                            startDate: new Date('2025-06-19'),
                            endDate: new Date('2025-06-19')
                        }
                    ]
                },
                expected: [
                    {
                        date: new Date('2025-06-14'),
                        isSkipped: true,
                        daySkipType: DaySkipType.DELIVERY_ONLY
                    },
                    {
                        date: new Date('2025-06-15'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-16'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-17'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-18'),
                        isSkipped: false,
                        daySkipType: null
                    },
                    {
                        date: new Date('2025-06-19'),
                        isSkipped: true,
                        daySkipType: DaySkipType.FROZEN
                    },
                    {
                        date: new Date('2025-06-20'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-21'),
                        isSkipped: true,
                        daySkipType: DaySkipType.WEEKDAY_SKIPPED
                    },
                    {
                        date: new Date('2025-06-22'),
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
                    input.firstDeliveryDate,
                    input.daysCount,
                    input.skippedWeekdays,
                    input.freezes
                );
                expect(result).toEqual(expected);
            }
        );
    });
});
