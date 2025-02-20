import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import {
    City,
    DaySkipType,
    Menu,
    Order,
    OrderDay,
    PaymentMethod,
    Prisma
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { CityService } from '@city/city.service';
import { PaginationDto } from '@dto/pagination.dto';
import { MenuService } from '@menu/menu.service';
import { UserService } from '@user/user.service';

import { OrderRequestDto } from './dto/order-request.dto';
import { OrderStatus } from './enums/order-status.enum';
import { WeekDay } from './enums/weekday.enum';

@Injectable()
export class OrderService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly menuService: MenuService,
        private readonly cityService: CityService,
        private readonly userService: UserService
    ) {}

    private get paymentMethodRepository() {
        return this.prismaService.paymentMethod;
    }

    private get orderRepository() {
        return this.prismaService.order;
    }

    private get orderDayRepository() {
        return this.prismaService.orderDay;
    }

    private get orderDayDishRepository() {
        return this.prismaService.orderDayDish;
    }

    async getPaymentMethodById(id: number) {
        const paymentMethod = await this.paymentMethodRepository.findFirst({
            where: { id }
        });

        if (!paymentMethod) {
            throw new NotFoundException('Способ оплаты не найден');
        }

        return paymentMethod;
    }

    createPaymentMethodDto(paymentMethod: PaymentMethod) {
        const { id, nameRu, nameHe } = paymentMethod;

        return {
            id,
            name: { ru: nameRu, he: nameHe }
        };
    }

    async getPaymentMethods() {
        const paymentMethodsData =
            await this.paymentMethodRepository.findMany();

        const paymentMethods = paymentMethodsData.map(method =>
            this.createPaymentMethodDto(method)
        );

        return { paymentMethods };
    }

    getBasicInclude() {
        // TODO: извлекать только нужные поля
        return {
            menu: true,
            orderDays: { orderBy: { date: Prisma.SortOrder.asc } },
            paymentMethod: true,
            city: true,
            user: true
        };
    }

    async getById(id: number) {
        const order = await this.orderRepository.findFirst({
            where: { id },
            include: this.getBasicInclude()
        });

        if (!order) {
            throw new NotFoundException('Заказ не найден');
        }

        return order;
    }

    createDto(
        order: Order & { menu: Menu } & { orderDays: OrderDay[] } & {
            paymentMethod: PaymentMethod;
        } & { city: City }
    ) {
        const {
            id,
            orderDays,
            createdAt,
            fullName,
            email,
            phone,
            allergies,
            finalPrice,
            city,
            street,
            house,
            floor,
            apartment,
            menu,
            comment,
            paymentMethod,
            isPaid
        } = order;

        const notSkippedDays = orderDays.filter(
            orderDay => !orderDay.isSkipped
        );

        const currentDate = new Date();

        const daysLeft = notSkippedDays.filter(
            orderDay => orderDay.date > currentDate
        ).length;

        // TODO: получать из заказа, а не вычислять динамически
        const skippedWeekdays = orderDays
            .filter(
                orderDay =>
                    orderDay.isSkipped &&
                    orderDay.daySkipType == DaySkipType.WEEKDAY_SKIPPED
            )
            .map(skippedOrderDay =>
                skippedOrderDay.date.getDay() === 0
                    ? 7
                    : skippedOrderDay.date.getDay()
            );

        return {
            id,
            createdAt,
            fullName,
            email,
            phone,
            allergies,
            finalPrice,
            menu: this.menuService.createShortDto(menu),
            city: this.cityService.createDto(city),
            street,
            house,
            floor,
            apartment,
            comment,
            daysCount: notSkippedDays.length,
            daysLeft,
            deliveryStartDate: orderDays[0].date,
            deliveryEndDate: orderDays[orderDays.length - 1].date,
            skippedWeekdays,
            paymentMethod: this.createPaymentMethodDto(paymentMethod),
            isPaid
        };
    }

    async createDtoById(id: number) {
        const order = await this.getById(id);

        return { order: this.createDto(order) };
    }

    async create(
        {
            startDate,
            daysCount,
            skippedWeekdays,
            menuId,
            ...rest
        }: OrderRequestDto,
        userId: number | null
    ) {
        // TODO: проверять чтобы дата была не раньше ближайшей даты доставки (вынести дату начала доставки в env)
        if (startDate < new Date()) {
            throw new BadRequestException('Некорректная дата начала заказа');
        }

        await this.cityService.getById(rest.cityId);

        await this.getPaymentMethodById(rest.paymentMethodId);

        const price = await this.menuService.getMenuPriceByDays(
            menuId,
            daysCount
        );

        // // TODO: в будущем определять promocodeDiscount, finalPrice в зависимости от промокода

        const createdOrder = await this.orderRepository.create({
            data: { ...rest, menuId, userId, price, finalPrice: price }
        });

        if (menuId != undefined) {
            await this.createOrderPlanByMenu(
                startDate,
                daysCount,
                skippedWeekdays,
                menuId,
                createdOrder.id
            );
        }

        return await this.createDtoById(createdOrder.id);
    }

    private getDaysWithSkipInfo(
        startDate: Date,
        daysCount: number,
        skippedWeekdays: WeekDay[]
    ) {
        const orderDays: { date: Date; isSkipped: boolean }[] = [];
        const currentDate = new Date(startDate);
        let addedDays = 0;

        while (addedDays < daysCount) {
            const currentWeekDay =
                currentDate.getDay() == 0 ? 7 : currentDate.getDay();
            const isSkipped = skippedWeekdays.includes(currentWeekDay);

            orderDays.push({
                date: new Date(currentDate),
                isSkipped
            });

            if (!isSkipped) {
                addedDays++;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return orderDays;
    }

    private async createOrderPlanByMenu(
        startDate: Date,
        daysCount: number,
        skippedWeekdays: WeekDay[],
        menuId: number,
        orderId: number
    ) {
        const orderDays = this.getDaysWithSkipInfo(
            startDate,
            daysCount,
            skippedWeekdays
        );

        const planData = await this.menuService.getMealPlan(
            menuId,
            startDate,
            orderDays.length
        );

        for (let i = 0; i < orderDays.length; i++) {
            const { date, isSkipped } = orderDays[i];

            const createdOrderDay = await this.orderDayRepository.create({
                data: {
                    orderId,
                    date,
                    isSkipped,
                    daySkipType: isSkipped ? DaySkipType.WEEKDAY_SKIPPED : null
                }
            });

            if (isSkipped) {
                continue;
            }

            for (const { dishTypeId, dish, isPrimary } of planData[i].dishes) {
                await this.orderDayDishRepository.create({
                    data: {
                        orderDayId: createdOrderDay.id,
                        dishTypeId,
                        dishId: dish.id,
                        isSelected: isPrimary
                    }
                });
            }
        }
    }

    private getStatusesConditions() {
        // TODO: возможно придется создавать новую дату через строку вида 2025-10-27
        // при получении getMonth() прибавлять 1
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setTime(today.getTime() - today.getTimezoneOffset() * 60000);

        // TODO: возможно стоит вынести 4 в env
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + 4);

        return {
            activeCondition: {
                isProcessed: true,
                orderDays: {
                    some: {
                        OR: [
                            { date: today, daySkipType: null },
                            {
                                date: today,
                                daySkipType: DaySkipType.WEEKDAY_SKIPPED
                            }
                        ]
                    }
                }
            },
            frozenCondition: {
                isProcessed: true,
                orderDays: {
                    some: {
                        date: today,
                        daySkipType: DaySkipType.FROZEN
                    }
                }
            },
            unpaidCondition: {
                isProcessed: true,
                isPaid: false
            },
            completedCondition: {
                orderDays: { every: { date: { lt: today } } }
            },
            pendingCondition: {
                isProcessed: true,
                orderDays: { every: { date: { gt: today } } }
            },
            terminatingCondition: {
                isProcessed: true,
                AND: [
                    {
                        orderDays: {
                            some: {
                                date: { gte: today }
                            }
                        }
                    },
                    {
                        orderDays: {
                            every: {
                                date: { lte: expiryDate }
                            }
                        }
                    }
                ]
            },
            unprocessedCondition: { isProcessed: false }
        };
    }

    // TODO: пользователь тоже может запрашивать статистику?
    async getStats() {
        const {
            activeCondition,
            frozenCondition,
            unpaidCondition,
            completedCondition,
            pendingCondition,
            terminatingCondition,
            unprocessedCondition
        } = this.getStatusesConditions();

        const [
            allCount,
            activeCount,
            frozenCount,
            unpaidCount,
            completedCount,
            pendingCount,
            terminatingCount,
            unprocessedCount
        ] = await Promise.all([
            this.orderRepository.aggregate({
                _count: { id: true }
            }),
            this.orderRepository.aggregate({
                _count: { id: true },
                where: activeCondition
            }),
            this.orderRepository.aggregate({
                _count: { id: true },
                where: frozenCondition
            }),
            this.orderRepository.aggregate({
                _count: { id: true },
                where: unpaidCondition
            }),
            this.orderRepository.aggregate({
                _count: { id: true },
                where: completedCondition
            }),
            this.orderRepository.aggregate({
                _count: { id: true },
                where: pendingCondition
            }),
            this.orderRepository.aggregate({
                _count: { id: true },
                where: terminatingCondition
            }),
            this.orderRepository.aggregate({
                _count: { id: true },
                where: unprocessedCondition
            })
        ]);

        return {
            stats: {
                allCount: allCount._count.id,
                activeCount: activeCount._count.id,
                frozenCount: frozenCount._count.id,
                unpaidCount: unpaidCount._count.id,
                completedCount: completedCount._count.id,
                pendingCount: pendingCount._count.id,
                terminatingCount: terminatingCount._count.id,
                unprocessedCount: unprocessedCount._count.id
            }
        };
    }

    async find({
        page,
        limit,
        userId,
        status
    }: {
        page: number;
        limit: number;
        userId?: number;
        status?: OrderStatus;
    }) {
        const {
            activeCondition,
            frozenCondition,
            unpaidCondition,
            completedCondition,
            pendingCondition,
            terminatingCondition,
            unprocessedCondition
        } = this.getStatusesConditions();

        const where = {
            ...(userId != undefined && { userId }),
            ...(status == OrderStatus.ACTIVE && activeCondition),
            ...(status == OrderStatus.FROZEN && frozenCondition),
            ...(status == OrderStatus.UNPAID && unpaidCondition),
            ...(status == OrderStatus.COMPLETED && completedCondition),
            ...(status == OrderStatus.PENDING && pendingCondition),
            ...(status == OrderStatus.TERMINATING && terminatingCondition),
            ...(status == OrderStatus.UNPROCESSED && unprocessedCondition)
        };

        const skip = (page - 1) * limit;

        const ordersData = await this.orderRepository.findMany({
            where,
            include: this.getBasicInclude(),
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const orders = ordersData.map(order => this.createDto(order));

        const totalCount = await this.orderRepository.aggregate({
            _count: { id: true },
            where
        });

        return new PaginationDto(
            'orders',
            orders,
            totalCount._count.id,
            limit,
            page
        );
    }

    async getAdminInfoById(id: number) {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
            userId,
            cityId,
            paymentMethodId,
            menuId,
            user,
            city,
            menu,
            orderDays,
            paymentMethod,
            ...rest
        } = await this.getById(id);
        /* eslint-enable @typescript-eslint/no-unused-vars */

        const notSkippedDays = orderDays.filter(
            orderDay => !orderDay.isSkipped
        );

        const currentDate = new Date();

        const daysLeft = notSkippedDays.filter(
            orderDay => orderDay.date > currentDate
        ).length;

        // TODO: получать из заказа, а не вычислять динамически
        const skippedWeekdays = orderDays
            .filter(
                orderDay =>
                    orderDay.isSkipped &&
                    orderDay.daySkipType == DaySkipType.WEEKDAY_SKIPPED
            )
            .map(skippedOrderDay =>
                skippedOrderDay.date.getDay() === 0
                    ? 7
                    : skippedOrderDay.date.getDay()
            );

        return {
            order: {
                ...rest,
                user: this.userService.createDto(user),
                city: this.cityService.createDto(city),
                paymentMethod: this.createPaymentMethodDto(paymentMethod),
                menu: this.menuService.createShortDto(menu),
                daysCount: notSkippedDays.length,
                daysLeft,
                deliveryStartDate: orderDays[0].date,
                deliveryEndDate: orderDays[orderDays.length - 1].date,
                skippedWeekdays
            }
        };
    }
}
