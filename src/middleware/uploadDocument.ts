import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure storage for documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/documents"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    cb(null, `doc-${uniqueSuffix}-${sanitizedName}`);
  },
});

// File filter - allow documents
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
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
  req: any,
  res: any,
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
