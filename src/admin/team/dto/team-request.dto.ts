import { IsString } from 'class-validator';

import { IsUrlOrLocal } from '@validators/is-url-or-local.decorator';

export class TeamRequestDto {
    @IsUrlOrLocal()
    picture: string;

    @IsString()
    roleRu: string;

    @IsString()
    roleHe: string;

    @IsString()
    nameRu: string;

    @IsString()
    nameHe: string;

    @IsString()
    descriptionRu: string;

    @IsString()
    descriptionHe: string;
}
