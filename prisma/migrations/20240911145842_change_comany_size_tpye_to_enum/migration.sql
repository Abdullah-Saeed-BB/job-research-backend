/*
  Warnings:

  - The `companySize` column on the `Hirer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ComapnySize" AS ENUM ('lessThan10', 'between10to20', 'between20to30', 'between30to50', 'between50to100', 'heigherThan100');

-- AlterTable
ALTER TABLE "Hirer" DROP COLUMN "companySize",
ADD COLUMN     "companySize" "ComapnySize" NOT NULL DEFAULT 'lessThan10';
