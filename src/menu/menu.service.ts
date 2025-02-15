import {
    BadGatewayException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import {
    Dish,
    DishType,
    Menu,
    MenuDay,
    MenuDayDish,
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
        dto.order = Number(dto.order);

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

        dto.order = Number(dto.order);

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
    createFullInfoDto(
        menu: Menu & { menuType: Partial<MenuType> } & {
            menuDays: (MenuDay & {
                menuDayDishes: (MenuDayDish & { dishType: DishType } & {
                    dish: Dish & { dishType: DishType };
                })[];
            })[];
        },
        daysCount: number = 0
    ) {
        const localizedFields = extractLocalizedFields(menu);

        const menuType = this.createShortTypeDto(menu.menuType);

        const days = menu.menuDays.map(({ id, day, menuDayDishes }) => ({
            id,
            number: day,
            dishes: menuDayDishes.map(({ id, dishType, dish, isPrimary }) => ({
                id,
                dishType: this.dishService.createTypeDto(dishType),
                dish: this.dishService.createDto(dish),
                isPrimary
            }))
        }));

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
            days,
            daysCount
        };
    }

    createDto(
        menu: Menu & { menuType: Partial<MenuType> },
        daysCount: number = 0
    ) {
        const localizedFields = extractLocalizedFields(menu);

        const menuType = this.createShortTypeDto(menu.menuType);

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
            daysCount
        };
    }

    private getMenuFullInfoInclude() {
        return {
            menuType: {
                select: {
                    id: true,
                    nameRu: true,
                    nameHe: true
                }
            },
            menuDays: {
                include: {
                    menuDayDishes: {
                        include: {
                            dishType: true,
                            dish: {
                                include: { dishType: true }
                            }
                        }
                    }
                }
            },
            _count: {
                select: { menuDays: true }
            }
        };
    }

    private getMenuBasicInfoInclude() {
        return {
            menuType: {
                select: {
                    id: true,
                    nameRu: true,
                    nameHe: true
                }
            },
            _count: {
                select: { menuDays: true }
            }
        };
    }

    async getById(id: number) {
        const menu = await this.menuRepository.findFirst({
            where: { id },
            include: this.getMenuFullInfoInclude()
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
                }
            },
            include: this.getMenuBasicInfoInclude()
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
            include: this.getMenuBasicInfoInclude(),
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

    async getDtoById(id: number) {
        const existingMenu = await this.getById(id);

        return {
            menu: this.createFullInfoDto(
                existingMenu,
                existingMenu._count.menuDays
            )
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
                }
            },
            include: this.getMenuBasicInfoInclude()
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
}
