import { IsEnum, IsOptional, IsString } from 'class-validator';

import { OrderChangeType } from '@prisma/client';

export class OrderChangeRequestDto {
    @IsEnum(OrderChangeType)
    orderChangeType: OrderChangeType;

    @IsOptional()
    @IsString()
    comment: string;
}
