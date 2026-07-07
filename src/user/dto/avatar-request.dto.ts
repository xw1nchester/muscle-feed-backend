import { IsNotEmpty } from 'class-validator';

import { IsUrlOrLocal } from '@validators';

export class AvatarRequestDto {
    @IsUrlOrLocal()
    @IsNotEmpty()
    avatar: string;
}
