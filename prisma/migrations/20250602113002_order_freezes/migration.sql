-- CreateTable
CREATE TABLE "order_freezes" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "order_id" INTEGER NOT NULL,

    CONSTRAINT "order_freezes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_freezes" ADD CONSTRAINT "order_freezes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
