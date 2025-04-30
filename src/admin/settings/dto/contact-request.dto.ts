import { Type } from 'class-transformer';
import {
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsString,
    ValidateNested
} from 'class-validator';

import { IsUrlOrLocal } from '@validators';

class SocialRequestDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUrlOrLocal()
    @IsNotEmpty()
    link: string;

    @IsUrlOrLocal()
    @IsNotEmpty()
    icon: string;
}

export class ContactRequestDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsEmail()
    email: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialRequestDto)
    socials: SocialRequestDto[];
}
