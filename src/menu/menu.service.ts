import {
    BadGatewayException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

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
import { extractLocalizedFields } from '@utils';

@Injectable()
export class MenuService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly dishService: DishService
    ) {}

    private get menuRepository() {
        return this.prismaService.menu;
    }

    private get menuTypeRepository() {
        return this.prismaService.menuType;
    }

    private get menuDayRepository() {
        return this.prismaService.menuDay;
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
        const { id, adminName } = type;

        const localizedFields = extractLocalizedFields(type);

        return { id, adminName, ...localizedFields };
    }

    async createType(dto: MenuTypeRequestDto) {
        const createdType = await this.menuTypeRepository.create({
            data: dto
        });

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

        return {
            menuType: this.createTypeDto(updatedType, updatedType._count.menus)
        };
    }

    async deleteType(id: number) {
        const existingType = await this.getTypeById(id);

        if (existingType._count.menus > 0) {
            throw new BadGatewayException(
                'Нельзя удалить тип меню, так как есть меню с этим типом'
            );
        }

        await this.menuTypeRepository.delete({ where: { id } });

        return {
            menuType: this.createTypeDto(existingType)
        };
    }

    // Menu
    createPriceDto(menuPrice: MenuPrice) {
        const { id, daysCount } = menuPrice;

        const localizedFields = extractLocalizedFields(menuPrice);

        return { id, daysCount, ...localizedFields };
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

    private getMenuInclude() {
        return {
            menuType: {
                select: {
                    id: true,
                    nameRu: true,
                    nameHe: true
                }
            },
            menuPrices: true,
            _count: {
                select: { menuDays: true }
            }
        };
    }

    async getById(id: number) {
        const menu = await this.menuRepository.findFirst({
            where: { id },
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
                    create: dto.prices.map(price => price)
                }
            },
            include: this.getMenuInclude()
        });

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

        const totalCount = await this.menuRepository.aggregate({
            _count: { id: true },
            where
        });

        return new PaginationDto(
            'menus',
            menus,
            totalCount._count.id,
            limit,
            page
        );
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
                        totalPriceRu: true,
                        totalPriceHe: true,
                        pricePerDayRu: true,
                        pricePerDayHe: true
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
                    create: dto.prices.map(price => price)
                }
            },
            include: this.getMenuInclude()
        });

        return { menu: this.createDto(updatedMenu) };
    }

    async delete(id: number) {
        const existingMenu = await this.getById(id);

        // TODO: проверить чтобы не было заказов с этим меню

        await this.menuRepository.delete({ where: { id } });

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
            include: {
                menuDays: {
                    include: {
                        menuDayDishes: {
                            // TODO: возможно пригодится
                            // orderBy: { dishTypeId: 'asc' },
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

        // TODO: разобраться почему нужно добавлять +1 к offset
        let offset =
            (Math.floor(
                (startDate.getTime() - existingMenu.cycleStartDate.getTime()) /
                    msPerDay
            ) %
                numberOfDays) +
            1;

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

    async getPrimaryMenuDishesByDate(id: number, date: Date) {
        const planData = await this.getMealPlan(id, date, 1);

        const dishes = planData[0].dishes
            .filter(menuDish => menuDish.isPrimary)
            .map(menuDish => this.dishService.createDto(menuDish.dish));

        const total = dishes.reduce(
            (acc, { calories, proteins, fats, carbohydrates }) => ({
                calories: acc.calories + calories,
                proteins: acc.proteins + proteins,
                fats: acc.fats + fats,
                carbohydrates: acc.carbohydrates + carbohydrates
            }),
            { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 }
        );

        return { dishes, total };
    }

    async getReplacementsByDate(id: number, date: Date, dishTypeId: number) {
        const planData = await this.getMealPlan(id, date, 1);

        const dishes = planData[0].dishes
            .filter(menuDish => menuDish.dishTypeId == dishTypeId)
            .filter(menuDish => !menuDish.isPrimary)
            .map(menuDish => this.dishService.createDto(menuDish.dish));

        return { dishes };
    }
}
