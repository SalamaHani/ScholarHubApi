import { Router } from 'express';
import {
    register,
    login,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe,
    googleAuth,
    googleCallback,
} from '../controllers/index.js';
import { authenticate, validate, registerValidator, loginValidator, resetPasswordValidator } from '../middleware/index.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', registerValidator, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
router.post('/login', loginValidator, validate, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 */
router.post('/logout', authenticate, logout);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 */
router.post('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 */
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 */
router.get('/me', authenticate, getMe);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @query   role - Optional, defaults to STUDENT
 */
router.get('/google', googleAuth);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 */
router.get('/google/callback', googleCallback);

export default router;
