import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FaqRequestDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    faqCategoryId: number;

    @IsString()
    @IsNotEmpty()
    questionRu: string;

    @IsString()
    @IsNotEmpty()
    questionHe: string;

    @IsString()
    @IsNotEmpty()
    answerRu: string;

    @IsString()
    @IsNotEmpty()
    answerHe: string;
}
