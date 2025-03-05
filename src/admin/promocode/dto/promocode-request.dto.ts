import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PromocodeRequestDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    discount: number;
}
