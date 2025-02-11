import { Injectable, NotFoundException } from '@nestjs/common';

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
        private readonly fileService: UploadService
    ) {}

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
        const typesData = await this.prismaService.dishType.findMany();

        const dishTypes = typesData.map(type => this.createTypeDto(type));

        return { dishTypes };
    }

    async getById(id: number) {
        const dish = await this.prismaService.dish.findFirst({
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
            isPublished,
            benefit
        } = dish;

        const localizedFields = extractLocalizedFields(dish);

        return {
            id,
            adminName,
            dishType: {
                id: dishType.id,
                name: {
                    ru: dishType.nameRu,
                    he: dishType.nameHe
                }
            },
            picture,
            calories,
            weight,
            proteins,
            fats,
            carbohydrates,
            isPublished,
            ...localizedFields,
            benefit
        };
    }

    async create(dto: DishRequestDto) {
        const existingType = await this.prismaService.dishType.findFirst({
            where: { id: dto.dishTypeId }
        });

        if (!existingType) {
            throw new NotFoundException('Тип блюда не найден');
        }

        const createdDish = await this.prismaService.dish.create({
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
        isPublished
    }: {
        limit: number;
        page: number;
        search: string;
        isPublished?: boolean;
    }) {
        const where = {
            ...(isPublished != undefined && { isPublished }),
            ...(search != undefined && {
                adminName: {
                    contains: search,
                    mode: 'insensitive'
                } as Prisma.StringFilter
            })
        };

        const skip = (page - 1) * limit;

        const dishesData = await this.prismaService.dish.findMany({
            where,
            include: { dishType: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip
        });

        const dishes = dishesData.map(dish => this.createDto(dish));

        const totalCount = await this.prismaService.dish.aggregate({
            _count: { id: true },
            where
        });

        return new PaginationDto(
            'dishes',
            dishes,
            totalCount._count.id,
            limit,
            page
        );
    }

    async update(id: number, dto: DishRequestDto) {
        const existingDish = await this.getById(id);

        const updatedDish = await this.prismaService.dish.update({
            where: { id },
            data: dto,
            include: { dishType: true }
        });

        if (existingDish.picture != dto.picture) {
            this.fileService.delete(existingDish.picture);
        }

        return { dish: this.createDto(updatedDish) };
    }

    async delete(id: number) {
        const existingDish = await this.getById(id);

        await this.prismaService.dish.delete({
            where: { id }
        });

        this.fileService.delete(existingDish.picture);

        return { dish: this.createDto(existingDish) };
    }

    async validateDishTypeIds(dishTypeIds: number[]) {
        const dishTypesCount = await this.prismaService.dishType.count({
            where: { id: { in: dishTypeIds } }
        });

        if (dishTypesCount != new Set(dishTypeIds).size) {
            throw new NotFoundException('Тип приема пищи не найден');
        }
    }

    async validateDishesIds(dishIds: number[]) {
        const dishesCount = await this.prismaService.dish.count({
            where: { id: { in: dishIds } }
        });

        if (dishesCount != new Set(dishIds).size) {
            throw new NotFoundException('Блюдо не найдено');
        }
    }
}
