import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { OrderRequestDto } from '@order/dto/order-request.dto';

export class AdminOrderRequestDto extends OrderRequestDto {
    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
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
}
