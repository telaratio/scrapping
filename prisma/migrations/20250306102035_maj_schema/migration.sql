-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "date_modification" DROP DEFAULT;

-- AlterTable
ALTER TABLE "equipes" ALTER COLUMN "date_modification" DROP DEFAULT;

-- AlterTable
ALTER TABLE "projets" ALTER COLUMN "date_modification" DROP DEFAULT;

-- AlterTable
ALTER TABLE "utilisateurs" ALTER COLUMN "date_modification" DROP DEFAULT;
