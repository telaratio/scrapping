/*
  Warnings:

  - You are about to drop the `acces_projets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `articles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membres_equipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statistiques_articles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "acces_projets" DROP CONSTRAINT "acces_projets_projet_id_fkey";

-- DropForeignKey
ALTER TABLE "acces_projets" DROP CONSTRAINT "acces_projets_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_createur_id_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_projet_id_fkey";

-- DropForeignKey
ALTER TABLE "equipes" DROP CONSTRAINT "equipes_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "membres_equipe" DROP CONSTRAINT "membres_equipe_equipe_id_fkey";

-- DropForeignKey
ALTER TABLE "membres_equipe" DROP CONSTRAINT "membres_equipe_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "projets" DROP CONSTRAINT "projets_equipe_id_fkey";

-- DropForeignKey
ALTER TABLE "projets" DROP CONSTRAINT "projets_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "statistiques_articles" DROP CONSTRAINT "statistiques_articles_article_id_fkey";

-- AlterTable
ALTER TABLE "utilisateurs" ALTER COLUMN "date_modification" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "acces_projets";

-- DropTable
DROP TABLE "articles";

-- DropTable
DROP TABLE "equipes";

-- DropTable
DROP TABLE "membres_equipe";

-- DropTable
DROP TABLE "projets";

-- DropTable
DROP TABLE "statistiques_articles";
