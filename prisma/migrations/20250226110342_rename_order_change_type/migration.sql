/*
  Warnings:

  - You are about to drop the column `orderChangeType` on the `order_change_requests` table. All the data in the column will be lost.
  - Added the required column `order_change_type` to the `order_change_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrderChangeType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "order_change_requests" DROP COLUMN "orderChangeType",
ADD COLUMN     "order_change_type" "OrderChangeType" NOT NULL;
