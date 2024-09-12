-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('fullTime', 'partTime', 'volunteer', 'internship');

-- AlterTable
ALTER TABLE "Hirer" ADD COLUMN     "companySize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'fullTime',
ADD COLUMN     "salaryRange" INTEGER[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactEmail" TEXT;

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobToJobSeeker" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JobToJobSeeker_AB_unique" ON "_JobToJobSeeker"("A", "B");

-- CreateIndex
CREATE INDEX "_JobToJobSeeker_B_index" ON "_JobToJobSeeker"("B");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToJobSeeker" ADD CONSTRAINT "_JobToJobSeeker_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToJobSeeker" ADD CONSTRAINT "_JobToJobSeeker_B_fkey" FOREIGN KEY ("B") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
