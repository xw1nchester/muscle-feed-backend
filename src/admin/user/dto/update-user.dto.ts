import { IsArray, IsBoolean, IsEnum } from 'class-validator';

import { Role } from '@prisma/client';

export class UpdateUserDto {
    @IsBoolean()
    isVerified: boolean;

    @IsArray()
    @IsEnum(Role, { each: true })
    roles: Role[];
}
