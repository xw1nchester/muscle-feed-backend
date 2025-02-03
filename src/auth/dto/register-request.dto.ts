import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

import { Language } from '@prisma/client';

export class RegisterRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsEnum(Language)
    language: Language;
}
