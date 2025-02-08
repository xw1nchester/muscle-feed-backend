import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReviewRequestDto {
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
