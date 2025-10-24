import { WeekDay } from '@shared/enums/weekday.enum';

interface DeliveryInfo {
    isDelivery: boolean;
    daysToNext?: number;
}

export type DeliveryMap = {
    [key in WeekDay]: DeliveryInfo;
};
