/*
  Warnings:

  - You are about to drop the column `date_generation` on the `articles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token_verification]` on the table `utilisateurs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_reset_mdp]` on the table `utilisateurs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date_modification` to the `articles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_modification` to the `equipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_modification` to the `projets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_modification` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "acces_projets" ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "date_generation",
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "equipes" ADD COLUMN     "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "membres_equipe" ADD COLUMN     "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "projets" ADD COLUMN     "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "date_expiration_reset" TIMESTAMP(3),
ADD COLUMN     "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_verifie" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "token_reset_mdp" TEXT,
ADD COLUMN     "token_verification" TEXT;

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expire_le" TIMESTAMP(3) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_token_verification_key" ON "utilisateurs"("token_verification");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_token_reset_mdp_key" ON "utilisateurs"("token_reset_mdp");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
