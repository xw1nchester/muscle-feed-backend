-- CreateTable
CREATE TABLE "faq_categories" (
    "id" SERIAL NOT NULL,
    "picture" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq" (
    "id" SERIAL NOT NULL,
    "question_ru" TEXT NOT NULL,
    "question_he" TEXT NOT NULL,
    "answer_ru" TEXT NOT NULL,
    "answer_he" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "faq_category_id" INTEGER NOT NULL,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "faq" ADD CONSTRAINT "faq_faq_category_id_fkey" FOREIGN KEY ("faq_category_id") REFERENCES "faq_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
