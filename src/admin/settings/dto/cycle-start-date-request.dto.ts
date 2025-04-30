import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';

export class CycleStartDateRequestDto {
    @Transform(({ value }) => new Date(value))
    @IsDate()
    cycleStartDate: Date;
}
