import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddressRequestDto {
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    house: string;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    floor: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    apartment: number;
}
