-- CreateTable
CREATE TABLE "menu_prices" (
    "id" SERIAL NOT NULL,
    "days_count" INTEGER NOT NULL,
    "total_price_ru" TEXT NOT NULL,
    "total_price_he" TEXT NOT NULL,
    "price_per_day_ru" TEXT NOT NULL,
    "price_per_day_he" TEXT NOT NULL,
    "menu_id" INTEGER NOT NULL,

    CONSTRAINT "menu_prices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "menu_prices" ADD CONSTRAINT "menu_prices_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
