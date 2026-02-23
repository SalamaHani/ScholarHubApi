import { Router } from "express";
import {
  getAllPageContent,
  getPageContentByKey,
  createPageContent,
  updatePageContent,
  deletePageContent,
} from "../controllers/pageContent.controller.js";
import {
  authenticate,
  isAdmin,
  validate,
  createPageContentValidator,
  updatePageContentValidator,
} from "../middleware/index.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/page-content
 * @desc    Get all active page content (optional ?section= filter)
 */
router.get("/", getAllPageContent);

/**
 * @route   GET /api/page-content/:pageKey
 * @desc    Get page content by unique page key
 */
router.get("/:pageKey", getPageContentByKey);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/page-content
 * @desc    Create a new page content entry (Admin only)
 */
router.post(
  "/",
  authenticate,

  
  isAdmin,
  createPageContentValidator,
  validate,
  createPageContent,
);

/**
 * @route   PUT /api/page-content/:pageKey
 * @desc    Update page content entry (Admin only)
 */
router.put(
  "/:pageKey",
  authenticate,
  isAdmin,
  updatePageContentValidator,
  updatePageContent,
);

/**
 * @route   DELETE /api/page-content/:pageKey
 * @desc    Delete page content entry (Admin only)
 */
router.delete("/:pageKey", authenticate, isAdmin, deletePageContent);

export default router;
