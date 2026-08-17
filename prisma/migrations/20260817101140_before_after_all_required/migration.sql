/*
  Warnings:

  - Made the column `before_picture` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `after_picture` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `author_ru` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `author_he` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `text_ru` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `text_he` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight_before` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight_after` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration_ru` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration_he` on table `before_after` required. This step will fail if there are existing NULL values in that column.
  - Made the column `calories` on table `before_after` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "before_after" ALTER COLUMN "before_picture" SET NOT NULL,
ALTER COLUMN "after_picture" SET NOT NULL,
ALTER COLUMN "author_ru" SET NOT NULL,
ALTER COLUMN "author_he" SET NOT NULL,
ALTER COLUMN "text_ru" SET NOT NULL,
ALTER COLUMN "text_he" SET NOT NULL,
ALTER COLUMN "weight_before" SET NOT NULL,
ALTER COLUMN "weight_after" SET NOT NULL,
ALTER COLUMN "duration_ru" SET NOT NULL,
ALTER COLUMN "duration_he" SET NOT NULL,
ALTER COLUMN "calories" SET NOT NULL;
