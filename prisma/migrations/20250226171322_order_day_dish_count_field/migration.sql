-- AlterTable
ALTER TABLE "order_day_dishes" ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "dish_type_id" DROP NOT NULL;
