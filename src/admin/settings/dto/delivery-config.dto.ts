import { IsArray, IsEnum } from 'class-validator';

import { WeekDay } from '@shared/enums/weekday.enum';

export class DeliveryConfigDto {
    @IsArray()
    @IsEnum(WeekDay, { each: true })
    deliveryWeekdays: WeekDay[];
}
