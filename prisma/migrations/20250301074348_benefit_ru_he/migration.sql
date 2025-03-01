/*
  Warnings:

  - You are about to drop the column `benefit` on the `dishes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dishes" DROP COLUMN "benefit",
ADD COLUMN     "benefit_he" TEXT,
ADD COLUMN     "benefit_ru" TEXT;
