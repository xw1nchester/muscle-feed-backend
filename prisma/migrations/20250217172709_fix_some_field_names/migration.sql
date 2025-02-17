/*
  Warnings:

  - You are about to drop the column `isSelected` on the `order_day_dishes` table. All the data in the column will be lost.
  - You are about to drop the column `isSkippped` on the `order_days` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_day_dishes" DROP COLUMN "isSelected",
ADD COLUMN     "is_selected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "order_days" DROP COLUMN "isSkippped",
ADD COLUMN     "is_skipped" BOOLEAN NOT NULL DEFAULT false;
