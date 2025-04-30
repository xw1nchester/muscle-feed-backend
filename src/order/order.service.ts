import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    City,
    DaySkipType,
    Menu,
    MenuType,
    Order,
    OrderChangeRequest,
    OrderDay,
    OrderDayDish,
    PaymentMethod,
    Prisma
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { AdminOrderRequestDto } from '@admin/order/dto/admin-order-request.dto';
import { OrderChangeRequestUpdateDto } from '@admin/order/dto/order-change-request-update.dto';
import { CityService } from '@city/city.service';
import { DishService } from '@dish/dish.service';
import { PaginationDto } from '@dto/pagination.dto';
import { MenuService } from '@menu/menu.service';
import { PromocodeService } from '@promocode/promocode.service';
import { UserService } from '@user/user.service';
import { calculateDiscountedPrice } from '@utils';

import { IndividualOrderRequestDto } from './dto/individual-order-request.dto';
import { OrderChangeRequestDto } from './dto/order-change-request.dto';
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
        private readonly dishService: DishService,
        private readonly promocodeService: PromocodeService,
        private readonly configService: ConfigService
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

    private get orderChangeRequestRepository() {
        return this.prismaService.orderChangeRequest;
    }

    async getPaymentMethodById(id: number) {
        const paymentMethod = await this.paymentMethodRepository.findFirst({
            where: { id }
        });

        if (!paymentMethod) {
            throw new NotFoundException({
                message: {
                    ru: 'Способ оплаты не найден',
                    he: 'אמצעי תשלום לא נמצא'
                }
            });
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
            menu: {
                include: {
                    menuType: {
                        select: {
                            id: true,
                            nameRu: true,
                            nameHe: true,
                            backgroundPicture: true
                        }
                    }
                }
            },
            orderDays: { orderBy: { date: Prisma.SortOrder.asc } },
            paymentMethod: true,
            city: true,
            user: true,
            promocode: true
        };
    }

    async getById(id: number) {
        const order = await this.orderRepository.findFirst({
            where: { id },
            include: this.getInclude()
        });

        if (!order) {
            throw new NotFoundException({
                message: { ru: 'Заказ не найден', he: 'הזמנה לא נמצאה' }
            });
        }

        return order;
    }

    createDto(
        order: Order & { menu: Menu & { menuType: Partial<MenuType> } } & {
            orderDays: OrderDay[];
        } & {
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
            skippedWeekdays,
            giftDaysCount,
            paymentMethod,
            isPaid,
            isIndividual,
            freezeStartDate,
            freezeEndDate
        } = order;

        const notSkippedDays = orderDays.filter(
            orderDay => !orderDay.isSkipped
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setTime(today.getTime() - today.getTimezoneOffset() * 60000);

        const daysLeft = notSkippedDays.filter(
            orderDay => orderDay.date > today
        ).length;

        const isFrozen = orderDays.some(
            orderDay =>
                orderDay.date.getTime() == today.getTime() &&
                orderDay.isSkipped &&
                orderDay.daySkipType == DaySkipType.FROZEN
        );

        return {
            id,
            createdAt,
            fullName,
            email,
            phone,
            allergies,
            finalPrice,
            menu: menu ? this.menuService.createShortDto(menu) : null,
            city: city ? this.cityService.createDto(city) : null,
            street,
            house,
            floor,
            apartment,
            comment,
            skippedWeekdays,
            daysCount: notSkippedDays.length - giftDaysCount,
            giftDaysCount,
            daysLeft,
            startDate: orderDays[0]?.date,
            endDate: orderDays[orderDays.length - 1]?.date,
            paymentMethod: paymentMethod
                ? this.createPaymentMethodDto(paymentMethod)
                : null,
            isPaid,
            isIndividual,
            isFrozen,
            freezeStartDate,
            freezeEndDate
        };
    }

    async createDtoById(id: number) {
        const order = await this.getById(id);
        const { price, paidAmount, promocodeDiscount, menuDiscount } = order;

        return {
            order: {
                ...this.createDto(order),
                price,
                paidAmount,
                promocodeDiscount,
                menuDiscount
            }
        };
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
            throw new BadRequestException({
                message: {
                    ru: 'Некорректная дата начала заказа',
                    he: 'תאריך התחלה שגוי להזמנה'
                }
            });
        }

        await this.cityService.getById(rest.cityId);

        await this.getPaymentMethodById(rest.paymentMethodId);

        const { price, discount, giftDaysCount } =
            await this.menuService.getMenuPriceByDays(menuId, daysCount);

        let finalPrice = calculateDiscountedPrice(price, discount);

        const menuDiscount = price - finalPrice;

        if (rest.promocodeId) {
            finalPrice = await this.promocodeService.calculatePriceById(
                rest.promocodeId,
                finalPrice
            );
        }

        const promocodeDiscount = price - menuDiscount - finalPrice;

        const createdOrder = await this.orderRepository.create({
            data: {
                ...rest,
                skippedWeekdays,
                menuId,
                userId,
                price,
                finalPrice,
                menuDiscount,
                promocodeDiscount,
                giftDaysCount,
                isIndividual: false
            }
        });

        await this.createOrderPlanByMenu({
            startDate,
            daysCount: daysCount + giftDaysCount,
            skippedWeekdays,
            menuId,
            orderId: createdOrder.id
        });

        return await this.createDtoById(createdOrder.id);
    }

    private getDaysWithSkipInfo(
        startDate: Date,
        daysCount: number,
        skippedWeekdays: WeekDay[],
        freezeStartDate?: Date,
        freezeEndDate?: Date
    ) {
        const orderDays: {
            date: Date;
            isSkipped: boolean;
            daySkipType: DaySkipType;
        }[] = [];
        const currentDate = new Date(startDate);
        let addedDays = 0;

        while (addedDays < daysCount) {
            const currentWeekDay =
                currentDate.getDay() == 0 ? 7 : currentDate.getDay();

            const isWeekDaySkip = skippedWeekdays.includes(currentWeekDay);

            const isFrozen =
                freezeStartDate &&
                freezeEndDate &&
                currentDate >= freezeStartDate &&
                currentDate <= freezeEndDate;

            const isSkipped = isWeekDaySkip || isFrozen;

            let daySkipType: DaySkipType = null;

            if (isWeekDaySkip) {
                daySkipType = DaySkipType.WEEKDAY_SKIPPED;
            }

            if (isFrozen) {
                daySkipType = DaySkipType.FROZEN;
            }

            orderDays.push({
                date: new Date(currentDate),
                isSkipped,
                daySkipType
            });

            if (!isSkipped) {
                addedDays++;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return orderDays;
    }

    private async createOrderPlanByMenu({
        startDate,
        daysCount,
        skippedWeekdays,
        freezeStartDate,
        freezeEndDate,
        menuId,
        orderId,
        existingOrderDays: currentOrderDays = []
    }: {
        startDate: Date;
        daysCount: number;
        skippedWeekdays: WeekDay[];
        freezeStartDate?: Date;
        freezeEndDate?: Date;
        menuId: number;
        orderId: number;
        existingOrderDays?: (OrderDay & { orderDayDishes: OrderDayDish[] })[];
    }) {
        const orderDays = this.getDaysWithSkipInfo(
            startDate,
            daysCount,
            skippedWeekdays,
            freezeStartDate,
            freezeEndDate
        );

        const planData = await this.menuService.getMealPlan(
            menuId,
            startDate,
            orderDays.length
        );

        for (let i = 0; i < orderDays.length; i++) {
            const { date, isSkipped, daySkipType } = orderDays[i];

            const createdOrderDay = await this.orderDayRepository.create({
                data: {
                    orderId,
                    date,
                    isSkipped,
                    daySkipType
                }
            });

            if (isSkipped) {
                continue;
            }

            const existingOrderDay = currentOrderDays.find(
                orderDay => orderDay.date.getTime() == date.getTime()
            );

            for (const { dishTypeId, dish, isPrimary } of planData[i].dishes) {
                const existingDish = existingOrderDay?.orderDayDishes.find(
                    orderDayDish =>
                        orderDayDish.dishTypeId == dishTypeId &&
                        orderDayDish.dishId == dish.id
                );

                await this.orderDayDishRepository.create({
                    data: {
                        orderDayId: createdOrderDay.id,
                        dishTypeId,
                        dishId: dish.id,
                        isSelected: existingDish
                            ? existingDish.isSelected
                            : isPrimary
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

        const expiryDate = new Date(today);
        expiryDate.setDate(
            today.getDate() +
                Number(this.configService.get('ORDER_EXPIRY_WARNING_DAYS'))
        );

        return {
            activeCondition: {
                isProcessed: true,
                isCompleted: false,
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
            individualCondition: {
                isProcessed: true,
                isCompleted: false,
                isIndividual: true,
                orderDays: {
                    some: {
                        date: { gte: today }
                    }
                }
            },
            frozenCondition: {
                isProcessed: true,
                isCompleted: false,
                orderDays: {
                    some: {
                        date: today,
                        daySkipType: DaySkipType.FROZEN
                    }
                }
            },
            unpaidCondition: {
                isProcessed: true,
                isCompleted: false,
                isPaid: false
            },
            completedCondition: {
                OR: [
                    { isCompleted: true },
                    { orderDays: { every: { date: { lt: today } } } }
                ]
            },
            pendingCondition: {
                isProcessed: true,
                isCompleted: false,
                orderDays: { every: { date: { gt: today } } }
            },
            terminatingCondition: {
                isProcessed: true,
                isCompleted: false,
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
            unprocessedCondition: { isProcessed: false, isCompleted: false }
        };
    }

    async getStats() {
        const {
            activeCondition,
            individualCondition,
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
            individualCount,
            frozenCount,
            unpaidCount,
            completedCount,
            pendingCount,
            terminatingCount,
            unprocessedCount
        ] = await Promise.all([
            this.orderRepository.count(),
            this.orderRepository.count({ where: activeCondition }),
            this.orderRepository.count({ where: individualCondition }),
            this.orderRepository.count({ where: frozenCondition }),
            this.orderRepository.count({ where: unpaidCondition }),
            this.orderRepository.count({ where: completedCondition }),
            this.orderRepository.count({ where: pendingCondition }),
            this.orderRepository.count({ where: terminatingCondition }),
            this.orderRepository.count({ where: unprocessedCondition })
        ]);

        return {
            stats: {
                allCount,
                activeCount,
                individualCount,
                frozenCount,
                unpaidCount,
                completedCount,
                pendingCount,
                terminatingCount,
                unprocessedCount
            }
        };
    }

    async find({
        page,
        limit,
        userId,
        status,
        search
    }: {
        page: number;
        limit: number;
        userId?: number;
        status?: OrderStatus;
        search?: string;
    }) {
        const {
            activeCondition,
            individualCondition,
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
            ...(status == OrderStatus.INDIVIDUAL && individualCondition),
            ...(status == OrderStatus.FROZEN && frozenCondition),
            ...(status == OrderStatus.UNPAID && unpaidCondition),
            ...(status == OrderStatus.COMPLETED && completedCondition),
            ...(status == OrderStatus.PENDING && pendingCondition),
            ...(status == OrderStatus.TERMINATING && terminatingCondition),
            ...(status == OrderStatus.UNPROCESSED && unprocessedCondition),
            ...(search != undefined && {
                OR: [
                    ...(!isNaN(Number(search))
                        ? [
                              {
                                  id: Number(search)
                              }
                          ]
                        : []),
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive'
                        } as Prisma.StringFilter
                    },
                    {
                        phone: {
                            contains: search,
                            mode: 'insensitive'
                        } as Prisma.StringFilter
                    },
                    {
                        fullName: {
                            contains: search,
                            mode: 'insensitive'
                        } as Prisma.StringFilter
                    }
                ]
            })
        };

        const skip = (page - 1) * limit;

        const ordersData = await this.orderRepository.findMany({
            where,
            include: this.getInclude(),
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const orders = ordersData.map(order => this.createDto(order));

        const totalCount = await this.orderRepository.count({
            where
        });

        return new PaginationDto('orders', orders, totalCount, limit, page);
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
            promocodeId,
            giftDaysCount,
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

        return {
            order: {
                ...rest,
                user: userId ? this.userService.createDto(user) : null,
                city: this.cityService.createDto(city),
                paymentMethod: this.createPaymentMethodDto(paymentMethod),
                menu: menu ? this.menuService.createShortDto(menu) : null,
                daysCount: notSkippedDays.length - giftDaysCount,
                giftDaysCount,
                daysLeft,
                startDate: orderDays[0].date,
                endDate: orderDays[orderDays.length - 1].date
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
        giftDaysCount,
        menuId,
        ...rest
    }: AdminOrderRequestDto) {
        await this.cityService.getById(cityId);

        await this.getPaymentMethodById(paymentMethodId);

        await this.userService.getById(userId);

        await this.menuService.getById(menuId, true);

        const createdOrder = await this.orderRepository.create({
            data: {
                cityId,
                paymentMethodId,
                userId,
                skippedWeekdays,
                menuId,
                giftDaysCount,
                ...rest
            }
        });

        if (menuId != undefined) {
            await this.createOrderPlanByMenu({
                startDate,
                daysCount: daysCount + (giftDaysCount ?? 0),
                skippedWeekdays,
                freezeStartDate: rest.freezeStartDate,
                freezeEndDate: rest.freezeEndDate,
                menuId,
                orderId: createdOrder.id
            });
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
            giftDaysCount,
            menuId,
            freezeStartDate,
            freezeEndDate,
            ...rest
        }: AdminOrderRequestDto
    ) {
        const existingOrder = await this.orderRepository.findFirst({
            where: { id },
            select: {
                isIndividual: true,
                orderDays: { include: { orderDayDishes: true } }
            }
        });

        if (!existingOrder) {
            throw new NotFoundException('Заказ не надйен');
        }

        await this.cityService.getById(cityId);

        await this.getPaymentMethodById(paymentMethodId);

        await this.userService.getById(userId);

        if (menuId) {
            await this.menuService.getById(menuId, true);
        }

        await this.orderRepository.update({
            where: { id },
            data: {
                cityId,
                paymentMethodId,
                userId: userId ?? null,
                skippedWeekdays,
                giftDaysCount,
                menuId,
                freezeStartDate: freezeStartDate ?? null,
                freezeEndDate: freezeEndDate ?? null,
                ...rest,
                ...(!existingOrder.isIndividual && {
                    orderDays: {
                        deleteMany: {}
                    }
                })
            }
        });

        if (!existingOrder.isIndividual) {
            await this.createOrderPlanByMenu({
                startDate,
                daysCount: daysCount + (giftDaysCount ?? 0),
                skippedWeekdays,
                freezeStartDate,
                freezeEndDate,
                menuId,
                orderId: id,
                existingOrderDays: existingOrder.orderDays
            });
        }

        return await this.createDtoById(id);
    }

    async delete(id: number) {
        const existingOrder = await this.getById(id);

        await this.orderRepository.delete({ where: { id } });

        return { order: this.createDto(existingOrder) };
    }

    async findOrderDays(id: number, userId?: number) {
        const where = { id, ...(userId != undefined && { userId }) };

        const existingOrder = await this.orderRepository.findFirst({
            where,
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
            throw new NotFoundException({
                message: { ru: 'Заказ не найден', he: 'הזמנה לא נמצאה' }
            });
        }

        return { days: existingOrder.orderDays };
    }

    async getSelectedOrderDayDishes(dayId: number, userId?: number) {
        const where = {
            id: dayId,
            ...(userId != undefined && { order: { userId } })
        };

        const existingOrderDay = await this.orderDayRepository.findFirst({
            where,
            select: {
                orderDayDishes: {
                    where: { isSelected: true },
                    select: {
                        count: true,
                        dish: { include: { dishType: true } }
                    },
                    orderBy: { dishTypeId: 'asc' }
                }
            }
        });

        if (!existingOrderDay) {
            throw new NotFoundException({
                message: { ru: 'День не найден', he: 'יום לא נמצא' }
            });
        }

        const dishes = existingOrderDay.orderDayDishes.map(orderDayDish => ({
            ...this.dishService.createDto(orderDayDish.dish),
            count: orderDayDish.count
        }));

        const total = this.menuService.calculateTotalNutrients(dishes);

        return { dishes, total };
    }

    async getReplacementOrderDayDishes(
        dayId: number,
        dishTypeId: number,
        userId?: number
    ) {
        const where = {
            id: dayId,
            ...(userId != undefined && { order: { userId } })
        };

        const existingOrderDay = await this.orderDayRepository.findFirst({
            where,
            select: {
                orderDayDishes: {
                    where: { dishTypeId, isSelected: false },
                    select: { dish: { include: { dishType: true } } }
                }
            }
        });

        if (!existingOrderDay) {
            throw new NotFoundException({
                message: { ru: 'День не найден', he: 'יום לא נמצא' }
            });
        }

        const dishes = existingOrderDay.orderDayDishes.map(orderDayDish =>
            this.dishService.createDto(orderDayDish.dish)
        );

        return { dishes };
    }

    async selectDish(
        { dayId, dishTypeId, dishId }: SelectDishDto,
        userId?: number
    ) {
        const where = {
            dishTypeId,
            dishId,
            orderDay: {
                id: dayId,
                ...(userId != undefined && { order: { userId } })
            }
        };

        const existingOrderDish = await this.orderDayDishRepository.findFirst({
            where,
            select: {
                isSelected: true,
                dish: { include: { dishType: true } },
                orderDay: { select: { date: true } }
            }
        });

        if (!existingOrderDish) {
            throw new NotFoundException({
                message: { ru: 'Блюдо не найдено', he: 'המנה לא נמצאה' }
            });
        }

        if (
            userId != undefined &&
            existingOrderDish.orderDay.date < new Date()
        ) {
            throw new BadRequestException({
                message: {
                    ru: 'Нельзя заменить блюдо на прошлую дату',
                    he: 'אי אפשר להחליף את המנה בתאריך האחרון'
                }
            });
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

    // change requests
    async getChangeRequestById(id: number) {
        const changeRequest = await this.orderChangeRequestRepository.findFirst(
            {
                where: { id },
                include: { order: { include: this.getInclude() } }
            }
        );

        if (!changeRequest) {
            throw new NotFoundException('Заявка не найден');
        }

        return changeRequest;
    }

    createChangeRequestDto(
        orderChangeRequest: OrderChangeRequest & {
            order: Order & { menu: Menu & { menuType: Partial<MenuType> } } & {
                orderDays: OrderDay[];
            } & {
                paymentMethod: PaymentMethod;
            } & { city: City };
        }
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { orderId, order, ...rest } = orderChangeRequest;

        return { ...rest, order: this.createDto(order) };
    }

    async createChangeRequest(
        id: number,
        userId: number,
        dto: OrderChangeRequestDto
    ) {
        const existingOrder = await this.orderRepository.findFirst({
            where: { id, userId },
            select: { id: true }
        });

        if (!existingOrder) {
            throw new NotFoundException('Заказ не найден');
        }

        const createdChangeRequest =
            await this.orderChangeRequestRepository.create({
                data: { ...dto, orderId: id },
                include: { order: { include: this.getInclude() } }
            });

        return {
            orderChangeRequest:
                this.createChangeRequestDto(createdChangeRequest)
        };
    }

    async findChangeRequests(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const changeRequestsData =
            await this.orderChangeRequestRepository.findMany({
                include: { order: { include: this.getInclude() } },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            });

        const orderChangeRequests = changeRequestsData.map(changeRequest =>
            this.createChangeRequestDto(changeRequest)
        );

        const totalCount = await this.orderChangeRequestRepository.count();

        return new PaginationDto(
            'orderChangeRequests',
            orderChangeRequests,
            totalCount,
            limit,
            page
        );
    }

    async getUnprocessedChangeRequestsCount() {
        const count = await this.orderChangeRequestRepository.count({
            where: { isProcessed: false }
        });

        return { count };
    }

    async getChangeRequestDtoById(id: number) {
        const existingChangeRequest = await this.getChangeRequestById(id);

        return {
            orderChangeRequest: this.createChangeRequestDto(
                existingChangeRequest
            )
        };
    }

    async updateChangeRequest(
        id: number,
        { isProcessed }: OrderChangeRequestUpdateDto
    ) {
        await this.getChangeRequestById(id);

        const updatedChangeRequest =
            await this.orderChangeRequestRepository.update({
                where: { id },
                data: { isProcessed },
                include: { order: { include: this.getInclude() } }
            });

        return {
            orderChangeRequest:
                this.createChangeRequestDto(updatedChangeRequest)
        };
    }

    async createIndividual(dto: IndividualOrderRequestDto, userId: number) {
        const { dishes, date, ...rest } = dto;

        // TODO: проверять чтобы дата была не раньше ближайшей даты доставки (вынести дату начала доставки в env)
        if (date < new Date()) {
            throw new BadRequestException({
                message: {
                    ru: 'Некорректная дата начала заказа',
                    he: 'תאריך התחלה שגוי להזמנה'
                }
            });
        }

        await this.cityService.getById(rest.cityId);

        await this.getPaymentMethodById(rest.paymentMethodId);

        const dishIds = dishes.map(dish => dish.id);

        const existingAvailableDishes =
            await this.dishService.getPublishedAndIndividualOrderAvailableDishesByIds(
                dishIds
            );

        if (existingAvailableDishes.length != new Set(dishIds).size) {
            throw new NotFoundException({
                message: { ru: 'Блюдо не найдено', he: 'המנה לא נמצאה' }
            });
        }

        let totalPrice = 0;
        const minOrderAmount = Number(
            this.configService.get('MIN_ORDER_AMOUNT')
        );

        for (const { id, price } of existingAvailableDishes) {
            const count = dishes.find(dish => dish.id == id).count;

            totalPrice += count * price;
        }

        if (totalPrice < minOrderAmount) {
            throw new BadRequestException({
                message: {
                    ru: `Минимальная сумма заказа — ${minOrderAmount}. Текущая сумма: ${totalPrice}.`,
                    he: `סכום ההזמנה המינימלי הוא ${minOrderAmount}. הסכום הנוכחי: ${totalPrice}.`
                }
            });
        }

        let finalPrice = totalPrice;

        if (rest.promocodeId) {
            finalPrice = await this.promocodeService.calculatePriceById(
                rest.promocodeId,
                totalPrice
            );
        }

        const { id: orderId } = await this.orderRepository.create({
            data: {
                ...rest,
                userId,
                price: totalPrice,
                finalPrice,
                promocodeDiscount: totalPrice - finalPrice,
                isIndividual: true
            }
        });

        const { id: orderDayId } = await this.orderDayRepository.create({
            data: {
                date,
                orderId
            }
        });

        for (const { id: dishId } of existingAvailableDishes) {
            const count = dishes.find(dish => dish.id == dishId).count;

            await this.orderDayDishRepository.create({
                data: { orderDayId, dishId, isSelected: true, count }
            });
        }

        return await this.createDtoById(orderId);
    }
}
