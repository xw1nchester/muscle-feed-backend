-- AlterTable
ALTER TABLE "menu_prices" ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gift_days_count" INTEGER NOT NULL DEFAULT 0;
