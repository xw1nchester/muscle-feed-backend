import { IsNotEmpty, IsString } from 'class-validator';

import { IsUrlOrLocal } from '@validators/is-url-or-local.decorator';

export class TeamRequestDto {
    @IsUrlOrLocal()
    @IsNotEmpty()
    picture: string;

    @IsString()
    @IsNotEmpty()
    roleRu: string;

    @IsString()
    @IsNotEmpty()
    roleHe: string;

    @IsString()
    @IsNotEmpty()
    nameRu: string;

    @IsString()
    @IsNotEmpty()
    nameHe: string;

    @IsString()
    @IsNotEmpty()
    descriptionRu: string;

    @IsString()
    @IsNotEmpty()
    descriptionHe: string;
}
