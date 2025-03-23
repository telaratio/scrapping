-- CreateEnum
CREATE TYPE "TypeScraping" AS ENUM ('GOOGLE_SERP', 'WEBSITE');

-- CreateEnum
CREATE TYPE "StatutScraping" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateTable
CREATE TABLE "cles_api" (
    "id" SERIAL NOT NULL,
    "cle" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cles_api_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_scraping" (
    "id" SERIAL NOT NULL,
    "cle_api_id" INTEGER NOT NULL,
    "type_scraping" "TypeScraping" NOT NULL,
    "requete" TEXT NOT NULL,
    "statut" "StatutScraping" NOT NULL,
    "donnees" JSONB,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "logs_scraping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cles_api_cle_key" ON "cles_api"("cle");

-- CreateIndex
CREATE INDEX "cles_api_utilisateur_id_idx" ON "cles_api"("utilisateur_id");

-- CreateIndex
CREATE INDEX "cles_api_cle_idx" ON "cles_api"("cle");

-- CreateIndex
CREATE INDEX "logs_scraping_cle_api_id_idx" ON "logs_scraping"("cle_api_id");

-- CreateIndex
CREATE INDEX "logs_scraping_utilisateur_id_idx" ON "logs_scraping"("utilisateur_id");

-- CreateIndex
CREATE INDEX "logs_scraping_date_creation_idx" ON "logs_scraping"("date_creation");

-- AddForeignKey
ALTER TABLE "cles_api" ADD CONSTRAINT "cles_api_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_scraping" ADD CONSTRAINT "logs_scraping_cle_api_id_fkey" FOREIGN KEY ("cle_api_id") REFERENCES "cles_api"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_scraping" ADD CONSTRAINT "logs_scraping_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
