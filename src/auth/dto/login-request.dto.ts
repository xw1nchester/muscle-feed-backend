import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
    @Transform(({ value }) => value.toLowerCase())
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}
