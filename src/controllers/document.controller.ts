import { ApiError, asyncHandler } from "../utils/index.js";
import prisma from "../lib/prisma.js";
import {
  uploadFile,
  deleteFile,
  getSignedDownloadUrl,
} from "../services/storage.service.js";

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

  const fileUrl = await uploadFile(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    "documents",
  );

  const updatedProfile = await prisma.studentProfile.update({
    where: { userId },
    data: {
      documents: [...profile.documents, fileUrl],
    },
  });

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully",
    data: {
      url: fileUrl,
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

  const fileUrl = await uploadFile(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    "documents",
  );
  if (!fileUrl) {
    throw ApiError.internal("Failed to upload document");
  }
  const updatedProfile = await prisma.professorProfile.update({
    where: { userId },
    data: {
      documents: [...profile.documents, fileUrl],
    },
  });

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully",
    data: {
      url: fileUrl,
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

// Get uploaded file — redirect to the CDN URL
export const getUploadedFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  if (!filename) {
    throw ApiError.badRequest("Filename is required");
  }

  res.redirect(decodeURIComponent(filename));
});

// Download a document by its S3 URL with the original filename
export const downloadDocument = asyncHandler(async (req, res) => {
  const fileUrl = decodeURIComponent(req.query.url as string);

  if (!fileUrl) {
    throw ApiError.badRequest("File URL is required");
  }

  const { url, filename } = await getSignedDownloadUrl(fileUrl);

  res.redirect(url);
  // Alternatively, set the header so clients get the filename hint:
  // res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  // res.redirect(url);
  void filename; // used in the presigned URL's ResponseContentDisposition
});

// Delete student document
export const deleteStudentDocument = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const docUrl: string =
    req.body.documentUrl ?? (req.query.documentUrl as string);

  if (!docUrl) {
    throw ApiError.badRequest("documentUrl is required");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Student profile not found");
  }

  if (!profile.documents.includes(docUrl)) {
    throw ApiError.notFound("Document not found in profile");
  }

  await deleteFile(docUrl);

  const updatedProfile = await prisma.studentProfile.update({
    where: { userId },
    data: {
      documents: profile.documents.filter((doc) => doc !== docUrl),
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

  const docUrl: string =
    req.body.documentUrl ?? (req.query.documentUrl as string);

  if (!docUrl) {
    throw ApiError.badRequest("documentUrl is required");
  }

  const profile = await prisma.professorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound("Professor profile not found");
  }

  if (!profile.documents.includes(docUrl)) {
    throw ApiError.notFound("Document not found in profile");
  }

  await deleteFile(docUrl);

  const updatedProfile = await prisma.professorProfile.update({
    where: { userId },
    data: {
      documents: profile.documents.filter((doc) => doc !== docUrl),
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

// ── Unified role-agnostic handlers ───────────────────────────────────────────

// GET /api/documents  — returns the current user's documents (any role)
export const getMyDocuments = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  let documents: string[] = [];

  if (role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    documents = profile?.documents ?? [];
  } else if (role === "PROFESSOR") {
    const profile = await prisma.professorProfile.findUnique({
      where: { userId },
    });
    documents = profile?.documents ?? [];
  } else {
    throw ApiError.forbidden(
      "Only students and professors can manage documents",
    );
  }

  res.status(200).json({ success: true, data: { documents } });
});

// POST /api/documents/upload  — upload for any role
export const uploadMyDocument = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const role = req.user?.role;

  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const fileUrl = await uploadFile(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    "documents",
  );

  let documents: string[] = [];

  if (role === "STUDENT") {
    let profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId, documents: [fileUrl] },
      });
    } else {
      profile = await prisma.studentProfile.update({
        where: { userId },
        data: { documents: [...profile.documents, fileUrl] },
      });
    }
    documents = profile.documents;
  } else if (role === "PROFESSOR") {
    let profile = await prisma.professorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      profile = await prisma.professorProfile.create({
        data: { userId, institution: "", documents: [fileUrl] },
      });
    } else {
      profile = await prisma.professorProfile.update({
        where: { userId },
        data: { documents: [...profile.documents, fileUrl] },
      });
    }
    documents = profile.documents;
  } else {
    throw ApiError.forbidden(
      "Only students and professors can upload documents",
    );
  }

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully",
    data: {
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      documents,
    },
  });
});

// DELETE /api/documents  — delete by documentUrl (body or query) for any role
export const deleteMyDocument = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const docUrl: string =
    req.body.documentUrl ?? (req.query.documentUrl as string);

  if (!docUrl) throw ApiError.badRequest("documentUrl is required");

  let documents: string[] = [];

  if (role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw ApiError.notFound("Student profile not found");
    if (!profile.documents.includes(docUrl))
      throw ApiError.notFound("Document not found");
    await deleteFile(docUrl);
    const updated = await prisma.studentProfile.update({
      where: { userId },
      data: { documents: profile.documents.filter((d) => d !== docUrl) },
    });
    documents = updated.documents;
  } else if (role === "PROFESSOR") {
    const profile = await prisma.professorProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw ApiError.notFound("Professor profile not found");
    if (!profile.documents.includes(docUrl))
      throw ApiError.notFound("Document not found");
    await deleteFile(docUrl);
    const updated = await prisma.professorProfile.update({
      where: { userId },
      data: { documents: profile.documents.filter((d) => d !== docUrl) },
    });
    documents = updated.documents;
  } else {
    throw ApiError.forbidden(
      "Only students and professors can delete documents",
    );
  }

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    data: { documents },
  });
});

// Verify student document (admin only)
export const verifyStudentDocument = asyncHandler(async (_req, _res) => {
  throw ApiError.badRequest("Document verification not yet implemented");
});

// Verify professor document (admin only)
export const verifyProfessorDocument = asyncHandler(async (_req, _res) => {
  throw ApiError.badRequest("Document verification not yet implemented");
});

// Get pending documents (admin only)
export const getPendingDocuments = asyncHandler(async (_req, _res) => {
  throw ApiError.badRequest("Pending documents not yet implemented");
});
