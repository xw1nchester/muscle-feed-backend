import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

import { OrderRequestDto } from '@order/dto/order-request.dto';

export class AdminOrderRequestDto extends OrderRequestDto {
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

    @IsBoolean()
    isProcessed: boolean;

    @IsBoolean()
    isAllowedExtendion: boolean;

    @IsBoolean()
    isPaid: boolean;

    @IsBoolean()
    isCompleted: boolean;
}
