-- AlterTable
ALTER TABLE "Scholarship" ADD COLUMN "language" TEXT,
ADD COLUMN "studyMode" TEXT;

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'DRAFT';
