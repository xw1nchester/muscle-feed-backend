-- CreateTable
CREATE TABLE "before_after" (
    "id" SERIAL NOT NULL,
    "before_picture" TEXT,
    "after_picture" TEXT,
    "author_ru" TEXT,
    "author_he" TEXT,
    "text_ru" TEXT,
    "text_he" TEXT,
    "weight_before" INTEGER,
    "weight_after" INTEGER,
    "duration_ru" TEXT,
    "duration_he" TEXT,
    "calories" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "before_after_pkey" PRIMARY KEY ("id")
);
