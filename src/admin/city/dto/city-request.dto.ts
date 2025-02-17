import { IsNotEmpty, IsString } from 'class-validator';

export class CityRequestDto {
    @IsString()
    @IsNotEmpty()
    nameRu: string;

    @IsString()
    @IsNotEmpty()
    nameHe: string;
}
