import { Router } from 'express';
import {
    createApplication,
    getMyApplications,
    getApplicationById,
    withdrawApplication,
    getProfessorApplications,
    evaluateApplication,
    getAllApplications,
    getApplicationStats,
    updateApplication,
} from '../controllers/index.js';
import {
    authenticate,
    isStudent,
    isProfessor,
    isAdmin,
    validate,
    createApplicationValidator,
    evaluateApplicationValidator,
    idParamValidator,
    paginationValidator,
} from '../middleware/index.js';

const router = Router();

// ==================== STUDENT ROUTES ====================

/**
 * @route   POST /api/applications
 * @desc    Submit a new application
 */
router.post('/', authenticate, isStudent, createApplicationValidator, validate, createApplication);

/**
 * @route   GET /api/applications
 * @desc    Get current user's applications
 */
router.get('/', authenticate, isStudent, paginationValidator, validate, getMyApplications);

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 */
router.get('/:id', authenticate, idParamValidator, validate, getApplicationById);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update an application (draft or pending)
 */
router.put('/:id', authenticate, isStudent, createApplicationValidator, validate, updateApplication);

/**
 * @route   PUT /api/applications/:id/withdraw
 * @desc    Withdraw an application
 */
router.put('/:id/withdraw', authenticate, isStudent, idParamValidator, validate, withdrawApplication);

// ==================== PROFESSOR ROUTES ====================

/**
 * @route   GET /api/applications/professor/received
 * @desc    Get applications to professor's scholarships
 */
router.get('/professor/received', authenticate, isProfessor, paginationValidator, validate, getProfessorApplications);

/**
 * @route   PUT /api/applications/:id/evaluate
 * @desc    Evaluate an application
 */
router.put('/:id/evaluate', authenticate, isProfessor, evaluateApplicationValidator, validate, evaluateApplication);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/applications/admin/all
 * @desc    Get all applications (Admin only)
 */
router.get('/admin/all', authenticate, isAdmin, paginationValidator, validate, getAllApplications);

/**
 * @route   GET /api/applications/admin/stats
 * @desc    Get application statistics
 */
router.get('/admin/stats', authenticate, isAdmin, getApplicationStats);

export default router;
