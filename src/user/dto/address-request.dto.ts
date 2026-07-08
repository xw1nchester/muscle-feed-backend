import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddressRequestDto {
    @IsString()
    @IsOptional()
    name: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    cityId: number;

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

    @IsString()
    @IsOptional()
    comment: string;
}
