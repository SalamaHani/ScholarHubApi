-- AlterTable
ALTER TABLE "ProfessorProfile" ADD COLUMN     "profileCompleteness" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "profileCompleteness" INTEGER NOT NULL DEFAULT 0;
