import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';

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

    @Transform(({ value }) => Number(value))
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

    @Transform(({ value }) => Number(value))
    @IsNumber()
    calories: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    weight: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    proteins: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    fats: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    carbohydrates: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    benefit: string;

    @IsBoolean()
    @IsNotEmpty()
    isPublished: boolean;
}
