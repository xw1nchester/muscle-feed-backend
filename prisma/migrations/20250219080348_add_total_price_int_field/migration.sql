/*
  Warnings:

  - Added the required column `total_price` to the `menu_prices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menu_prices" ADD COLUMN     "total_price" INTEGER NOT NULL;
