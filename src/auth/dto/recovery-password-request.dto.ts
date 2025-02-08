import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RecoveryPasswordRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}
