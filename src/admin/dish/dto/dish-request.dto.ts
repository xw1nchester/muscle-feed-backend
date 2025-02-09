import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { IsUrlOrLocal } from '@validators';

export class DishRequestDto {
    @IsString()
    @IsNotEmpty()
    adminName: string;

    @IsString()
    @IsNotEmpty()
    nameRu: string;

    @IsString()
    @IsNotEmpty()
    nameHe: string;

    @IsNumber()
    dishTypeId: number;

    @IsUrlOrLocal()
    @IsNotEmpty()
    picture: string;

    @IsString()
    @IsNotEmpty()
    descriptionRu: string;

    @IsString()
    @IsNotEmpty()
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
    @IsNotEmpty()
    isActive: boolean;
}
