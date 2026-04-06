-- AlterTable
ALTER TABLE "ProfessorProfile" ADD COLUMN     "addressFull" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "skills" TEXT[];

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "addressFull" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "skills" TEXT[];
