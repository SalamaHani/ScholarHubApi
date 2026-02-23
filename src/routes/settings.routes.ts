import { Router } from 'express';
import {
    getSettings,
    updateSettings,
    getPlatformSettings,
    updatePlatformSettings,
    getSiteSettings,
    updateSiteSettings,
    getBrandingSettings,
    updateBrandingSettings,
    getLinksSettings,
    updateLinksSettings,
    getSocialSettings,
    updateSocialSettings,
    getSeoSettings,
    updateSeoSettings,
    getFooterSettings,
    updateFooterSettings,
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
    updateSettingsValidator,
    updatePlatformSettingsValidator,
    updateSiteSettingsValidator,
    updateBrandingSettingsValidator,
    updateLinksSettingsValidator,
    updateSocialSettingsValidator,
    updateSeoSettingsValidator,
    updateFooterSettingsValidator,
    updateScholarshipSettingsValidator,
    updateApplicationSettingsValidator,
    updateNotificationSettingsValidator,
} from '../middleware/index.js';

const router = Router();

// All settings routes require authentication and admin role

/**
 * @route   GET /api/settings
 * @desc    Get all settings (grouped by section)
 * @access  Private/Admin
 */
router.get('/', authenticate, isAdmin, getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update any settings fields
 * @access  Private/Admin
 */
router.put('/', authenticate, isAdmin, updateSettingsValidator, validate, updateSettings);

// ==================== PLATFORM SETTINGS ====================

/**
 * @route   GET /api/settings/platform
 * @desc    Get platform-level settings
 * @access  Private/Admin
 */
router.get('/platform', authenticate, isAdmin, getPlatformSettings);

/**
 * @route   PUT /api/settings/platform
 * @desc    Update platform-level settings
 * @access  Private/Admin
 */
router.put('/platform', authenticate, isAdmin, updatePlatformSettingsValidator, validate, updatePlatformSettings);

// ==================== BRANDING SETTINGS ====================

/**
 * @route   GET /api/settings/branding
 * @desc    Get branding / color settings
 * @access  Private/Admin
 */
router.get('/branding', authenticate, isAdmin, getBrandingSettings);

/**
 * @route   PUT /api/settings/branding
 * @desc    Update branding / color settings
 * @access  Private/Admin
 */
router.put('/branding', authenticate, isAdmin, updateBrandingSettingsValidator, validate, updateBrandingSettings);

// ==================== DEFAULT / EXTERNAL LINKS ====================

/**
 * @route   GET /api/settings/links
 * @desc    Get default and external links
 * @access  Private/Admin
 */
router.get('/links', authenticate, isAdmin, getLinksSettings);

/**
 * @route   PUT /api/settings/links
 * @desc    Update default and external links
 * @access  Private/Admin
 */
router.put('/links', authenticate, isAdmin, updateLinksSettingsValidator, validate, updateLinksSettings);

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

// ==================== SOCIAL MEDIA SETTINGS ====================

/**
 * @route   GET /api/settings/social
 * @desc    Get social media links
 * @access  Private/Admin
 */
router.get('/social', authenticate, isAdmin, getSocialSettings);

/**
 * @route   PUT /api/settings/social
 * @desc    Update social media links
 * @access  Private/Admin
 */
router.put('/social', authenticate, isAdmin, updateSocialSettingsValidator, validate, updateSocialSettings);

// ==================== SEO SETTINGS ====================

/**
 * @route   GET /api/settings/seo
 * @desc    Get SEO settings
 * @access  Private/Admin
 */
router.get('/seo', authenticate, isAdmin, getSeoSettings);

/**
 * @route   PUT /api/settings/seo
 * @desc    Update SEO settings
 * @access  Private/Admin
 */
router.put('/seo', authenticate, isAdmin, updateSeoSettingsValidator, validate, updateSeoSettings);

// ==================== FOOTER SETTINGS ====================

/**
 * @route   GET /api/settings/footer
 * @desc    Get footer settings
 * @access  Private/Admin
 */
router.get('/footer', authenticate, isAdmin, getFooterSettings);

/**
 * @route   PUT /api/settings/footer
 * @desc    Update footer settings
 * @access  Private/Admin
 */
router.put('/footer', authenticate, isAdmin, updateFooterSettingsValidator, validate, updateFooterSettings);

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
