export const isDeliveryDate = (
    dateToCheck: Date,
    cycleStart: Date,
    stepDays: number
): boolean => {
    const diffDays = Math.floor(
        (dateToCheck.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffDays % stepDays === 0;
};
