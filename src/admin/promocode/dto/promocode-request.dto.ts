import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class PromocodeRequestDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(0)
    discount: number;
}
