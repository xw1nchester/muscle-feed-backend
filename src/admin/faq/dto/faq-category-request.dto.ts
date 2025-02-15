import { IsNotEmpty, IsString } from 'class-validator';

export class FaqCategoryRequestDto {
    @IsString()
    @IsNotEmpty()
    picture: string;

    @IsString()
    @IsNotEmpty()
    nameRu: string;

    @IsString()
    @IsNotEmpty()
    nameHe: string;
}
