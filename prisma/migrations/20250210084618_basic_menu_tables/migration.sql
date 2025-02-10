-- CreateTable
CREATE TABLE "menu_day_dishes" (
    "id" SERIAL NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "menu_day_id" INTEGER NOT NULL,
    "dish_type_id" INTEGER NOT NULL,
    "dish_id" INTEGER NOT NULL,

    CONSTRAINT "menu_day_dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_days" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,

    CONSTRAINT "menu_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "admin_name" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "description_ru" TEXT NOT NULL,
    "description_he" TEXT NOT NULL,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cycleStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "menu_type_id" INTEGER NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_types" (
    "id" SERIAL NOT NULL,
    "admin_name" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "description_ru" TEXT NOT NULL,
    "description_he" TEXT NOT NULL,
    "short_description_ru" TEXT NOT NULL,
    "short_description_he" TEXT NOT NULL,
    "initial_price_ru" TEXT NOT NULL,
    "initial_price_he" TEXT NOT NULL,
    "background_picture" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "menu_day_dishes" ADD CONSTRAINT "menu_day_dishes_menu_day_id_fkey" FOREIGN KEY ("menu_day_id") REFERENCES "menu_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_day_dishes" ADD CONSTRAINT "menu_day_dishes_dish_type_id_fkey" FOREIGN KEY ("dish_type_id") REFERENCES "dish_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_day_dishes" ADD CONSTRAINT "menu_day_dishes_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_days" ADD CONSTRAINT "menu_days_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_menu_type_id_fkey" FOREIGN KEY ("menu_type_id") REFERENCES "menu_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
