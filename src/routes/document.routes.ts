import { Router } from "express";
import {
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
  uploadProfileDocument,
} from "../controllers/document.controller.js";
import { authenticate, isStudent, isProfessor } from "../middleware/auth.js";
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
  isStudent,
  uploadDocument.single("file"),
  handleDocumentUploadError,
  uploadProfileDocument
);

router.get("/student", authenticate, isStudent, getStudentDocuments);

// Usage: DELETE /documents/student?documentUrl=<s3-url>  OR body: { documentUrl }
router.delete("/student", authenticate, isStudent, deleteStudentDocument);

// Professor document routes
router.post(
  "/professor/upload",
  authenticate,
  isProfessor,
  uploadDocument.single("file"),
  handleDocumentUploadError,
  uploadProfileDocument
);

router.get("/professor", authenticate, isProfessor, getProfessorDocuments);

// Usage: DELETE /documents/professor?documentUrl=<s3-url>  OR body: { documentUrl }
router.delete("/professor", authenticate, isProfessor, deleteProfessorDocument);

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
