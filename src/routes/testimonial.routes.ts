import { Router } from "express";
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialsByProfessor,
} from "../controllers/testimonial.controller.js";
import {
  authenticate,
  optionalAuth,
  isProfessor,
  authorize,
  idParamValidator,
  validate,
} from "../middleware/index.js";
import { UserRole } from "@prisma/client";

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/testimonials
 * @desc    Get all testimonials (paginated)
 */
router.get("/", optionalAuth, getAllTestimonials);

/**
 * @route   GET /api/testimonials/:id
 * @desc    Get testimonial by ID
 */
router.get("/:id", idParamValidator, validate, getTestimonialById);

/**
 * @route   GET /api/testimonials/professor/:professorId
 * @desc    Get all testimonials by a specific professor
 */
router.get(
  "/professor/:professorId",
  idParamValidator,
  validate,
  getTestimonialsByProfessor
);

// ==================== PROFESSOR ROUTES ====================

/**
 * @route   POST /api/testimonials
 * @desc    Create a new testimonial (Professor only)
 */
router.post(
  "/",
  authenticate,
  authorize(UserRole.PROFESSOR, UserRole.ADMIN),
  createTestimonial
);

/**
 * @route   PUT /api/testimonials/:id
 * @desc    Update testimonial (Professor owner or Admin)
 */
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.PROFESSOR, UserRole.ADMIN),
  idParamValidator,
  validate,
  updateTestimonial
);

/**
 * @route   DELETE /api/testimonials/:id
 * @desc    Delete testimonial (Professor owner or Admin)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.PROFESSOR, UserRole.ADMIN),
  idParamValidator,
  validate,
  deleteTestimonial
);

export default router;
