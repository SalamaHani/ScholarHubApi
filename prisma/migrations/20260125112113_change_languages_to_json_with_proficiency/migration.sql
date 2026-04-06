/*
  Warnings:

  - The `languages` column on the `ProfessorProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `languages` column on the `StudentProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProfessorProfile" DROP COLUMN "languages",
ADD COLUMN     "languages" JSONB;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "languages",
ADD COLUMN     "languages" JSONB;
