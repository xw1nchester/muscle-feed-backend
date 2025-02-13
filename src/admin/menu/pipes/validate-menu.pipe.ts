import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { MenuRequestDto } from '../dto/menu-request.dto';

@Injectable()
export class ValidateMenuPipe implements PipeTransform {
    transform(dto: MenuRequestDto) {
        let expectedDayNumber: number = 1;

        // const dishTypeIds = this.getUniqueDishTypeIds(dto.days[0].dishes);

        dto.days = dto.days.map(day => ({
            ...day,
            number: Number(day.number)
        }));

        for (const day of dto.days) {
            this.validateDayOrder(day.number, expectedDayNumber);

            expectedDayNumber++;

            day.dishes = day.dishes.map(dish => ({
                ...dish,
                dishId: Number(dish.dishId),
                dishTypeId: Number(dish.dishTypeId)
            }));

            // this.validateDishTypesStructure(day.dishes, dishTypeIds);
            this.validateDishes(day.dishes);
        }

        return dto;
    }

    // private getUniqueDishTypeIds(dishes: { dishTypeId: number }[]) {
    //     return [...new Set(dishes.map(dish => dish.dishTypeId))];
    // }

    private validateDayOrder(dayNumber: number, expectedDayNumber: number) {
        if (dayNumber !== expectedDayNumber) {
            throw new BadRequestException('Дни идут в неправильном порядке');
        }
    }

    // private validateDishTypesStructure(
    //     dishes: { dishTypeId: number }[],
    //     expectedDishTypeIds: number[]
    // ) {
    //     const dayDishTypeIds = this.getUniqueDishTypeIds(dishes);

    //     if (dayDishTypeIds.length !== expectedDishTypeIds.length) {
    //         throw new BadRequestException('Нарушена структура приемов пищи');
    //     }

    //     if (!dayDishTypeIds.every(id => expectedDishTypeIds.includes(id))) {
    //         throw new BadRequestException(
    //             'Нарушена структура приемов пищи (отсутствуют нужные типы блюд)'
    //         );
    //     }
    // }

    private validateDishes(
        dishes: { dishTypeId: number; dishId: number; isPrimary: boolean }[]
    ) {
        const dishTypeGroups = this.groupByDishType(dishes);

        for (const dishTypeId in dishTypeGroups) {
            const targetDishes = dishTypeGroups[dishTypeId];

            this.validateUniqueDishes(targetDishes);
            this.validatePrimaryDishes(targetDishes);
        }
    }

    private groupByDishType(dishes: { dishTypeId: number }[]) {
        return dishes.reduce((grouped, dish) => {
            (grouped[dish.dishTypeId] = grouped[dish.dishTypeId] || []).push(
                dish
            );
            return grouped;
        }, {});
    }

    private validateUniqueDishes(dishes: { dishId: number }[]) {
        const dishIds = dishes.map(dish => dish.dishId);
        const uniqueDishIds = [...new Set(dishIds)];

        if (dishIds.length !== uniqueDishIds.length) {
            throw new BadRequestException(
                'В рамках одного приема пищи не должно быть повторения блюд'
            );
        }
    }

    private validatePrimaryDishes(dishes: { isPrimary: boolean }[]) {
        const primaryDishesCount = dishes.filter(dish => dish.isPrimary).length;
        // const replacementDishesCount = dishes.filter(
        //     dish => !dish.isPrimary
        // ).length;

        if (primaryDishesCount !== 1) {
            throw new BadRequestException(
                'В рамках одного приема пищи должно быть ровно 1 основное блюдо'
            );
        }

        // if (replacementDishesCount < 1) {
        //     throw new BadRequestException(
        //         'В рамках одного приема пищи должна быть как минимум 1 замена'
        //     );
        // }
    }
}
