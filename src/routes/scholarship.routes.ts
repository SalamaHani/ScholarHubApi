import { Router } from "express";
import {
  createScholarship,
  getScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
  getProfessorScholarships,
  getPendingScholarships,
  approveScholarship,
  rejectScholarship,
  toggleFeatured,
} from "../controllers/index.js";
import {
  authenticate,
  optionalAuth,
  isProfessor,
  isProfessorOrAdmin,
  isAdmin,
  validate,
  createScholarshipValidator,
  updateScholarshipValidator,
  scholarshipQueryValidator,
  idParamValidator,
} from "../middleware/index.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/scholarships
 * @desc    Get all scholarships with filters
 */
router.get("/", scholarshipQueryValidator, validate, getScholarships);

/**
 * @route   GET /api/scholarships/:id
 * @desc    Get scholarship by ID
 */
router.get(
  "/:id",
  optionalAuth,
  idParamValidator,
  validate,
  getScholarshipById
);

// ==================== PROFESSOR ROUTES ====================

/**
 * @route   POST /api/scholarships
 * @desc    Create new scholarship (Professor only)
 */
router.post(
  "/",
  authenticate,
  isProfessorOrAdmin,
  createScholarshipValidator,
  validate,
  createScholarship
);


/**
 * @route   PUT /api/scholarships/:id
 * @desc    Update scholarship (Owner or Admin)
 */
router.put(
  "/:id",
  authenticate,
  isProfessorOrAdmin,
  updateScholarshipValidator,
  validate,
  updateScholarship
);

/**
 * @route   DELETE /api/scholarships/:id
 * @desc    Delete scholarship (Owner or Admin)
 */
router.delete(
  "/:id",
  authenticate,
  isProfessorOrAdmin,
  idParamValidator,
  validate,
  deleteScholarship
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/scholarships/admin/pending
 * @desc    Get pending scholarships for approval
 */
router.get("/admin/pending", authenticate, isAdmin, getPendingScholarships);

/**
 * @route   PUT /api/scholarships/:id/approve
 * @desc    Approve a scholarship
 */
router.put(
  "/:id/approve",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  approveScholarship
);

/**
 * @route   PUT /api/scholarships/:id/reject
 * @desc    Reject a scholarship
 */
router.put(
  "/:id/reject",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  rejectScholarship
);

/**
 * @route   PUT /api/scholarships/:id/feature
 * @desc    Toggle featured status
 */
router.put(
  "/:id/feature",
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  toggleFeatured
);

export default router;
