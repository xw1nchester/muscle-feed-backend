import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { IsUrlOrLocal } from '@validators';

export class MenuTypeRequestDto {
    @IsString()
    @IsNotEmpty()
    adminName: string;

    @IsString()
    @IsNotEmpty()
    nameRu: string;

    @IsString()
    @IsNotEmpty()
    nameHe: string;

    @IsString()
    @IsNotEmpty()
    descriptionRu: string;

    @IsString()
    @IsNotEmpty()
    descriptionHe: string;

    @IsString()
    @IsNotEmpty()
    shortDescriptionRu: string;

    @IsString()
    @IsNotEmpty()
    shortDescriptionHe: string;

    @IsString()
    @IsNotEmpty()
    initialPriceRu: string;

    @IsString()
    @IsNotEmpty()
    initialPriceHe: string;

    @IsUrlOrLocal()
    @IsNotEmpty()
    backgroundPicture: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    order: number;

    @IsBoolean()
    isPublished: boolean;
}
