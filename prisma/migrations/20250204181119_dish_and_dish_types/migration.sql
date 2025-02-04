/*
  Warnings:

  - You are about to drop the column `descriptionHe` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionRu` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `nameHe` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `nameRu` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `roleHe` on the `team` table. All the data in the column will be lost.
  - You are about to drop the column `roleRu` on the `team` table. All the data in the column will be lost.
  - Added the required column `description_he` to the `team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_ru` to the `team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_he` to the `team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_he` to the `team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_ru` to the `team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "team" DROP COLUMN "descriptionHe",
DROP COLUMN "descriptionRu",
DROP COLUMN "nameHe",
DROP COLUMN "nameRu",
DROP COLUMN "roleHe",
DROP COLUMN "roleRu",
ADD COLUMN     "description_he" TEXT NOT NULL,
ADD COLUMN     "description_ru" TEXT NOT NULL,
ADD COLUMN     "name_he" TEXT NOT NULL,
ADD COLUMN     "name_ru" TEXT NOT NULL,
ADD COLUMN     "role_he" TEXT NOT NULL,
ADD COLUMN     "role_ru" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "dish_types" (
    "id" SERIAL NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,

    CONSTRAINT "dish_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" SERIAL NOT NULL,
    "admin_name" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "dish_type_id" INTEGER NOT NULL,
    "picture" TEXT NOT NULL,
    "description_ru" TEXT NOT NULL,
    "description_he" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "proteins" INTEGER NOT NULL,
    "fats" INTEGER NOT NULL,
    "carbohydrates" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_dish_type_id_fkey" FOREIGN KEY ("dish_type_id") REFERENCES "dish_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
