import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { FeedbackRequestType } from '@prisma/client';

export class FeedbackRequestDto {
    @IsEnum(FeedbackRequestType)
    feedbackRequestType: FeedbackRequestType;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsOptional()
    @IsString()
    cityName: string;
}
