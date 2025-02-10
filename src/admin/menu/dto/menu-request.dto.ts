import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsString,
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
    day: number;

    @IsArray()
    @ArrayMinSize(3)
    @ValidateNested({ each: true })
    @Type(() => MenuDayDishDto)
    menuDayDishes: MenuDayDishDto[];
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

    @Transform(({ value }) => Number(value))
    @IsNumber()
    calories: number;

    @IsNumber()
    order: number;

    @IsDate()
    cycleStartDate: Date;

    @IsBoolean()
    isPublished: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MenuDayDto)
    menuDays: MenuDayDto[];
}
