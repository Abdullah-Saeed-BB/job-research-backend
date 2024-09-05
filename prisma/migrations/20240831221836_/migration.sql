/*
  Warnings:

  - A unique constraint covering the columns `[jobSeekerId,jobId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobSeekerId_jobId_key" ON "Application"("jobSeekerId", "jobId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
