import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';

class MenuDayDishDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    dishTypeId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    dishId: number;

    @IsBoolean()
    isPrimary: boolean;
}

class MenuDayDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(1)
    number: number;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MenuDayDishDto)
    dishes: MenuDayDishDto[];
}

class MenuPriceDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(1)
    daysCount: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @IsString()
    @IsNotEmpty()
    totalPriceRu: string;

    @IsString()
    @IsNotEmpty()
    totalPriceHe: string;

    @IsString()
    @IsNotEmpty()
    pricePerDayRu: string;

    @IsString()
    @IsNotEmpty()
    pricePerDayHe: string;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @Min(0)
    discount: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @Min(0)
    giftDaysCount: number;
}

export class MenuRequestDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    menuTypeId: number;

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
    mealsCountRu: string;

    @IsString()
    @IsNotEmpty()
    mealsCountHe: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    calories: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    order: number;

    @Transform(({ value }) => new Date(value))
    @IsDate()
    cycleStartDate: Date;

    @IsBoolean()
    isPublished: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MenuDayDto)
    days: MenuDayDto[];

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MenuPriceDto)
    prices: MenuPriceDto[];
}
