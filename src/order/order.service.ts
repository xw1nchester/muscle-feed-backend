import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { DaySkipType, Order } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { CityService } from '@city/city.service';
import { MenuService } from '@menu/menu.service';

import { OrderRequestDto } from './dto/order-request.dto';
import { WeekDay } from './enums/weekday.enum';

@Injectable()
export class OrderService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly menuService: MenuService,
        private readonly cityService: CityService
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

    async getPaymentMethods() {
        const paymentMethodsData =
            await this.paymentMethodRepository.findMany();

        const paymentMethods = paymentMethodsData.map(
            ({ id, nameRu, nameHe }) => ({
                id,
                name: { ru: nameRu, he: nameHe }
            })
        );

        return { paymentMethods };
    }

    createDto(order: Order) {
        return order;
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
        // TODO: проверять чтобы дата была не раньше ближайшей даты доставки
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

        return { order: this.createDto(createdOrder) };
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
}
