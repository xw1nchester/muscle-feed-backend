import { Transform } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min
} from 'class-validator';

import { Language } from '@prisma/client';

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
    author: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsEnum(Language)
    language: Language;
}
