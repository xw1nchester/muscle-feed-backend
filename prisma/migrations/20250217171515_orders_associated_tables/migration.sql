-- CreateEnum
CREATE TYPE "DaySkipType" AS ENUM ('WEEKDAY_SKIPPED', 'FROZEN');

-- CreateTable
CREATE TABLE "order_day_dishes" (
    "id" SERIAL NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "order_day_id" INTEGER NOT NULL,
    "dish_type_id" INTEGER NOT NULL,
    "dish_id" INTEGER NOT NULL,

    CONSTRAINT "order_day_dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_days" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isSkippped" BOOLEAN NOT NULL DEFAULT false,
    "day_skip_type" "DaySkipType",
    "order_id" INTEGER NOT NULL,

    CONSTRAINT "order_days_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_day_dishes" ADD CONSTRAINT "order_day_dishes_order_day_id_fkey" FOREIGN KEY ("order_day_id") REFERENCES "order_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_day_dishes" ADD CONSTRAINT "order_day_dishes_dish_type_id_fkey" FOREIGN KEY ("dish_type_id") REFERENCES "dish_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_day_dishes" ADD CONSTRAINT "order_day_dishes_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_days" ADD CONSTRAINT "order_days_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
