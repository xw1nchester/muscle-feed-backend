import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Dish, DishType, Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

import { DishRequestDto } from '@admin/dish/dto/dish-request.dto';
import { PaginationDto } from '@dto/pagination.dto';
import { UploadService } from '@upload/upload.service';
import { extractLocalizedFields } from '@utils';

@Injectable()
export class DishService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly uploadService: UploadService,
        private readonly configService: ConfigService
    ) {}

    private get dishTypeRepository() {
        return this.prismaService.dishType;
    }

    private get dishRepository() {
        return this.prismaService.dish;
    }

    createTypeDto(dishType: DishType) {
        return {
            id: dishType.id,
            name: {
                ru: dishType.nameRu,
                he: dishType.nameHe
            }
        };
    }

    async getTypes() {
        const typesData = await this.dishTypeRepository.findMany();

        const dishTypes = typesData.map(type => this.createTypeDto(type));

        return { dishTypes };
    }

    async getById(id: number) {
        const dish = await this.dishRepository.findFirst({
            where: { id },
            include: { dishType: true }
        });

        if (!dish) {
            throw new NotFoundException('Блюдо не найдено');
        }

        return dish;
    }

    createDto(dish: Dish & { dishType: DishType }) {
        const {
            id,
            adminName,
            dishType,
            picture,
            calories,
            weight,
            proteins,
            fats,
            carbohydrates,
            price,
            isPublished,
            isIndividualOrderAvailable,
            createdAt,
            updatedAt
        } = dish;

        const localizedFields = extractLocalizedFields(dish);

        return {
            id,
            adminName,
            dishType: this.createTypeDto(dishType),
            picture,
            calories,
            weight,
            proteins,
            fats,
            carbohydrates,
            price,
            isPublished,
            isIndividualOrderAvailable,
            ...localizedFields,
            createdAt,
            updatedAt
        };
    }

    async create(dto: DishRequestDto) {
        const existingType = await this.dishTypeRepository.findFirst({
            where: { id: dto.dishTypeId }
        });

        if (!existingType) {
            throw new NotFoundException('Тип блюда не найден');
        }

        const createdDish = await this.dishRepository.create({
            data: dto,
            include: { dishType: true }
        });

        return { dish: this.createDto(createdDish) };
    }

    async getDtoById(id: number) {
        const dish = await this.getById(id);

        return { dish: this.createDto(dish) };
    }

    async find({
        page,
        limit,
        search,
        isPublished,
        dishTypeId,
        isIndividualOrderAvailable,
        individualOrderDate
    }: {
        limit: number;
        page: number;
        search?: string;
        isPublished?: boolean;
        dishTypeId?: number;
        isIndividualOrderAvailable?: boolean;
        individualOrderDate?: Date;
    }) {
        // TODO: по хорошему нужна валидацию что на дату individualOrderDate вообще можно сделать заказ

        const where = {
            ...(isPublished != undefined && { isPublished }),
            ...(search != undefined && {
                adminName: {
                    contains: search,
                    mode: 'insensitive'
                } as Prisma.StringFilter
            }),
            ...(dishTypeId != undefined && { dishTypeId }),
            ...(isIndividualOrderAvailable != undefined && {
                OR: [
                    { isIndividualOrderAvailable },
                    {
                        orderDayDishes: {
                            some: {
                                isSelected: true,
                                orderDay: {
                                    isSkipped: false,
                                    daySkipType: null,
                                    date: individualOrderDate,
                                    order: {
                                        isProcessed: true,
                                        isCompleted: false,
                                        menu: {
                                            nameRu: this.configService.get(
                                                'INDIVIDUAL_ORDER_MENU_NAME'
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            })
        };

        const skip = (page - 1) * limit;

        const dishesData = await this.dishRepository.findMany({
            where,
            include: { dishType: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const dishes = dishesData.map(dish => this.createDto(dish));

        const totalCount = await this.dishRepository.count({
            where
        });

        return new PaginationDto('dishes', dishes, totalCount, limit, page);
    }

    private async getDishesCountByPicture(picture: string) {
        return await this.dishRepository.count({ where: { picture } });
    }

    async update(id: number, dto: DishRequestDto) {
        const { picture } = await this.getById(id);

        const updatedDish = await this.dishRepository.update({
            where: { id },
            data: dto,
            include: { dishType: true }
        });

        const dishesWithPictureCount =
            await this.getDishesCountByPicture(picture);

        if (picture != dto.picture && dishesWithPictureCount == 0) {
            this.uploadService.delete(picture);
        }

        return { dish: this.createDto(updatedDish) };
    }

    async delete(id: number) {
        const existingDish = await this.dishRepository.findFirst({
            where: { id },
            include: {
                dishType: true,
                _count: {
                    select: { menuDayDishes: true, orderDayDishes: true }
                }
            }
        });

        if (existingDish._count.menuDayDishes > 0) {
            throw new BadRequestException(
                'Нельзя удалить блюдо, так как оно используется в меню'
            );
        }

        if (existingDish._count.orderDayDishes > 0) {
            throw new BadRequestException(
                'Нельзя удалить блюдо, так как оно используется в заказах'
            );
        }

        await this.dishRepository.delete({
            where: { id }
        });

        const dishesWithPictureCount = await this.getDishesCountByPicture(
            existingDish.picture
        );

        if (dishesWithPictureCount == 0) {
            this.uploadService.delete(existingDish.picture);
        }

        return { dish: this.createDto(existingDish) };
    }

    async validateDishTypeIds(dishTypeIds: number[]) {
        const dishTypesCount = await this.dishTypeRepository.count({
            where: { id: { in: dishTypeIds } }
        });

        if (dishTypesCount != new Set(dishTypeIds).size) {
            throw new NotFoundException('Тип приема пищи не найден');
        }
    }

    async validateDishesIds(dishIds: number[]) {
        const dishesCount = await this.dishRepository.count({
            where: { id: { in: dishIds } }
        });

        if (dishesCount != new Set(dishIds).size) {
            throw new NotFoundException('Блюдо не найдено');
        }
    }

    async getPublishedDishesByIds(dishIds: number[]) {
        return await this.dishRepository.findMany({
            select: { id: true, price: true },
            where: {
                id: { in: dishIds },
                isPublished: true
            }
        });
    }

    async copy(id: number) {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
            id: existingDishId,
            dishType,
            isPublished,
            createdAt,
            updatedAt,
            ...rest
        } = await this.getById(id);
        /* eslint-enable @typescript-eslint/no-unused-vars */

        const createdDish = await this.dishRepository.create({
            data: rest,
            include: {
                dishType: true
            }
        });

        return { dish: this.createDto(createdDish) };
    }
}
