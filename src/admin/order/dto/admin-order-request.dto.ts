import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    Min,
    ValidateNested
} from 'class-validator';

import { OrderRequestDto } from '@order/dto/order-request.dto';

export class FreezeDto {
    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate: Date;

    @Transform(({ value }) => new Date(value))
    @IsDate()
    endDate: Date;
}

export class AdminOrderRequestDto extends OrderRequestDto {
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    menuId: number;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    userId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    paidAmount?: number;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    promocodeDiscount?: number;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    menuDiscount: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    finalPrice: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FreezeDto)
    freezes: FreezeDto[];

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @Min(0)
    giftDaysCount: number;

    @IsBoolean()
    isProcessed: boolean;

    @IsBoolean()
    isAllowedExtendion: boolean;

    @IsBoolean()
    isPaid: boolean;

    @IsBoolean()
    isCompleted: boolean;
}
