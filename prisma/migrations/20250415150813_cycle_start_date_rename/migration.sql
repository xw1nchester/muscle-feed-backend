/*
  Warnings:

  - You are about to drop the column `cycleStartDate` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `cycleStartDate` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menus" DROP COLUMN "cycleStartDate",
ADD COLUMN     "cycle_start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "cycleStartDate",
ADD COLUMN     "cycle_start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
