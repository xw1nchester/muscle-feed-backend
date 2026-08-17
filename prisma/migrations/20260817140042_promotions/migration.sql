-- CreateEnum
CREATE TYPE "PromotionActionType" AS ENUM ('ORDER', 'REGISTER', 'REVIEW', 'NONE');

-- CreateTable
CREATE TABLE "promotions" (
    "id" SERIAL NOT NULL,
    "picture" TEXT NOT NULL,
    "badge_text_ru" TEXT NOT NULL,
    "badge_text_he" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "title_he" TEXT NOT NULL,
    "description_ru" TEXT NOT NULL,
    "description_he" TEXT NOT NULL,
    "action_type" "PromotionActionType" NOT NULL DEFAULT 'NONE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);
