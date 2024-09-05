/*
  Warnings:

  - You are about to drop the column `managerId` on the `Job` table. All the data in the column will be lost.
  - Added the required column `hirerId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `major` on table `JobSeeker` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_managerId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "managerId",
ADD COLUMN     "hirerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobSeeker" ALTER COLUMN "major" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_hirerId_fkey" FOREIGN KEY ("hirerId") REFERENCES "Hirer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
