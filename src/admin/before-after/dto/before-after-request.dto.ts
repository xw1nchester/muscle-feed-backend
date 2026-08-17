import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
    Max,
    Min
} from 'class-validator';

import { IsUrlOrLocal } from '@validators';

export class BeforeAfterRequestDto {
    @IsUrlOrLocal()
    beforePicture: string;

    @IsUrlOrLocal()
    afterPicture: string;

    @IsString()
    @IsNotEmpty()
    authorRu: string;

    @IsString()
    @IsNotEmpty()
    authorHe: string;

    @IsString()
    @IsNotEmpty()
    textRu: string;

    @IsString()
    @IsNotEmpty()
    textHe: string;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    @Min(1)
    @Max(500)
    weightBefore: number;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    @Min(1)
    @Max(500)
    weightAfter: number;

    @IsString()
    @IsNotEmpty()
    durationRu: string;

    @IsString()
    @IsNotEmpty()
    durationHe: string;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    @Min(1)
    calories: number;

    @IsBoolean()
    isPublished: boolean;
}
