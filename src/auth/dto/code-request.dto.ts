import { IsNotEmpty, IsString } from 'class-validator';

export class CodeRequestDto {
    @IsString()
    @IsNotEmpty()
    code: string;
}
