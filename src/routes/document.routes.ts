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
} from "../controllers/document.controller.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/index.js";
import {
  uploadDocument,
  handleDocumentUploadError,
} from "../middleware/uploadDocument.js";

const router = Router();

// Student document routes
router.post(
  "/student/upload",
  authenticate,
  uploadDocument.single("file"),
  handleDocumentUploadError,
  uploadStudentDocument
);

router.get("/student", authenticate, getStudentDocuments);

router.delete("/student/:documentId", authenticate, deleteStudentDocument);

// Professor document routes
router.post(
  "/professor/upload",
  authenticate,
  uploadDocument.single("file"),
  handleDocumentUploadError,
  uploadProfessorDocument
);

router.get("/professor", authenticate, getProfessorDocuments);

router.delete("/professor/:documentId", authenticate, deleteProfessorDocument);

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
  isAdmin,
  getPendingDocuments
);

export default router;
