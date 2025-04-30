export const getTodayZeroDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setTime(today.getTime() - today.getTimezoneOffset() * 60000);

    return today;
};
