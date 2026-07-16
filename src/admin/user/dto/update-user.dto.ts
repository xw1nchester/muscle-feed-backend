import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';

import { Role } from '@prisma/client';

import { ProfileRequestDto } from '@user/dto/profile-request.dto';

export class UpdateUserDto extends ProfileRequestDto {
    @IsBoolean()
    isVerified: boolean;

    @IsArray()
    @IsEnum(Role, { each: true })
    roles: Role[];

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(0)
    bonusPoints: number;
}
