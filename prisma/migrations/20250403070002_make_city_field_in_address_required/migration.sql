/*
  Warnings:

  - Made the column `city_id` on table `addresses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_city_id_fkey";

-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "city_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
