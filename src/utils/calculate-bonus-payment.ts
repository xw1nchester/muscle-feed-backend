const MAX_BONUS_PERCENT = 20;

// лучшее ли это место для данного расчета
export const calculateBonusPayment = (
    priceBeforeBonuses: number,
    availableBonusPoints: number
) => {
    const maximumForOrder = Math.floor(
        (priceBeforeBonuses * MAX_BONUS_PERCENT) / 100
    );

    const bonusPointsSpent = Math.min(
        availableBonusPoints,
        maximumForOrder,
        priceBeforeBonuses
    );

    return {
        bonusPointsSpent,
        finalPrice: priceBeforeBonuses - bonusPointsSpent
    };
};
