import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsNumber,
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
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => MenuDayDishDto)
    dishes: MenuDayDishDto[];
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

    @IsDateString()
    cycleStartDate: Date;

    @IsBoolean()
    isPublished: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MenuDayDto)
    days: MenuDayDto[];
}
