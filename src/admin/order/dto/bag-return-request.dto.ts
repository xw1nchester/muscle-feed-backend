import { IsEnum } from 'class-validator';

import { BagReturnStatus } from '@prisma/client';

export class BagReturnRequestDto {
    @IsEnum(BagReturnStatus)
    status: BagReturnStatus;
}
