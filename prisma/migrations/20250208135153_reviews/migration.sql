-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "picture" TEXT NOT NULL,
    "author_ru" TEXT NOT NULL,
    "author_he" TEXT NOT NULL,
    "text_ru" TEXT NOT NULL,
    "text_he" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
