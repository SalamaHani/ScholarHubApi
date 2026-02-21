import { Router } from "express";
import { getProfessorScholarships } from "../controllers/scholarship.controller.js";
import { getAllProfessors } from "../controllers/user.controller.js";
import {
    authenticate,
    isProfessorOrAdmin,
    validate,
    professorScholarshipQueryValidator,
} from "../middleware/index.js";

const router = Router();

/**
 * @route   GET /api/professor/all
 * @desc    Get all verified professors with profiles and scholarship counts
 * @access  Public
 */
router.get("/all", getAllProfessors);

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
