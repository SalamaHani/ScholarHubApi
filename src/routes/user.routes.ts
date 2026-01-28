import { Router } from "express";
import {
  getProfile,
  updateProfile,
  uploadProfileAvatar,
  uploadProfileDocument,
  deleteProfileDocument,
  changePassword,
  getAllUsers,
  getUserById,
  toggleBlockUser,
  verifyProfessor,
  deleteUser,
  changeUserRole,
  updateUser,
  updateStudentProfile,
  updateProfessorProfile,
  getStudentProfileDetails,
  getProfessorProfileDetails,
} from "../controllers/index.js";
import {
  authenticate,
  isAdmin,
  validate,
  idParamValidator,
  uploadAvatar,
  handleUploadError,
  uploadDocument,
} from "../middleware/index.js";
const router = Router();

// ==================== USER PROFILE ROUTES ====================

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 */
router.get("/profile", authenticate, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile data (name, phone, student/professor info)
 */
router.put("/profile", authenticate, updateProfile);

/**
 * @route   PUT /api/users/profile/student
 * @desc    Update student profile information
 */
router.put("/profile/student", authenticate, updateStudentProfile);

/**
 * @route   GET /api/users/profile/student
 * @desc    Get student profile details
 */
router.get("/profile/student", authenticate, getStudentProfileDetails);

/**
 * @route   PUT /api/users/profile/professor
 * @desc    Update professor profile information
 */
router.put("/profile/professor", authenticate, updateProfessorProfile);

/**
 * @route   GET /api/users/profile/professor
 * @desc    Get professor profile details
 */
router.get("/profile/professor", authenticate, getProfessorProfileDetails);

/**
 * @route   PUT /api/users/avatar
 * @desc    Upload user avatar image
 */
router.put(
  "/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  handleUploadError,
  uploadProfileAvatar,
);

/**
 * @route   POST /api/users/profile/documents
 * @desc    Upload profile document
 */
router.post(
  "/profile/documents",
  authenticate,
  uploadDocument.single("document"),
  handleUploadError,
  uploadProfileDocument,
);

/**
 * @route   DELETE /api/users/profile/documents
 * @desc    Delete profile document
 */
router.delete("/profile/documents", authenticate, deleteProfileDocument);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change password
 */
router.put("/change-password", authenticate, changePassword);

// ==================== ADMIN USER MANAGEMENT ROUTES ====================

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 */
router.get("/", authenticate, isAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 */
router.get(
  "/:id",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  getUserById,
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user data and profile (Admin only)
 */
router.put(
  "/:id",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  updateUser,
);

/**
 * @route   PUT /api/users/:id/block
 * @desc    Block/unblock user (Admin only)
 */
router.put(
  "/:id/block",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  toggleBlockUser,
);

/**
 * @route   PUT /api/users/:id/verify-professor
 * @desc    Verify professor (Admin only)
 */
router.put(
  "/:id/verify-professor",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  verifyProfessor,
);

/**
 * @route   PUT /api/users/:id/change-role
 * @desc    Change user role (Admin only)
 */
router.put(
  "/:id/change-role",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  changeUserRole,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  deleteUser,
);

export default router;
