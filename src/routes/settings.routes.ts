import { Router } from 'express';
import {
    getSettings,
    updateSettings,
    getSiteSettings,
    updateSiteSettings,
    getScholarshipSettings,
    updateScholarshipSettings,
    getApplicationSettings,
    updateApplicationSettings,
    getNotificationSettings,
    updateNotificationSettings,
} from '../controllers/index.js';
import {
    authenticate,
    isAdmin,
    validate,
    updateSiteSettingsValidator,
    updateScholarshipSettingsValidator,
    updateApplicationSettingsValidator,
    updateNotificationSettingsValidator,
} from '../middleware/index.js';

const router = Router();

// All settings routes require authentication and admin role

/**
 * @route   GET /api/settings
 * @desc    Get all settings
 * @access  Private/Admin
 */
router.get('/', authenticate, isAdmin, getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update any settings fields
 * @access  Private/Admin
 */
router.put('/', authenticate, isAdmin, updateSettings);

// ==================== SITE SETTINGS ====================

/**
 * @route   GET /api/settings/site
 * @desc    Get site settings
 * @access  Private/Admin
 */
router.get('/site', authenticate, isAdmin, getSiteSettings);

/**
 * @route   PUT /api/settings/site
 * @desc    Update site settings
 * @access  Private/Admin
 */
router.put('/site', authenticate, isAdmin, updateSiteSettingsValidator, validate, updateSiteSettings);

// ==================== SCHOLARSHIP SETTINGS ====================

/**
 * @route   GET /api/settings/scholarship
 * @desc    Get scholarship settings
 * @access  Private/Admin
 */
router.get('/scholarship', authenticate, isAdmin, getScholarshipSettings);

/**
 * @route   PUT /api/settings/scholarship
 * @desc    Update scholarship settings
 * @access  Private/Admin
 */
router.put('/scholarship', authenticate, isAdmin, updateScholarshipSettingsValidator, validate, updateScholarshipSettings);

// ==================== APPLICATION SETTINGS ====================

/**
 * @route   GET /api/settings/application
 * @desc    Get application settings
 * @access  Private/Admin
 */
router.get('/application', authenticate, isAdmin, getApplicationSettings);

/**
 * @route   PUT /api/settings/application
 * @desc    Update application settings
 * @access  Private/Admin
 */
router.put('/application', authenticate, isAdmin, updateApplicationSettingsValidator, validate, updateApplicationSettings);

// ==================== NOTIFICATION SETTINGS ====================

/**
 * @route   GET /api/settings/notification
 * @desc    Get notification settings
 * @access  Private/Admin
 */
router.get('/notification', authenticate, isAdmin, getNotificationSettings);

/**
 * @route   PUT /api/settings/notification
 * @desc    Update notification settings
 * @access  Private/Admin
 */
router.put('/notification', authenticate, isAdmin, updateNotificationSettingsValidator, validate, updateNotificationSettings);

export default router;
