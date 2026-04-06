/*
  Warnings:

  - You are about to drop the `ProfessorDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProfessorDocument" DROP CONSTRAINT "ProfessorDocument_professorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "StudentDocument" DROP CONSTRAINT "StudentDocument_studentProfileId_fkey";

-- DropTable
DROP TABLE "ProfessorDocument";

-- DropTable
DROP TABLE "StudentDocument";
