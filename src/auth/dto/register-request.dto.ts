import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

import { Language } from '@prisma/client';

export class RegisterRequestDto {
    @Transform(({ value }) => value.toLowerCase())
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsEnum(Language)
    language: Language;
}
