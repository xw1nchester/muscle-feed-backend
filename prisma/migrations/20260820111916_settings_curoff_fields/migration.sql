-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "business_time_zone" TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
ADD COLUMN     "next_day_order_cutoff_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "next_day_order_cutoff_minutes" INTEGER NOT NULL DEFAULT 1020;
