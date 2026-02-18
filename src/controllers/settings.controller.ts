import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../utils/index.js';

// Default settings used when no row exists yet
const DEFAULT_SETTINGS = {
    // Site
    siteName: 'ScholarHub',
    siteDescription: 'Your scholarship discovery platform',
    siteLogoUrl: null,
    contactEmail: 'admin@scholarhub.com',
    maintenanceMode: false,
    // Scholarship
    autoApproveScholarships: false,
    maxScholarshipsPerProf: 10,
    featuredScholarshipLimit: 6,
    // Application
    maxApplicationsPerStudent: 5,
    allowWithdrawal: true,
    deadlineBufferDays: 3,
    // Notification
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    deadlineReminderDays: 7,
};

/** Helper: get or auto-create the singleton settings row */
const getOrCreateSettings = () =>
    prisma.settings.upsert({
        where: { id: 1 },
        create: DEFAULT_SETTINGS,
        update: {},
    });

// ==================== GET ALL SETTINGS ====================

/**
 * @route   GET /api/settings
 * @desc    Get all settings
 * @access  Private/Admin
 */
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: { settings } });
});

// ==================== UPDATE ALL / ANY FIELDS ====================

/**
 * @route   PUT /api/settings
 * @desc    Update any settings fields
 * @access  Private/Admin
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const {
        siteName, siteDescription, siteLogoUrl, contactEmail, maintenanceMode,
        autoApproveScholarships, maxScholarshipsPerProf, featuredScholarshipLimit,
        maxApplicationsPerStudent, allowWithdrawal, deadlineBufferDays,
        emailNotificationsEnabled, pushNotificationsEnabled, deadlineReminderDays,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (siteName !== undefined) data.siteName = siteName;
    if (siteDescription !== undefined) data.siteDescription = siteDescription;
    if (siteLogoUrl !== undefined) data.siteLogoUrl = siteLogoUrl;
    if (contactEmail !== undefined) data.contactEmail = contactEmail;
    if (maintenanceMode !== undefined) data.maintenanceMode = maintenanceMode;
    if (autoApproveScholarships !== undefined) data.autoApproveScholarships = autoApproveScholarships;
    if (maxScholarshipsPerProf !== undefined) data.maxScholarshipsPerProf = maxScholarshipsPerProf;
    if (featuredScholarshipLimit !== undefined) data.featuredScholarshipLimit = featuredScholarshipLimit;
    if (maxApplicationsPerStudent !== undefined) data.maxApplicationsPerStudent = maxApplicationsPerStudent;
    if (allowWithdrawal !== undefined) data.allowWithdrawal = allowWithdrawal;
    if (deadlineBufferDays !== undefined) data.deadlineBufferDays = deadlineBufferDays;
    if (emailNotificationsEnabled !== undefined) data.emailNotificationsEnabled = emailNotificationsEnabled;
    if (pushNotificationsEnabled !== undefined) data.pushNotificationsEnabled = pushNotificationsEnabled;
    if (deadlineReminderDays !== undefined) data.deadlineReminderDays = deadlineReminderDays;

    const settings = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });

    res.json({ success: true, message: 'Settings updated successfully', data: { settings } });
});

// ==================== SITE SETTINGS ====================

/**
 * @route   GET /api/settings/site
 * @desc    Get site settings
 * @access  Private/Admin
 */
export const getSiteSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    const settings = {
        siteName: raw.siteName,
        siteDescription: raw.siteDescription,
        siteLogoUrl: raw.siteLogoUrl,
        contactEmail: raw.contactEmail,
        maintenanceMode: raw.maintenanceMode,
    };
    res.json({ success: true, data: { settings } });
});

/**
 * @route   PUT /api/settings/site
 * @desc    Update site settings
 * @access  Private/Admin
 */
export const updateSiteSettings = asyncHandler(async (req: Request, res: Response) => {
    const { siteName, siteDescription, siteLogoUrl, contactEmail, maintenanceMode } = req.body;

    const data: Record<string, unknown> = {};
    if (siteName !== undefined) data.siteName = siteName;
    if (siteDescription !== undefined) data.siteDescription = siteDescription;
    if (siteLogoUrl !== undefined) data.siteLogoUrl = siteLogoUrl;
    if (contactEmail !== undefined) data.contactEmail = contactEmail;
    if (maintenanceMode !== undefined) data.maintenanceMode = maintenanceMode;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });

    const settings = {
        siteName: raw.siteName,
        siteDescription: raw.siteDescription,
        siteLogoUrl: raw.siteLogoUrl,
        contactEmail: raw.contactEmail,
        maintenanceMode: raw.maintenanceMode,
    };

    res.json({ success: true, message: 'Site settings updated successfully', data: { settings } });
});

