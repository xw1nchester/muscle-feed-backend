/*
  Warnings:

  - You are about to drop the column `is_active` on the `dishes` table. All the data in the column will be lost.
  - Added the required column `is_published` to the `dishes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dishes" DROP COLUMN "is_active",
ADD COLUMN     "is_published" BOOLEAN NOT NULL;
