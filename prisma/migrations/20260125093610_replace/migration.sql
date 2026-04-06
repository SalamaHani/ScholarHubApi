/*
  Warnings:

  - You are about to drop the column `addressFull` on the `ProfessorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `addressFull` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProfessorProfile" DROP COLUMN "addressFull",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "addressFull",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "zipCode" TEXT;
