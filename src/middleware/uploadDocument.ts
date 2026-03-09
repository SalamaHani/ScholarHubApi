import multer from "multer";
import path from "path";
import { ApiError } from "../utils/index.js";

// Use memory storage — file is uploaded to DO Spaces in the controller
const storage = multer.memoryStorage();

// File filter - allow documents and images
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
  ];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExt)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, Word, Excel, and image files (jpg, png, gif) are allowed"
      )
    );
  }
};

// Configure multer for documents
export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
});

// Error handler for multer
export const handleDocumentUploadError = (
  err: any,
  _req: any,
  _res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(ApiError.badRequest("File size exceeds 10MB limit"));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(ApiError.badRequest("Only one file is allowed"));
    }
  } else if (err) {
    return next(ApiError.badRequest(err.message || "File upload error"));
  }
  next();
};
