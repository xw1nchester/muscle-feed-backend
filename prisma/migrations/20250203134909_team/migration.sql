-- CreateTable
CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "picture" TEXT NOT NULL,
    "roleRu" TEXT NOT NULL,
    "roleHe" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameHe" TEXT NOT NULL,
    "descriptionRu" TEXT NOT NULL,
    "descriptionHe" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);
