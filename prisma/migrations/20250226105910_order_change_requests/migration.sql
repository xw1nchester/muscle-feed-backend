-- CreateEnum
CREATE TYPE "OrderChangeType" AS ENUM ('MENU', 'CALORIES', 'DURATION', 'FORMAT', 'FREEZE');

-- CreateTable
CREATE TABLE "order_change_requests" (
    "id" SERIAL NOT NULL,
    "orderChangeType" "OrderChangeType" NOT NULL,
    "comment" TEXT,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "order_id" INTEGER NOT NULL,

    CONSTRAINT "order_change_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_change_requests" ADD CONSTRAINT "order_change_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
