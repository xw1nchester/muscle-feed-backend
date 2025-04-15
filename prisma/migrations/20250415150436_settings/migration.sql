-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "cycleStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
