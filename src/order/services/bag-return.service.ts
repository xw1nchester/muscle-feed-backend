import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    BagReturnStatus,
    City,
    Menu,
    MenuType,
    Order,
    OrderDay,
    OrderDayBagReturn,
    PaymentMethod
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { PaginationDto } from '@dto/pagination.dto';
import { UserService } from '@user/user.service';

import { OrderService } from './order.service';

@Injectable()
export class BagReturnService {
    // private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly orderService: OrderService,
        private readonly userService: UserService
    ) {}

    // TODO: проверять, что нельзя это делать на старых заказах
    async report(dayId: number, userId: number) {
        const existingBagReturn =
            await this.prismaService.orderDayBagReturn.findFirst({
                where: {
                    orderDayId: dayId
                }
            });

        if (existingBagReturn) {
            throw new BadRequestException({
                message: {
                    ru: 'Возврат сумки уже зарегистрирован',
                    he: 'החזרת התיק כבר נרשמה.'
                }
            });
        }

        const existingOrderDay = await this.prismaService.orderDay.findFirst({
            where: {
                id: dayId,
                isSkipped: false,
                order: { userId }
            }
        });

        if (!existingOrderDay) {
            throw new NotFoundException({
                message: { ru: 'День не найден', he: 'יום לא נמצא' }
            });
        }

        if (existingOrderDay.date > new Date()) {
            throw new BadRequestException({
                message: {
                    ru: 'Нельзя вернуть сумку за будущую дату',
                    he: 'לא ניתן להחזיר תיק לתאריך עתידי.'
                }
            });
        }

        await this.prismaService.orderDayBagReturn.create({
            data: {
                orderDayId: dayId
            }
        });
    }

    async cancel(id: number, userId: number) {
        const existingBagReturn =
            await this.prismaService.orderDayBagReturn.findFirst({
                where: {
                    id,
                    orderDay: {
                        order: { userId }
                    }
                }
            });

        if (!existingBagReturn) {
            throw new NotFoundException({
                message: {
                    ru: 'Возврат сумки не найден',
                    he: 'החזרת התיק לא נמצאה'
                }
            });
        }

        if (existingBagReturn.status != BagReturnStatus.REPORTED) {
            throw new BadRequestException({
                message: {
                    ru: 'Нельзя отменить обработанный возврат сумки',
                    he: 'לא ניתן לבטל החזרת מזוודה שעברה תהליך עיבוד.'
                }
            });
        }

        await this.prismaService.orderDayBagReturn.delete({ where: { id } });
    }

    // TODO: создать интерфейс для описания order с его связями (используется также в OrderService)
    createDto(
        bagReturn: OrderDayBagReturn & {
            orderDay: OrderDay & {
                order: Order & {
                    menu: Menu & { menuType: Partial<MenuType> };
                } & {
                    orderDays: OrderDay[];
                } & {
                    paymentMethod: PaymentMethod;
                } & { city: City };
            };
        }
    ) {
        delete bagReturn.orderDayId;
        return {
            ...bagReturn,
            orderDay: {
                id: bagReturn.orderDay.id,
                date: bagReturn.orderDay.date
            },
            order: this.orderService.createDto(bagReturn.orderDay.order)
        };
    }

    getInclude() {
        return {
            orderDay: {
                include: {
                    order: {
                        include: this.orderService.getInclude()
                    }
                }
            }
        };
    }

    async getById(id: number) {
        const bagReturn = await this.prismaService.orderDayBagReturn.findFirst({
            where: {
                id
            },
            include: this.getInclude()
        });

        if (!bagReturn) {
            throw new NotFoundException({
                message: {
                    ru: 'Возврат сумки не найден',
                    he: 'החזרת התיק לא נמצאה'
                }
            });
        }

        return bagReturn;
    }

    // TODO: добавить инфу о заказе, дне и юзере + в получение по id
    async findAll(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const bagReturns = await this.prismaService.orderDayBagReturn.findMany({
            include: this.getInclude(),
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const totalCount = await this.prismaService.orderDayBagReturn.count();

        const dtos = bagReturns.map(br => this.createDto(br));

        return new PaginationDto('bagReturns', dtos, totalCount, limit, page);
    }

    async getUnprocessedBagReturnCount() {
        const count = await this.prismaService.orderDayBagReturn.count({
            where: { status: BagReturnStatus.REPORTED }
        });
        return { count };
    }

    async getDtoById(id: number) {
        const bagReturn = await this.getById(id);
        return { bagReturn: this.createDto(bagReturn) };
    }

    async updateStatus(id: number, status: BagReturnStatus) {
        const existingBagReturn = await this.getById(id);

        if (existingBagReturn.status != BagReturnStatus.REPORTED) {
            throw new NotFoundException({
                message: {
                    ru: 'Заявка уже обработана',
                    he: 'הבקשה כבר טופלה.'
                }
            });
        }

        await this.prismaService.$transaction(async tx => {
            await tx.orderDayBagReturn.update({
                where: { id },
                data: { status }
            });

            if (status == BagReturnStatus.CONFIRMED) {
                // по хорошему завести отдельный модуль (Loyalty) с данной зоной ответственности
                await this.userService.reward(
                    tx,
                    existingBagReturn.orderDay.order.userId,
                    Number(this.configService.get('BAG_RETURN_BONUS_AMOUNT'))
                );
            }
        });
    }
}
