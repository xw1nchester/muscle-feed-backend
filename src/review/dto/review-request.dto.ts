import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { Language } from '@prisma/client';

export class ReviewRequestDto {
    @IsString()
    @IsNotEmpty()
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
