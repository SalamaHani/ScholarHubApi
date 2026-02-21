import { Router } from "express";
import {
  getAllFaqItems,
  getFaqItemById,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
} from "../controllers/faqItem.controller.js";
import {
  authenticate,
  isAdmin,
  validate,
  idParamValidator,
  createFaqItemValidator,
  updateFaqItemValidator,
} from "../middleware/index.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/faq-items
 * @desc    Get all active FAQ items (optional ?pageKey= filter)
 */
router.get("/", getAllFaqItems);

/**
 * @route   GET /api/faq-items/:id
 * @desc    Get a single FAQ item by ID
 */
router.get("/:id", idParamValidator, validate, getFaqItemById);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/faq-items
 * @desc    Create a new FAQ item (Admin only)
 */
router.post("/", authenticate, isAdmin, createFaqItemValidator, validate, createFaqItem);

/**
 * @route   PUT /api/faq-items/:id
 * @desc    Update a FAQ item (Admin only)
 */
router.put("/:id", authenticate, isAdmin, idParamValidator, updateFaqItemValidator, validate, updateFaqItem);

/**
 * @route   DELETE /api/faq-items/:id
 * @desc    Delete a FAQ item (Admin only)
 */
router.delete("/:id", authenticate, isAdmin, idParamValidator, validate, deleteFaqItem);

export default router;
