/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Experience` table. All the data in the column will be lost.
  - Added the required column `jobSeekerId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobSeekerId` to the `Experience` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_employeeId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "employeeId",
ADD COLUMN     "jobSeekerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "employeeId",
ADD COLUMN     "jobSeekerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobSeeker" ALTER COLUMN "major" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
