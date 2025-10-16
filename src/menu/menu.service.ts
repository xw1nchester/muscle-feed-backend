import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    Dish,
    DishType,
    Menu,
    MenuPrice,
    MenuType,
    Prisma
} from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { MenuRequestDto } from '@admin/menu/dto/menu-request.dto';
import { MenuTypeRequestDto } from '@admin/menu/dto/menu-type-request.dto';
import { DishService } from '@dish/dish.service';
import { PaginationDto } from '@dto/pagination.dto';
import { RedisService } from '@redis/redis.service';
import { SettingsService } from '@settings/settings.service';
import {
    addDays,
    calculateDiscountedPrice,
    extractLocalizedFields,
    getTodayZeroDate
} from '@utils';

@Injectable()
export class MenuService {
    private readonly logger = new Logger(MenuService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly dishService: DishService,
        private readonly settingsService: SettingsService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService
    ) {}

    private get menuRepository() {
        return this.prismaService.menu;
    }

    private get menuTypeRepository() {
        return this.prismaService.menuType;
    }

    // Menu Type
    async getTypeById(id: number) {
        const type = await this.menuTypeRepository.findFirst({
            where: { id },
            include: {
                _count: {
                    select: { menus: true }
                }
            }
        });

        if (!type) {
            throw new NotFoundException('Тип меню не найден');
        }

        return type;
    }

    createTypeDto(type: MenuType, menusCount: number = 0) {
        const {
            id,
            adminName,
            backgroundPicture,
            order,
            isPublished,
            createdAt,
            updatedAt
        } = type;

        const localizedFields = extractLocalizedFields(type);

        return {
            id,
            adminName,
            backgroundPicture,
            order,
            isPublished,
            ...localizedFields,
            menusCount,
            createdAt,
            updatedAt
        };
    }

    createShortTypeDto(type: Partial<MenuType>) {
        const { id, adminName, backgroundPicture } = type;

        const localizedFields = extractLocalizedFields(type);

        return { id, adminName, ...localizedFields, backgroundPicture };
    }

    async createType(dto: MenuTypeRequestDto) {
        const createdType = await this.menuTypeRepository.create({
            data: dto
        });

        await this.redisService.del('menu:types');

        return { menuType: this.createTypeDto(createdType) };
    }

