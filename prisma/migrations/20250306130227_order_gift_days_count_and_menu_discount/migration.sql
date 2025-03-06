/*
  Warnings:

  - Made the column `paid_amount` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `promocode_discount` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "gift_days_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "menu_discount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "paid_amount" SET NOT NULL,
ALTER COLUMN "promocode_discount" SET NOT NULL;
