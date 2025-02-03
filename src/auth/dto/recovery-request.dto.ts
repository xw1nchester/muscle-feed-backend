import { IsEmail } from 'class-validator';

export class RecoveryRequestDto {
    @IsEmail()
    email: string;
}
