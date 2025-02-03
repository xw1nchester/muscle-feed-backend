import { IsString } from 'class-validator';

export class CodeRequestDto {
    @IsString()
    code: string;
}
