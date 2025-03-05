import { Transform } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min
} from 'class-validator';

import { WeekDay } from '@order/enums/weekday.enum';

export class OrderRequestDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    menuId: number;

    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate: Date;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(1)
    daysCount: number;

    @IsArray()
    @IsEnum(WeekDay, { each: true })
    skippedWeekdays: WeekDay[];

    @Transform(({ value }) => Number(value))
    @IsNumber()
    paymentMethodId: number;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    allergies: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    cityId: number;

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    house: string;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    floor: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    apartment: number;

    @IsString()
    @IsOptional()
    comment: string;

    @IsOptional()
    @IsNumber()
    promocodeId: number;
}
