import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
    Max,
    Min
} from 'class-validator';

export class ReviewRequestDto {
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsNotEmpty()
    picture: string;

    @IsString()
    @IsNotEmpty()
    authorRu: string;

    @IsString()
    @IsNotEmpty()
    authorHe: string;

    @IsString()
    @IsNotEmpty()
    textRu: string;

    @IsString()
    @IsNotEmpty()
    textHe: string;

    @IsBoolean()
    isPublished: boolean;
}
