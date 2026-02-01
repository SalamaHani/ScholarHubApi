import { Router } from "express";
import { getProfessorScholarships } from "../controllers/scholarship.controller.js";
import {
    authenticate,
    isProfessorOrAdmin,
    validate,
    professorScholarshipQueryValidator,
} from "../middleware/index.js";

const router = Router();

/**
 * @route   GET /api/professor
 * @desc    Get professor's own scholarships with pagination and filters
 * @access  Private/Professor or Admin
 */
router.get(
    "/",
    authenticate,
    isProfessorOrAdmin,
    professorScholarshipQueryValidator,
    validate,
    getProfessorScholarships
);

export default router;
