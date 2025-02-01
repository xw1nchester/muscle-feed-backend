/*
  Warnings:

  - Added the required column `language` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('RU', 'HE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language" "Language" NOT NULL;
