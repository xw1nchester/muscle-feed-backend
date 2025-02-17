/*
  Warnings:

  - You are about to drop the column `meal_count_he` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `meal_count_ru` on the `menus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menus" DROP COLUMN "meal_count_he",
DROP COLUMN "meal_count_ru",
ADD COLUMN     "meals_count_he" TEXT,
ADD COLUMN     "meals_count_ru" TEXT;