// ==================== SCHOLARSHIP SETTINGS ====================

/**
 * @route   GET /api/settings/scholarship
 * @desc    Get scholarship settings
 * @access  Private/Admin
 */
export const getScholarshipSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    const settings = {
        autoApproveScholarships: raw.autoApproveScholarships,
        maxScholarshipsPerProf: raw.maxScholarshipsPerProf,
        featuredScholarshipLimit: raw.featuredScholarshipLimit,
    };
    res.json({ success: true, data: { settings } });
});

/**
 * @route   PUT /api/settings/scholarship
 * @desc    Update scholarship settings
 * @access  Private/Admin
 */
export const updateScholarshipSettings = asyncHandler(async (req: Request, res: Response) => {
    const { autoApproveScholarships, maxScholarshipsPerProf, featuredScholarshipLimit } = req.body;

    const data: Record<string, unknown> = {};
    if (autoApproveScholarships !== undefined) data.autoApproveScholarships = autoApproveScholarships;
    if (maxScholarshipsPerProf !== undefined) data.maxScholarshipsPerProf = maxScholarshipsPerProf;
    if (featuredScholarshipLimit !== undefined) data.featuredScholarshipLimit = featuredScholarshipLimit;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });

    const settings = {
        autoApproveScholarships: raw.autoApproveScholarships,
        maxScholarshipsPerProf: raw.maxScholarshipsPerProf,
        featuredScholarshipLimit: raw.featuredScholarshipLimit,
    };

    res.json({ success: true, message: 'Scholarship settings updated successfully', data: { settings } });
});

// ==================== APPLICATION SETTINGS ====================

/**
 * @route   GET /api/settings/application
 * @desc    Get application settings
 * @access  Private/Admin
 */
export const getApplicationSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    const settings = {
        maxApplicationsPerStudent: raw.maxApplicationsPerStudent,
        allowWithdrawal: raw.allowWithdrawal,
        deadlineBufferDays: raw.deadlineBufferDays,
    };
    res.json({ success: true, data: { settings } });
});

/**
 * @route   PUT /api/settings/application
 * @desc    Update application settings
 * @access  Private/Admin
 */
export const updateApplicationSettings = asyncHandler(async (req: Request, res: Response) => {
    const { maxApplicationsPerStudent, allowWithdrawal, deadlineBufferDays } = req.body;

    const data: Record<string, unknown> = {};
    if (maxApplicationsPerStudent !== undefined) data.maxApplicationsPerStudent = maxApplicationsPerStudent;
    if (allowWithdrawal !== undefined) data.allowWithdrawal = allowWithdrawal;
    if (deadlineBufferDays !== undefined) data.deadlineBufferDays = deadlineBufferDays;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });

    const settings = {
        maxApplicationsPerStudent: raw.maxApplicationsPerStudent,
        allowWithdrawal: raw.allowWithdrawal,
        deadlineBufferDays: raw.deadlineBufferDays,
    };

    res.json({ success: true, message: 'Application settings updated successfully', data: { settings } });
});

// ==================== NOTIFICATION SETTINGS ====================

/**
 * @route   GET /api/settings/notification
 * @desc    Get notification settings
 * @access  Private/Admin
 */
export const getNotificationSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    const settings = {
        emailNotificationsEnabled: raw.emailNotificationsEnabled,
        pushNotificationsEnabled: raw.pushNotificationsEnabled,
        deadlineReminderDays: raw.deadlineReminderDays,
    };
    res.json({ success: true, data: { settings } });
});

/**
 * @route   PUT /api/settings/notification
 * @desc    Update notification settings
 * @access  Private/Admin
 */
export const updateNotificationSettings = asyncHandler(async (req: Request, res: Response) => {
    const { emailNotificationsEnabled, pushNotificationsEnabled, deadlineReminderDays } = req.body;

    const data: Record<string, unknown> = {};
    if (emailNotificationsEnabled !== undefined) data.emailNotificationsEnabled = emailNotificationsEnabled;
    if (pushNotificationsEnabled !== undefined) data.pushNotificationsEnabled = pushNotificationsEnabled;
    if (deadlineReminderDays !== undefined) data.deadlineReminderDays = deadlineReminderDays;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });

    const settings = {
        emailNotificationsEnabled: raw.emailNotificationsEnabled,
        pushNotificationsEnabled: raw.pushNotificationsEnabled,
        deadlineReminderDays: raw.deadlineReminderDays,
    };

    res.json({ success: true, message: 'Notification settings updated successfully', data: { settings } });
});
