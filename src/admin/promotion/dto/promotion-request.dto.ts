import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';

import { PromotionActionType } from '@prisma/client';

import { IsUrlOrLocal } from '@validators';

export class PromotionRequestDto {
    @IsUrlOrLocal()
    picture: string;

    @IsString()
    @IsNotEmpty()
    badgeTextRu: string;

    @IsString()
    @IsNotEmpty()
    badgeTextHe: string;

    @IsString()
    @IsNotEmpty()
    titleRu: string;

    @IsString()
    @IsNotEmpty()
    titleHe: string;

    @IsString()
    @IsNotEmpty()
    descriptionRu: string;

    @IsString()
    @IsNotEmpty()
    descriptionHe: string;

    @IsEnum(PromotionActionType)
    actionType: PromotionActionType;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    order: number;

    @IsBoolean()
    isPublished: boolean;

    @IsOptional()
    @Transform(({ value }) =>
        value === undefined || value === null ? value : new Date(value)
    )
    @IsDate()
    expiresAt?: Date | null;
}
