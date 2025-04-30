/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "settings" DROP COLUMN "phoneNumber",
ADD COLUMN     "phone_number" TEXT;
