/*
  Warnings:

  - You are about to drop the column `averageLanguageProficiency` on the `ProfessorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `averageSkillLevel` on the `ProfessorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `averageLanguageProficiency` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `averageSkillLevel` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProfessorProfile" DROP COLUMN "averageLanguageProficiency",
DROP COLUMN "averageSkillLevel",
ADD COLUMN     "averageLanguageLevel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "averageLanguageProficiency",
DROP COLUMN "averageSkillLevel",
ADD COLUMN     "averageLanguageLevel" INTEGER NOT NULL DEFAULT 0;
