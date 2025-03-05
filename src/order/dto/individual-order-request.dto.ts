import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';

class IndividualOrderDishDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    id: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(1)
    count: number;
}

export class IndividualOrderRequestDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => IndividualOrderDishDto)
    dishes: IndividualOrderDishDto[];

    @Transform(({ value }) => new Date(value))
    @IsDate()
    date: Date;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    paymentMethodId: number;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    allergies: string;

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

    @IsOptional()
    @IsNumber()
    promocodeId: number;
}
