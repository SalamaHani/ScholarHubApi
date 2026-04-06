/*
  Warnings:

  - The `experience` column on the `ProfessorProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProfessorProfile" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "gender" TEXT,
DROP COLUMN "experience",
ADD COLUMN     "experience" JSONB;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "experience" JSONB;
