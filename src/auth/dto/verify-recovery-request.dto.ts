import { IsEmail, IsString } from 'class-validator';

export class VerifyRecoveryRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    code: string;
}
