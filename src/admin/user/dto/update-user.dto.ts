import { IsArray, IsBoolean, IsEnum } from 'class-validator';

import { Role } from '@prisma/client';

import { ProfileRequestDto } from '@user/dto/profile-request.dto';

export class UpdateUserDto extends ProfileRequestDto {
    @IsBoolean()
    isVerified: boolean;

    @IsArray()
    @IsEnum(Role, { each: true })
    roles: Role[];
}
