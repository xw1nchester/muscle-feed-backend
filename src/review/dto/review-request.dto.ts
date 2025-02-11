import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Language } from '@prisma/client';

import { IsUrlOrLocal } from '@validators';

export class ReviewRequestDto {
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
