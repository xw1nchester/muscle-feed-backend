-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "freeze_end_date" TIMESTAMP(3),
ADD COLUMN     "freeze_start_date" TIMESTAMP(3);
