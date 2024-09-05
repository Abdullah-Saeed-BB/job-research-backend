-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "notes" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'candidateScreening';
