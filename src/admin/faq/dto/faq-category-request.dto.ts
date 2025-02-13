import { IsNotEmpty, IsString } from 'class-validator';

import { IsUrlOrLocal } from '@validators';

export class FaqCategoryRequestDto {
    @IsUrlOrLocal()
    @IsNotEmpty()
    picture: string;

    @IsString()
    @IsNotEmpty()
    nameRu: string;

    @IsString()
    @IsNotEmpty()
    nameHe: string;
}
