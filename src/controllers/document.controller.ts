import { ApiError, asyncHandler } from "../utils/index.js";
import prisma from "../lib/prisma.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads/documents");

// Upload student document
export const uploadStudentDocument = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!req.file) {
    throw ApiError.badRequest("No file uploaded");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Student profile not found");
  }

  const updatedProfile = await prisma.studentProfile.update({
    where: { userId },
    data: {
      documents: [...profile.documents, req.file.filename],
    },
  });

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully",
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      documents: updatedProfile.documents,
    },
  });
});

// Upload professor document
export const uploadProfessorDocument = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!req.file) {
    throw ApiError.badRequest("No file uploaded");
  }

  const profile = await prisma.professorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Professor profile not found");
  }

  const updatedProfile = await prisma.professorProfile.update({
    where: { userId },
    data: {
      documents: [...profile.documents, req.file.filename],
    },
  });

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully",
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      documents: updatedProfile.documents,
    },
  });
});

// Get student documents
export const getStudentDocuments = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Student profile not found");
  }

  res.status(200).json({
    success: true,
    data: {
      documents: profile.documents,
    },
  });
});

// Get professor documents
export const getProfessorDocuments = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const profile = await prisma.professorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Professor profile not found");
  }

  res.status(200).json({
    success: true,
    data: {
      documents: profile.documents,
    },
  });
});

// Get uploaded file (download)
export const getUploadedFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  if (!filename) {
    throw ApiError.badRequest("Filename is required");
  }

  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(uploadsDir, sanitizedFilename);

  try {
    await fs.access(filePath);
  } catch (error) {
    throw ApiError.notFound("File not found");
  }

  const ext = path.extname(sanitizedFilename).toLowerCase();
  let contentType = "application/octet-stream";

  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
  };

  if (mimeTypes[ext]) {
    contentType = mimeTypes[ext];
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${sanitizedFilename}"`);

  res.sendFile(filePath, (err) => {
    if (err) {
      throw ApiError.internal("Error sending file");
    }
  });
});

// Delete student document
export const deleteStudentDocument = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { documentId } = req.params;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Student profile not found");
  }

  if (!profile.documents.includes(documentId)) {
    throw ApiError.notFound("Document not found in profile");
  }

  const filePath = path.join(uploadsDir, documentId);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }

  const updatedProfile = await prisma.studentProfile.update({
    where: { userId },
    data: {
      documents: profile.documents.filter((doc) => doc !== documentId),
    },
  });

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    data: {
      documents: updatedProfile.documents,
    },
  });
});

// Delete professor document
export const deleteProfessorDocument = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { documentId } = req.params;

  const profile = await prisma.professorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Professor profile not found");
  }

  if (!profile.documents.includes(documentId)) {
    throw ApiError.notFound("Document not found in profile");
  }

  const filePath = path.join(uploadsDir, documentId);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }

  const updatedProfile = await prisma.professorProfile.update({
    where: { userId },
    data: {
      documents: profile.documents.filter((doc) => doc !== documentId),
    },
  });

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    data: {
      documents: updatedProfile.documents,
    },
  });
});

// Verify student document (admin only)
export const verifyStudentDocument = asyncHandler(async (req, res) => {
  throw ApiError.badRequest("Document verification not yet implemented");
});

// Verify professor document (admin only)
export const verifyProfessorDocument = asyncHandler(async (req, res) => {
  throw ApiError.badRequest("Document verification not yet implemented");
});

// Get pending documents (admin only)
export const getPendingDocuments = asyncHandler(async (req, res) => {
  throw ApiError.badRequest("Pending documents not yet implemented");
});
