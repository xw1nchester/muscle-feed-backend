import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

import { Language } from '@prisma/client';

export class AuthRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsEnum(Language)
    language: Language;
}
