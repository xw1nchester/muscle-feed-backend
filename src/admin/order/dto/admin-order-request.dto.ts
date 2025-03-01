import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    ValidateIf
} from 'class-validator';

import { OrderRequestDto } from '@order/dto/order-request.dto';

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
    paidAmount: number;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    promocodeDiscount: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    finalPrice: number;

    @ValidateIf(o => o.freezeEndDate != undefined)
    @Transform(({ value }) => new Date(value))
    @IsDate()
    freezeStartDate: Date;

    @ValidateIf(o => o.freezeStartDate != undefined)
    @Transform(({ value }) => new Date(value))
    @IsDate()
    freezeEndDate: Date;

    @IsBoolean()
    isProcessed: boolean;

    @IsBoolean()
    isAllowedExtendion: boolean;

    @IsBoolean()
    isPaid: boolean;

    @IsBoolean()
    isCompleted: boolean;
}
