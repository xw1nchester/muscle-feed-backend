import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

// наверно лучше сделать все поля опциональными
// и если клиент их не отправляет, то оставлять старое значение
export class ProfileRequestDto {
    @Transform(({ value }) => value.toLowerCase())
    @IsEmail()
    email: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    phone: string;

    @IsString()
    allergies: string;
}
