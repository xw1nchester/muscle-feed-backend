import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsTimeZone,
    Max,
    Min
} from 'class-validator';

export class DeliveryCutoffConfigDto {
    @IsBoolean()
    enabled: boolean;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    @Max(23)
    hours: number;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    @Max(59)
    minutes: number;

    @IsOptional()
    @IsTimeZone()
    timeZone?: string;
}
