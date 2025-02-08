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
    @IsNotEmpty()
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
    @IsNotEmpty()
    calories: number;

    @IsNumber()
    @IsNotEmpty()
    weight: number;

    @IsNumber()
    @IsNotEmpty()
    proteins: number;

    @IsNumber()
    @IsNotEmpty()
    fats: number;

    @IsNumber()
    @IsNotEmpty()
    carbohydrates: number;

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}
