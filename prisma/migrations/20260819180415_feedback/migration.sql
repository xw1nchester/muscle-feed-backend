-- CreateEnum
CREATE TYPE "FeedbackRequestType" AS ENUM ('CITY_DELIVERY_CHECK', 'OTHER');

-- CreateTable
CREATE TABLE "feedback_requests" (
    "id" SERIAL NOT NULL,
    "feedback_request_type" "FeedbackRequestType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_requests_pkey" PRIMARY KEY ("id")
);
