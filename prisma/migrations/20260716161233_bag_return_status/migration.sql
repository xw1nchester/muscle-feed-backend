/*
  Warnings:

  - You are about to drop the column `confirmed` on the `order_day_bag_returns` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BagReturnStatus" AS ENUM ('REPORTED', 'CONFIRMED', 'REJECTED');

-- AlterTable
ALTER TABLE "order_day_bag_returns" DROP COLUMN "confirmed",
ADD COLUMN     "status" "BagReturnStatus" NOT NULL DEFAULT 'REPORTED';
