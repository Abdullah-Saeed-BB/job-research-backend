-- CreateTable
CREATE TABLE "_HirerToJobSeeker" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_HirerToJobSeeker_AB_unique" ON "_HirerToJobSeeker"("A", "B");

-- CreateIndex
CREATE INDEX "_HirerToJobSeeker_B_index" ON "_HirerToJobSeeker"("B");

-- AddForeignKey
ALTER TABLE "_HirerToJobSeeker" ADD CONSTRAINT "_HirerToJobSeeker_A_fkey" FOREIGN KEY ("A") REFERENCES "Hirer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HirerToJobSeeker" ADD CONSTRAINT "_HirerToJobSeeker_B_fkey" FOREIGN KEY ("B") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
