import { Router } from "express";
import {
  saveScholarship,
  getSavedScholarships,
  unsaveScholarship,
  checkSaved,
} from "../controllers/index.js";
import {
  authenticate,
  validate,
  paginationValidator,
} from "../middleware/index.js";

const router = Router();

/**
 * @route   POST /api/saved
 * @desc    Save a scholarship
 */
router.post("/", authenticate, saveScholarship);

/**
 * @route   GET /api/saved
 * @desc    Get saved scholarships
 */
router.get(
  "/",
  authenticate,
  paginationValidator,
  validate,
  getSavedScholarships,
);

/**
 * @route   GET /api/saved/check/:scholarshipId
 * @desc    Check if scholarship is saved
 */
router.get("/check/:scholarshipId", authenticate, checkSaved);

/**
 * @route   DELETE /api/saved/:scholarshipId
 * @desc    Remove from saved
 */
router.delete("/:scholarshipId", authenticate, unsaveScholarship);

export default router;
