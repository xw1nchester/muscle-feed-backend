-- AlterTable
ALTER TABLE "dishes" ADD COLUMN     "is_individual_order_available" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skipped_weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
