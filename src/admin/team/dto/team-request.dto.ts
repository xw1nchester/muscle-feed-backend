import { IsString, IsUrl } from 'class-validator';

export class TeamRequestDto {
    // TODO: должно быть IsUrl, но localhost не считает за url
    @IsString()
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
