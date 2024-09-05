/*
  Warnings:

  - Added the required column `notes` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('candidateScreening', 'interview', 'successed');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('hirer', 'jobSeeker');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "notes" TEXT NOT NULL,
ADD COLUMN     "status" "ApplicationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL;
