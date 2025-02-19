/*
  Warnings:

  - You are about to drop the column `total_price` on the `menu_prices` table. All the data in the column will be lost.
  - Added the required column `price` to the `menu_prices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menu_prices" DROP COLUMN "total_price",
ADD COLUMN     "price" INTEGER NOT NULL;
