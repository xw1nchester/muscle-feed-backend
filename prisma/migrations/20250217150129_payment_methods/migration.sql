-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_city_id_fkey";

-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "city_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
