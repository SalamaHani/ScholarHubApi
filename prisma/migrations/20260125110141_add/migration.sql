-- AlterTable
ALTER TABLE "ProfessorProfile" ADD COLUMN     "averageLanguageProficiency" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "averageSkillLevel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "averageLanguageProficiency" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "averageSkillLevel" INTEGER NOT NULL DEFAULT 0;
