-- CreateTable
CREATE TABLE "StudentDocument" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessorDocument" (
    "id" TEXT NOT NULL,
    "professorProfileId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentDocument_studentProfileId_idx" ON "StudentDocument"("studentProfileId");

-- CreateIndex
CREATE INDEX "StudentDocument_documentType_idx" ON "StudentDocument"("documentType");

-- CreateIndex
CREATE INDEX "StudentDocument_verificationStatus_idx" ON "StudentDocument"("verificationStatus");

-- CreateIndex
CREATE INDEX "ProfessorDocument_professorProfileId_idx" ON "ProfessorDocument"("professorProfileId");

-- CreateIndex
CREATE INDEX "ProfessorDocument_documentType_idx" ON "ProfessorDocument"("documentType");

-- CreateIndex
CREATE INDEX "ProfessorDocument_verificationStatus_idx" ON "ProfessorDocument"("verificationStatus");

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorDocument" ADD CONSTRAINT "ProfessorDocument_professorProfileId_fkey" FOREIGN KEY ("professorProfileId") REFERENCES "ProfessorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
