import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { IsUrlOrLocal } from '@validators';

export class DishRequestDto {
    @IsString()
    adminName: string;

    @IsString()
    nameRu: string;

    @IsString()
    nameHe: string;

    @IsNumber()
    dishTypeId: number;

    @IsUrlOrLocal()
    picture: string;

    @IsString()
    descriptionRu: string;

    @IsString()
    descriptionHe: string;

    @IsNumber()
    calories: number;

    @IsNumber()
    weight: number;

    @IsNumber()
    proteins: number;

    @IsNumber()
    fats: number;

    @IsNumber()
    carbohydrates: number;

    @IsBoolean()
    isActive: boolean;
}
