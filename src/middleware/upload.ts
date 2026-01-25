import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/avatars"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExt)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
  }
};

// Configure multer
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Error handler for multer
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(ApiError.badRequest("File size exceeds 5MB limit"));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(ApiError.badRequest("Only one file is allowed"));
    }
  } else if (err) {
    return next(ApiError.badRequest(err.message || "File upload error"));
  }
  next();
};
