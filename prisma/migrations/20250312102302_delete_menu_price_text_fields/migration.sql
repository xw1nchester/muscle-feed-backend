/*
  Warnings:

  - You are about to drop the column `price_per_day_he` on the `menu_prices` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_day_ru` on the `menu_prices` table. All the data in the column will be lost.
  - You are about to drop the column `total_price_he` on the `menu_prices` table. All the data in the column will be lost.
  - You are about to drop the column `total_price_ru` on the `menu_prices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_prices" DROP COLUMN "price_per_day_he",
DROP COLUMN "price_per_day_ru",
DROP COLUMN "total_price_he",
DROP COLUMN "total_price_ru";
