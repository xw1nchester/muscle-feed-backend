export const calculateDiscountedPrice = (price: number, discount: number) => {
    const finalPrice = price * (1 - discount / 100);

    return Math.round(finalPrice / 10) * 10;
};
