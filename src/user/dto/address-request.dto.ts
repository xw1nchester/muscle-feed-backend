import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddressRequestDto {
    @IsString()
    city: string;

    @IsString()
    street: string;

    @IsString()
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
