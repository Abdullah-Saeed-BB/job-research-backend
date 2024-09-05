/*
  Warnings:

  - A unique constraint covering the columns `[jobSeekerId,jobId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Application_jobSeekerId_jobId_key" ON "Application"("jobSeekerId", "jobId");
