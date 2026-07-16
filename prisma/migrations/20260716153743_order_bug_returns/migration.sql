-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bonus_points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "order_day_bag_returns" (
    "id" SERIAL NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "order_day_id" INTEGER NOT NULL,

    CONSTRAINT "order_day_bag_returns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_day_bag_returns_order_day_id_key" ON "order_day_bag_returns"("order_day_id");

-- AddForeignKey
ALTER TABLE "order_day_bag_returns" ADD CONSTRAINT "order_day_bag_returns_order_day_id_fkey" FOREIGN KEY ("order_day_id") REFERENCES "order_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
