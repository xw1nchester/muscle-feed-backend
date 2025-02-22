import { Border, Workbook } from 'exceljs';
import { Response } from 'express';

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

import { AdminOrderRequestDto } from '@admin/order/dto/admin-order-request.dto';
import { CityService } from '@city/city.service';
import { DishService } from '@dish/dish.service';
import { PaginationDto } from '@dto/pagination.dto';
import { MenuService } from '@menu/menu.service';
import { UserService } from '@user/user.service';

import { OrderRequestDto } from './dto/order-request.dto';
import { SelectDishDto } from './dto/select-dish.dto';
import { OrderStatus } from './enums/order-status.enum';
import { WeekDay } from './enums/weekday.enum';

@Injectable()
export class OrderService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly menuService: MenuService,
        private readonly cityService: CityService,
        private readonly userService: UserService,
        private readonly dishService: DishService
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

    getInclude() {
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
            include: this.getInclude()
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
            startDate: orderDays[0].date,
            endDate: orderDays[orderDays.length - 1].date,
            skippedWeekdays: [...new Set(skippedWeekdays)],
            paymentMethod: this.createPaymentMethodDto(paymentMethod),
            isPaid
        };
    }

    async createDtoById(id: number) {
        const order = await this.getById(id);

        return { order: this.createDto(order) };
    }

    // TODO: проверять чтобы дата была не раньше ближайшей даты доставки (вынести дату начала доставки в env)
    async validateOrderStartDate(startDate: Date) {
        if (startDate < new Date()) {
            throw new BadRequestException('Некорректная дата начала заказа');
        }
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
        await this.validateOrderStartDate(startDate);

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

        console.log({ where });

        const skip = (page - 1) * limit;

        const ordersData = await this.orderRepository.findMany({
            where,
            include: this.getInclude(),
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
                user: userId ? this.userService.createDto(user) : null,
                city: this.cityService.createDto(city),
                paymentMethod: this.createPaymentMethodDto(paymentMethod),
                menu: this.menuService.createShortDto(menu),
                daysCount: notSkippedDays.length,
                daysLeft,
                startDate: orderDays[0].date,
                endDate: orderDays[orderDays.length - 1].date,
                skippedWeekdays
            }
        };
    }

    async adminCreate({
        startDate,
        cityId,
        paymentMethodId,
        userId,
        daysCount,
        skippedWeekdays,
        menuId,
        ...rest
    }: AdminOrderRequestDto) {
        await this.validateOrderStartDate(startDate);

        await this.cityService.getById(cityId);

        await this.getPaymentMethodById(paymentMethodId);

        await this.userService.getById(userId);

        await this.menuService.getById(menuId, true);

        const createdOrder = await this.orderRepository.create({
            data: {
                cityId,
                paymentMethodId,
                userId,
                menuId,
                ...rest
            }
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

    async update(
        id: number,
        {
            startDate,
            cityId,
            paymentMethodId,
            userId,
            daysCount,
            skippedWeekdays,
            menuId,
            ...rest
        }: AdminOrderRequestDto
    ) {
        const existingOrder = await this.getById(id);

        await this.validateOrderStartDate(startDate);

        await this.cityService.getById(cityId);

        await this.getPaymentMethodById(paymentMethodId);

        await this.userService.getById(userId);

        // await this.menuService.getById(menuId, true);

        const updatedOrder = await this.orderRepository.update({
            where: { id },
            data: {
                cityId,
                paymentMethodId,
                userId: userId ?? null,
                // menuId,
                ...rest
            },
            include: this.getInclude()
        });

        // TODO: сделать возможность корректировки дней/даты начала в заказе если переданное dayCount отличается от старого значения

        return { order: this.createDto(updatedOrder) };
    }

    async findOrderDays(id: number, userId: number) {
        const existingOrder = await this.orderRepository.findFirst({
            where: { id, userId },
            select: {
                orderDays: {
                    select: {
                        id: true,
                        date: true,
                        isSkipped: true,
                        daySkipType: true
                    },
                    orderBy: { date: 'asc' }
                }
            }
        });

        if (!existingOrder) {
            throw new NotFoundException('Заказ не найден');
        }

        return { days: existingOrder.orderDays };
    }

    async getSelectedOrderDayDishes(dayId: number, userId: number) {
        const existingOrderDay = await this.orderDayRepository.findFirst({
            where: {
                id: dayId,
                order: { userId }
            },
            select: {
                orderDayDishes: {
                    where: { isSelected: true },
                    select: { dish: { include: { dishType: true } } },
                    orderBy: { dishTypeId: 'asc' }
                }
            }
        });

        if (!existingOrderDay) {
            throw new NotFoundException('День не найден');
        }

        const dishes = existingOrderDay.orderDayDishes.map(orderDayDish =>
            this.dishService.createDto(orderDayDish.dish)
        );

        const total = this.menuService.calculateTotalNutrients(dishes);

        return { dishes, total };
    }

    async getReplacementOrderDayDishes(
        dayId: number,
        dishTypeId: number,
        userId: number
    ) {
        const existingOrderDay = await this.orderDayRepository.findFirst({
            where: {
                id: dayId,
                order: { userId }
            },
            select: {
                orderDayDishes: {
                    where: { dishTypeId, isSelected: false },
                    select: { dish: { include: { dishType: true } } }
                }
            }
        });

        if (!existingOrderDay) {
            throw new NotFoundException('День не найден');
        }

        const dishes = existingOrderDay.orderDayDishes.map(orderDayDish =>
            this.dishService.createDto(orderDayDish.dish)
        );

        return { dishes };
    }

    async selectDish(
        { dayId, dishTypeId, dishId }: SelectDishDto,
        userId: number
    ) {
        const existingOrderDish = await this.orderDayDishRepository.findFirst({
            where: {
                dishTypeId,
                dishId,
                orderDay: { id: dayId, order: { userId } }
            },
            select: { isSelected: true, dish: { include: { dishType: true } } }
        });

        if (!existingOrderDish) {
            throw new NotFoundException('Блюдо не найдено');
        }

        if (!existingOrderDish.isSelected) {
            await this.orderDayDishRepository.updateMany({
                where: {
                    dishTypeId,
                    isSelected: true,
                    orderDay: { id: dayId }
                },
                data: {
                    isSelected: false
                }
            });

            await this.orderDayDishRepository.updateMany({
                where: {
                    dishTypeId,
                    dishId,
                    orderDay: { id: dayId }
                },
                data: {
                    isSelected: true
                }
            });
        }

        return { dish: this.dishService.createDto(existingOrderDish.dish) };
    }

    async getRouteList(res: Response, startDate: Date, endDate: Date) {
        const orders = await this.orderRepository.findMany({
            select: {
                id: true,
                fullName: true,
                phone: true,
                city: true,
                street: true,
                house: true,
                floor: true,
                apartment: true,
                comment: true
            },
            where: {
                orderDays: { some: { date: { gte: startDate, lte: endDate } } }
            }
        });

        const workbook = new Workbook();

        const worksheet = workbook.addWorksheet();

        worksheet.columns = [
            { header: '#', key: 'id' },
            { header: 'Заказчик', key: 'fullName', width: 20 },
            { header: 'Телефон', key: 'phone', width: 20 },
            { header: 'Адрес', key: 'address', width: 50 },
            { header: 'Комментарий', key: 'comment', width: 100 }
        ];

        worksheet.spliceRows(1, 0, []);

        const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

        const titleRow = worksheet.getRow(1);
        titleRow.getCell(1).value = dateRange;

        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);

        titleRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const headerRow = worksheet.getRow(2);

        headerRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        for (const {
            id,
            fullName,
            phone,
            city,
            street,
            house,
            floor,
            apartment,
            comment
        } of orders) {
            let address = `${city.nameHe}, ${street} ${house}`;

            if (floor) {
                address += `, ${floor} этаж`;
            }

            if (apartment) {
                address += `, кв. ${apartment}`;
            }

            const row = worksheet.addRow({
                id,
                fullName,
                phone,
                address,
                comment
            });

            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                    wrapText: true
                };
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return res
            .set('Content-Disposition', `attachment; filename=route_list.xlsx`)
            .send(buffer);
    }

    async getDishList(date: Date) {
        const ordersData = await this.orderRepository.findMany({
            select: {
                id: true,
                menu: true,
                orderDays: {
                    where: {
                        date
                    },
                    select: {
                        orderDayDishes: {
                            where: { isSelected: true },
                            select: { dish: { include: { dishType: true } } },
                            orderBy: { dishTypeId: 'asc' }
                        }
                    }
                }
            },
            where: {
                orderDays: {
                    some: {
                        date,
                        isSkipped: false,
                        daySkipType: null
                    }
                }
            }
        });

        const orders = ordersData.map(({ id, menu, orderDays }) => {
            const dishes = orderDays.flatMap(({ orderDayDishes }) =>
                orderDayDishes.map(({ dish }) =>
                    this.dishService.createDto(dish)
                )
            );

            const total = this.menuService.calculateTotalNutrients(dishes);

            return {
                id,
                menu: this.menuService.createShortDto(menu),
                dishes,
                total
            };
        });

        return { orders };
    }
}
