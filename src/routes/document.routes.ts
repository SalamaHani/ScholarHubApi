import { Router } from "express";
import {
  uploadStudentDocument,
  uploadProfessorDocument,
  getStudentDocuments,
  getProfessorDocuments,
  deleteStudentDocument,
  deleteProfessorDocument,
  verifyStudentDocument,
  verifyProfessorDocument,
  getPendingDocuments,
  getUploadedFile,
  downloadDocument,
  getMyDocuments,
  uploadMyDocument,
  deleteMyDocument,
} from "../controllers/document.controller.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/index.js";
import {
  uploadDocument,
  handleDocumentUploadError,
} from "../middleware/uploadDocument.js";

const router = Router();

// ── Unified routes (no role in path) ─────────────────────────────────────────
router.get("/", authenticate, getMyDocuments);
router.post(
  "/upload",
  authenticate,
  uploadDocument.single("file"),
  handleDocumentUploadError,
  uploadMyDocument
);
// Usage: DELETE /api/documents?documentUrl=<s3-url>  OR body: { documentUrl }
router.delete("/", authenticate, deleteMyDocument);

// Get uploaded file (public or authenticated based on your needs)
router.get("/file/:filename", getUploadedFile);

// Download a document with original filename (presigned S3 URL)
// Usage: GET /documents/download?url=<encoded-s3-url>
router.get("/download", authenticate, downloadDocument);

// Student document routes
router.post(
  "/student/upload",
  authenticate,
  uploadDocument.single("file"),
  handleDocumentUploadError,
  uploadStudentDocument
);

router.get("/student", authenticate, getStudentDocuments);

// Usage: DELETE /documents/student?documentUrl=<s3-url>  OR body: { documentUrl }
router.delete("/student", authenticate, deleteStudentDocument);

// Professor document routes
router.post(
  "/professor/upload",
  authenticate,
  uploadDocument.single("file"),
  handleDocumentUploadError,
  uploadProfessorDocument
);

router.get("/professor", authenticate, getProfessorDocuments);

// Usage: DELETE /documents/professor?documentUrl=<s3-url>  OR body: { documentUrl }
router.delete("/professor", authenticate, deleteProfessorDocument);

// Admin document verification routes
router.put(
  "/admin/student/:documentId/verify",
  authenticate,
  isAdmin,
  verifyStudentDocument
);

router.put(
  "/admin/professor/:documentId/verify",
  authenticate,
  isAdmin,
  verifyProfessorDocument
);

router.get(
  "/admin/pending",
  authenticate,
  getPendingDocuments
);

export default router;
