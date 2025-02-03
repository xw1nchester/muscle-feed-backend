import { IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
    @IsString()
    @MinLength(8)
    oldPassword: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}
