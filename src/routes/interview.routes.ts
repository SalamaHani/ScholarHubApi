import { Router } from 'express';
import {
    scheduleInterview,
    getMyInterviews,
    getInterviewById,
    getInterviewByApplication,
    getInterviews,
    updateInterview,
    cancelInterview,
    completeInterview,
    markNoShow,
} from '../controllers/index.js';
import {
    authenticate,
    isProfessorOrAdmin,
    validate,
    idParamValidator,
} from '../middleware/index.js';
import {
    scheduleInterviewValidator,
    updateInterviewValidator,
} from '../middleware/validators.js';

const router = Router();

// ==================== STUDENT ROUTES ====================

/**
 * @route   GET /api/interviews/my
 * @desc    Get current student's interviews
 * @access  Private/Student
 */
router.get('/my', authenticate, getMyInterviews);

/**
 * @route   GET /api/interviews/application/:applicationId
 * @desc    Get interview for a specific application
 * @access  Private
 */
router.get('/application/:applicationId', authenticate, getInterviewByApplication);

// ==================== PROFESSOR / ADMIN ROUTES ====================

/**
 * @route   POST /api/interviews
 * @desc    Schedule an interview for an application
 * @access  Private/Professor|Admin
 */
router.post(
    '/',
    authenticate,
    isProfessorOrAdmin,
    scheduleInterviewValidator,
    validate,
    scheduleInterview,
);

/**
 * @route   GET /api/interviews
 * @desc    Get all interviews (Admin: all; Professor: their scholarships)
 * @access  Private/Professor|Admin
 */
router.get('/', authenticate, isProfessorOrAdmin, getInterviews);

/**
 * @route   GET /api/interviews/:id
 * @desc    Get interview by ID
 * @access  Private
 */
router.get('/:id', authenticate, idParamValidator, validate, getInterviewById);

/**
 * @route   PUT /api/interviews/:id
 * @desc    Update interview details
 * @access  Private/Professor|Admin
 */
router.put(
    '/:id',
    authenticate,
    isProfessorOrAdmin,
    idParamValidator,
    updateInterviewValidator,
    validate,
    updateInterview,
);

/**
 * @route   PUT /api/interviews/:id/cancel
 * @desc    Cancel an interview
 * @access  Private/Professor|Admin
 */
router.put(
    '/:id/cancel',
    authenticate,
    isProfessorOrAdmin,
    idParamValidator,
    validate,
    cancelInterview,
);

/**
 * @route   PUT /api/interviews/:id/complete
 * @desc    Mark interview as completed
 * @access  Private/Professor|Admin
 */
router.put(
    '/:id/complete',
    authenticate,
    isProfessorOrAdmin,
    idParamValidator,
    validate,
    completeInterview,
);

/**
 * @route   PUT /api/interviews/:id/no-show
 * @desc    Mark student as no-show
 * @access  Private/Professor|Admin
 */
router.put(
    '/:id/no-show',
    authenticate,
    isProfessorOrAdmin,
    idParamValidator,
    validate,
    markNoShow,
);

export default router;