    async getTypes(isPublished?: boolean) {
        const where = { ...(isPublished != undefined && { isPublished }) };

        const typesData = await this.menuTypeRepository.findMany({
            where,
            include: {
                _count: {
                    select: { menus: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        const menuTypes = typesData.map(type =>
            this.createTypeDto(type, type._count.menus)
        );

        return { menuTypes };
    }

    async getTypeDtoById(id: number) {
        const type = await this.getTypeById(id);

        return { menuType: this.createTypeDto(type, type._count.menus) };
    }

    async updateType(id: number, dto: MenuTypeRequestDto) {
        await this.getTypeById(id);

        const updatedType = await this.menuTypeRepository.update({
            where: { id },
            data: dto,
            include: {
                _count: {
                    select: { menus: true }
                }
            }
        });

        await this.redisService.del('menu:types');

        return {
            menuType: this.createTypeDto(updatedType, updatedType._count.menus)
        };
    }

    async deleteType(id: number) {
        const existingType = await this.getTypeById(id);

        if (existingType._count.menus > 0) {
            throw new BadRequestException(
                'Нельзя удалить тип меню, так как есть меню с этим типом'
            );
        }

        await this.menuTypeRepository.delete({ where: { id } });

        await this.redisService.del('menu:types');

        return {
            menuType: this.createTypeDto(existingType)
        };
    }

    // Menu
    createPriceDto(menuPrice: MenuPrice) {
        const { id, daysCount, price, discount, giftDaysCount } = menuPrice;

        const localizedFields = extractLocalizedFields(menuPrice);

        const discountedPrice = calculateDiscountedPrice(price, discount);

        const pricePerDay = Math.floor(price / daysCount);
        const discountedPricePerDay = Math.floor(discountedPrice / daysCount);

        return {
            id,
            daysCount,
            discount,
            giftDaysCount,
            price,
            discountedPrice,
            pricePerDay,
            discountedPricePerDay,
            ...localizedFields
        };
    }

    createDto(
        menu: Menu & { menuType: Partial<MenuType>; menuPrices: MenuPrice[] },
        daysCount: number = 0
    ) {
        const localizedFields = extractLocalizedFields(menu);

        const menuType = this.createShortTypeDto(menu.menuType);

        const prices = menu.menuPrices.map(menuPrice =>
            this.createPriceDto(menuPrice)
        );

        return {
            id: menu.id,
            adminName: menu.adminName,
            ...localizedFields,
            calories: menu.calories,
            order: menu.order,
            cycleStartDate: menu.cycleStartDate,
            isPublished: menu.isPublished,
            createdAt: menu.createdAt,
            updatedAt: menu.updatedAt,
            menuType,
            daysCount,
            prices
        };
    }

    createShortDto({
        id,
        nameRu,
        nameHe,
        descriptionRu,
        descriptionHe,
        calories,
        menuType
    }: Menu & { menuType: Partial<MenuType> }) {
        return {
            id,
            name: {
                ru: nameRu,
                he: nameHe
            },
            description: {
                ru: descriptionRu,
                he: descriptionHe
            },
            calories,
            menuType: this.createShortTypeDto(menuType)
        };
    }

    private getMenuInclude() {
        const today = getTodayZeroDate();

        return {
            menuType: {
                select: {
                    id: true,
                    nameRu: true,
                    nameHe: true,
                    backgroundPicture: true
                }
            },
            menuPrices: true,
            _count: {
                select: {
                    menuDays: true,
                    orders: {
                        where: {
                            AND: [
                                { isCompleted: false },
                                {
                                    orderDays: {
                                        some: { date: { gte: today } }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        };
    }

    async getById(id: number, isPublished?: boolean) {
        const where = { id, ...(isPublished != undefined && { isPublished }) };

        const menu = await this.menuRepository.findFirst({
            where,
            include: this.getMenuInclude()
        });

        if (!menu) {
            throw new NotFoundException('Меню не найдено');
        }

        return menu;
    }

    private async validateMenuDto({ menuTypeId, days }: MenuRequestDto) {
        const existingType = await this.menuTypeRepository.findFirst({
            where: { id: menuTypeId }
        });

        if (!existingType) {
            throw new NotFoundException('Тип меню не найден');
        }

        await this.dishService.validateDishTypeIds(
            days[0].dishes.map(dish => dish.dishTypeId)
        );

        await this.dishService.validateDishesIds(
            days.flatMap(day => day.dishes.map(dish => dish.dishId))
        );
    }

    async create(dto: MenuRequestDto) {
        await this.validateMenuDto(dto);

        const createdMenu = await this.menuRepository.create({
            data: {
                menuTypeId: dto.menuTypeId,
                adminName: dto.adminName,
                nameRu: dto.nameRu,
                nameHe: dto.nameHe,
                descriptionRu: dto.descriptionRu,
                descriptionHe: dto.descriptionHe,
                mealsCountRu: dto.mealsCountRu,
                mealsCountHe: dto.mealsCountHe,
                calories: dto.calories,
                order: dto.order,
                cycleStartDate: dto.cycleStartDate,
                isPublished: dto.isPublished,
                menuDays: {
                    create: dto.days.map(({ number, dishes }) => ({
                        day: number,
                        menuDayDishes: {
                            create: dishes.map(
                                ({ isPrimary, dishTypeId, dishId }) => ({
                                    isPrimary,
                                    dishTypeId,
                                    dishId
                                })
                            )
                        }
                    }))
                },
                menuPrices: {
                    create: dto.prices
                }
            },
            include: this.getMenuInclude()
        });

        await this.redisService.clear();

        return { menu: this.createDto(createdMenu) };
    }

    async find({
        page,
        limit,
        isPublished,
        search,
        menuTypeId
    }: {
        page: number;
        limit: number;
        isPublished?: boolean;
        search?: string;
        menuTypeId?: number;
    }) {
        const where = {
            ...(isPublished != undefined && { isPublished }),
            ...(search != undefined && {
                adminName: {
                    contains: search,
                    mode: 'insensitive'
                } as Prisma.StringFilter
            }),
            ...(menuTypeId != undefined && { menuTypeId })
        };

        const skip = (page - 1) * limit;

        const menusData = await this.menuRepository.findMany({
            where,
            include: this.getMenuInclude(),
            orderBy: { order: 'asc' },
            take: limit,
            skip
        });

        const menus = menusData.map(menu =>
            this.createDto(menu, menu._count.menuDays)
        );

        const totalCount = await this.menuRepository.count({
            where
        });

        return new PaginationDto('menus', menus, totalCount, limit, page);
    }

    async getAdminDtoById(id: number) {
        const existingMenu = await this.menuRepository.findFirst({
            where: { id },
            include: {
                menuType: {
                    select: {
                        id: true,
                        nameRu: true,
                        nameHe: true
                    }
                },
                menuDays: {
                    select: {
                        day: true,
                        menuDayDishes: {
                            select: {
                                dishTypeId: true,
                                dishId: true,
                                isPrimary: true
                            }
                        }
                    }
                },
                menuPrices: {
                    select: {
                        daysCount: true,
                        price: true,
                        discount: true,
                        giftDaysCount: true
                    }
                }
            }
        });

        const localizedFields = extractLocalizedFields(existingMenu);

        const days = existingMenu.menuDays.map(({ day, menuDayDishes }) => ({
            number: day,
            dishes: menuDayDishes
        }));

        return {
            menu: {
                id: existingMenu.id,
                adminName: existingMenu.adminName,
                ...localizedFields,
                calories: existingMenu.calories,
                order: existingMenu.order,
                cycleStartDate: existingMenu.cycleStartDate,
                isPublished: existingMenu.isPublished,
                createdAt: existingMenu.createdAt,
                updatedAt: existingMenu.updatedAt,
                menuTypeId: existingMenu.menuTypeId,
                days,
                prices: existingMenu.menuPrices
            }
        };
    }

    async update(id: number, dto: MenuRequestDto) {
        await this.getById(id);

        await this.validateMenuDto(dto);

        const updatedMenu = await this.menuRepository.update({
            where: { id },
            data: {
                menuTypeId: dto.menuTypeId,
                adminName: dto.adminName,
                nameRu: dto.nameRu,
                nameHe: dto.nameHe,
                descriptionRu: dto.descriptionRu,
                descriptionHe: dto.descriptionHe,
                mealsCountRu: dto.mealsCountRu,
                mealsCountHe: dto.mealsCountHe,
                calories: dto.calories,
                order: dto.order,
                cycleStartDate: dto.cycleStartDate,
                isPublished: dto.isPublished,
                menuDays: {
                    deleteMany: {},
                    create: dto.days.map(({ number, dishes }) => ({
                        day: number,
                        menuDayDishes: {
                            create: dishes.map(
                                ({ isPrimary, dishTypeId, dishId }) => ({
                                    isPrimary,
                                    dishTypeId,
                                    dishId
                                })
                            )
                        }
                    }))
                },
                menuPrices: {
                    deleteMany: {},
                    create: dto.prices
                }
            },
            include: this.getMenuInclude()
        });

        await this.redisService.clear();

        return { menu: this.createDto(updatedMenu) };
    }

    async delete(id: number) {
        const existingMenu = await this.getById(id);

        if (existingMenu._count.orders > 0) {
            throw new BadRequestException(
                'Нельзя удалить меню, так как есть как минимум один заказ с этим меню'
            );
        }

        await this.menuRepository.delete({ where: { id } });

        await this.redisService.clear();

        return { menu: this.createDto(existingMenu) };
    }

    async findPublishedByTypeId(
        page: number,
        limit: number,
        menuTypeId: number
    ) {
        const existingType = await this.menuTypeRepository.findFirst({
            where: { id: menuTypeId, isPublished: true }
        });

        if (!existingType) {
            throw new NotFoundException('Тип меню не найден');
        }

        return await this.find({ page, limit, isPublished: true, menuTypeId });
    }

    async getMealPlan(id: number, startDate: Date, limit: number) {
        const existingMenu = await this.menuRepository.findFirst({
            where: { id, isPublished: true },
            select: {
                cycleStartDate: true,
                menuDays: {
                    include: {
                        menuDayDishes: {
                            orderBy: { dishTypeId: 'asc' },
                            include: {
                                dish: { include: { dishType: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!existingMenu) {
            throw new NotFoundException('Меню не найдено');
        }

        const numberOfDays = existingMenu.menuDays.length;

        const msPerDay = 1000 * 60 * 60 * 24;

        let offset =
            Math.floor(
                (startDate.getTime() - existingMenu.cycleStartDate.getTime()) /
                    msPerDay
            ) % numberOfDays;

        if (offset < 0) {
            offset = (offset + numberOfDays) % numberOfDays;
        }

        const planData: {
            date: Date;
            dishes: {
                dishTypeId: number;
                dish: Dish & { dishType: DishType };
                isPrimary: boolean;
            }[];
        }[] = [];

        for (let i = 0; i < limit; i++) {
            const currentDayIndex = (offset + i) % numberOfDays;
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dishes = existingMenu.menuDays[
                currentDayIndex
            ].menuDayDishes.map(({ dishTypeId, dish, isPrimary }) => ({
                dishTypeId,
                dish,
                isPrimary
            }));

            planData.push({ date, dishes });
        }

        return planData;
    }

    calculateTotalNutrients(dishes: Partial<Dish & { count: number }>[]) {
        return dishes.reduce(
            (acc, { calories, proteins, fats, carbohydrates, count }) => {
                const multiplier = count ?? 1;
                return {
                    calories: acc.calories + multiplier * calories,
                    proteins: acc.proteins + multiplier * proteins,
                    fats: acc.fats + multiplier * fats,
                    carbohydrates:
                        acc.carbohydrates + multiplier * carbohydrates
                };
            },
            { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 }
        );
    }

    async getPrimaryMenuDishesByDate(id: number, date: Date) {
        const planData = await this.getMealPlan(id, date, 1);

        const dishes = planData[0].dishes
            .filter(menuDish => menuDish.isPrimary)
            .map(menuDish => this.dishService.createDto(menuDish.dish));

        const total = this.calculateTotalNutrients(dishes);

        return { dishes, total };
    }

    async getReplacementsByDate(id: number, date: Date, dishTypeId: number) {
        const planData = await this.getMealPlan(id, date, 1);

        const dishes = planData[0].dishes
            .filter(
                menuDish =>
                    menuDish.dishTypeId == dishTypeId && !menuDish.isPrimary
            )
            .map(menuDish => this.dishService.createDto(menuDish.dish));

        return { dishes };
    }

    async getMenuPriceByDays(id: number, daysCount: number) {
        const existingMenu = await this.getById(id, true);

        const menuPrice = existingMenu.menuPrices.find(
            menuPrice => menuPrice.daysCount == daysCount
        );

        if (!menuPrice) {
            throw new NotFoundException(
                'Цена за данное количество дней не определена'
            );
        }

        return {
            price: menuPrice.price,
            discount: menuPrice.discount,
            giftDaysCount: menuPrice.giftDaysCount
        };
    }

    async getRecomendations(calories: number) {
        let menusData = await this.menuRepository.findMany({
            where: {
                isPublished: true,
                calories: { gte: calories - 300, lte: calories + 300 }
            },
            orderBy: { calories: 'asc' },
            include: this.getMenuInclude()
        });

        if (menusData.length === 0) {
            const minCaloriesMenu = await this.menuRepository.findMany({
                where: { isPublished: true },
                orderBy: { calories: 'asc' },
                take: 1,
                include: this.getMenuInclude()
            });

            const maxCaloriesMenu = await this.menuRepository.findMany({
                where: { isPublished: true },
                orderBy: { calories: 'desc' },
                take: 1,
                include: this.getMenuInclude()
            });

            if (calories < minCaloriesMenu[0].calories) {
                menusData = minCaloriesMenu;
            } else {
                menusData = maxCaloriesMenu;
            }
        }

        const menus = menusData.map(menu => this.createDto(menu));

        return { menus };
    }

    async getPersonal(date: Date) {
        const isDeliveryDate = await this.settingsService.isDeliveryDate(date);

        if (!isDeliveryDate) {
            throw new BadRequestException('Некорректная дата');
        }

        const startDate = addDays(date, 1);
        const limit = await this.settingsService.daysToNextDelivery(date);
        const nameRu = this.configService.get('MOST_CALORIFIC_MENU_NAME');

        const searchParams = JSON.stringify({
            deliveryDate: date.toLocaleDateString(),
            startDate: startDate.toLocaleDateString(),
            limit,
            searchMenuName: nameRu
        });

        this.logger.debug(`Fetching personal menu ${searchParams}`);

        const cacheKey = `personal:${date.toLocaleDateString()}`;

        const cached = await this.redisService.get(cacheKey);

        if (cached) {
            this.logger.debug(
                `Received personal menu from the cache ${JSON.stringify({ deliveryDate: date.toLocaleDateString() })}`
            );
            return cached;
        }

        const individualOrderAvailableMenu =
            await this.menuRepository.findFirst({
                select: {
                    id: true,
                    nameRu: true
                },
                where: {
                    nameRu
                }
            });

        if (!individualOrderAvailableMenu) {
            this.logger.error('Not found error when fetching personal menu');
            throw new NotFoundException('Меню не найдено');
        }

        const planData = await this.getMealPlan(
            individualOrderAvailableMenu.id,
            startDate,
            limit
        );

        const dishes = Array.from(
            new Map(
                planData
                    .flatMap(data => data.dishes)
                    .map(dishData => this.dishService.createDto(dishData.dish))
                    .map(dish => [dish.id, dish])
            ).values()
        );

        // this.redisService.set(cacheKey, JSON.stringify({ dishes }), 0);

        // this.logger.debug(
        //     `Cached personal menu ${JSON.stringify({ deliveryDate: date.toLocaleDateString() })}`
        // );

        return { dishes };
    }
}
