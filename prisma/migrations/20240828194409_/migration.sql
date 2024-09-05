-- DropForeignKey
ALTER TABLE "Hirer" DROP CONSTRAINT "Hirer_userId_fkey";

-- DropForeignKey
ALTER TABLE "JobSeeker" DROP CONSTRAINT "JobSeeker_userId_fkey";

-- AddForeignKey
ALTER TABLE "Hirer" ADD CONSTRAINT "Hirer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSeeker" ADD CONSTRAINT "JobSeeker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
