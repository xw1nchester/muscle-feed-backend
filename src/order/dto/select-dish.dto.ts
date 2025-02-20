import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SelectDishDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    dayId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    dishTypeId: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    dishId: number;
}
