import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min
} from 'class-validator';

import { IsUrlOrLocal } from '@validators';

export class ReviewRequestDto {
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsUrlOrLocal()
    picture: string;

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

    @IsBoolean()
    isPublished: boolean;
}
