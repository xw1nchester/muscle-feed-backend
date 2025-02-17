-- AlterTable
ALTER TABLE "dishes" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "calories" SET DEFAULT 0,
ALTER COLUMN "weight" SET DEFAULT 0,
ALTER COLUMN "proteins" SET DEFAULT 0,
ALTER COLUMN "fats" SET DEFAULT 0,
ALTER COLUMN "carbohydrates" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "menus" ADD COLUMN     "meal_count_he" TEXT,
ADD COLUMN     "meal_count_ru" TEXT;
