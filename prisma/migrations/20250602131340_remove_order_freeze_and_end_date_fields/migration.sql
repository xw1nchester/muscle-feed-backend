/*
  Warnings:

  - You are about to drop the column `freeze_end_date` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `freeze_start_date` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "freeze_end_date",
DROP COLUMN "freeze_start_date";
