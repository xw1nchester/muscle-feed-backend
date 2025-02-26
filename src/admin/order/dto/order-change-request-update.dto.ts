import { IsBoolean } from 'class-validator';

export class OrderChangeRequestUpdateDto {
    @IsBoolean()
    isProcessed: boolean;
}
