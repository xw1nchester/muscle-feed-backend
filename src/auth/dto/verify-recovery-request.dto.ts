import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyRecoveryRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}
