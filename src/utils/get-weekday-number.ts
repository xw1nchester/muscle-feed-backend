import { WeekDay } from '@shared/enums/weekday.enum';

export const getWeekdayNumber = (date: Date): WeekDay => {
    const jsDay = date.getDay();
    return jsDay === 0 ? 7 : jsDay;
};
