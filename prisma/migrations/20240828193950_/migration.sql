-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_hirerId_fkey";

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_hirerId_fkey" FOREIGN KEY ("hirerId") REFERENCES "Hirer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
