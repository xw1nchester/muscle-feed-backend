import { IsString } from 'class-validator';

export class ProfileRequestDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    phone: string;

    @IsString()
    allergies: string;
}
