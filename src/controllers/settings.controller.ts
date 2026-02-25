import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../utils/index.js';

// ─── Default singleton values ────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
    // Platform
    defaultLanguage: 'en',
    timezone: 'UTC',
    registrationEnabled: true,
    requireEmailVerification: true,
    maxFileSizeMB: 10,
    allowedFileTypes: [] as string[],
    // Site
    siteName: 'ScholarHub',
    siteDescription: 'Connecting students with scholarship opportunities worldwide.',
    siteLogoUrl: null as string | null,
    siteFaviconUrl: null as string | null,
    contactEmail: 'admin@scholarhub.com',
    supportEmail: null as string | null,
    supportPhone: null as string | null,
    maintenanceMode: false,
    maintenanceMessage: 'We are currently under maintenance. Please check back soon.',
    address: null as string | null,
    city: null as string | null,
    country: null as string | null,
    // Branding
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    textColor: '#111827',
    bgColor: '#FFFFFF',
    darkPrimaryColor: '#60A5FA',
    darkBgColor: '#0F172A',
    // Default / External Links
    homeUrl: '/',
    privacyPolicyUrl: '/privacy-policy',
    termsUrl: '/terms-of-service',
    cookiePolicyUrl: '/cookies',
    appStoreUrl: null as string | null,
    playStoreUrl: null as string | null,
    docsUrl: null as string | null,
    // Social Media
    facebookUrl: null as string | null,
    twitterUrl: null as string | null,
    linkedinUrl: null as string | null,
    instagramUrl: null as string | null,
    youtubeUrl: null as string | null,
    // SEO
    metaTitle: 'ScholarHub - Find Scholarships for Students Worldwide',
    metaDescription: 'ScholarHub helps students worldwide discover and access scholarship opportunities for academic and professional growth.',
    googleAnalyticsId: null as string | null,
    ogTitle: 'ScholarHub - Find Scholarships for Students Worldwide',
    ogDescription: 'Empowering students worldwide to discover scholarship opportunities for academic and professional growth.',
    ogImageUrl: null as string | null,
    twitterCard: 'summary_large_image',
    robotsMeta: 'index, follow',
    canonicalUrl: null as string | null,
    // Footer
    footerText: 'Connecting students with scholarship opportunities worldwide.',
    copyrightText: '© 2026 ScholarHub. All rights reserved.',
    // Scholarship
    autoApproveScholarships: false,
    maxScholarshipsPerProf: 10,
    featuredScholarshipLimit: 6,
    requireApprovalForEdit: true,
    // Application
    maxApplicationsPerStudent: 5,
    allowWithdrawal: true,
    deadlineBufferDays: 3,
    allowDraftApplications: true,
    // Notification
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    deadlineReminderDays: 7,
    notifyAdminOnNewScholarship: true,
    notifyAdminOnNewApplication: true,
};

// ─── Helper: get or auto-create the singleton settings row ───────────────────
const getOrCreateSettings = () =>
    prisma.settings.upsert({
        where: { id: 1 },
        create: DEFAULT_SETTINGS,
        update: {},
    });

// ─── Helper: shape raw row into grouped sections ─────────────────────────────
const toGrouped = (raw: Awaited<ReturnType<typeof getOrCreateSettings>>) => ({
    platform: {
        defaultLanguage: raw.defaultLanguage,
        timezone: raw.timezone,
        registrationEnabled: raw.registrationEnabled,
        requireEmailVerification: raw.requireEmailVerification,
        maxFileSizeMB: raw.maxFileSizeMB,
        allowedFileTypes: raw.allowedFileTypes,
    },
    site: {
        siteName: raw.siteName,
        siteDescription: raw.siteDescription,
        siteLogoUrl: raw.siteLogoUrl,
        siteFaviconUrl: raw.siteFaviconUrl,
        contactEmail: raw.contactEmail,
        supportEmail: raw.supportEmail,
        supportPhone: raw.supportPhone,
        maintenanceMode: raw.maintenanceMode,
        maintenanceMessage: raw.maintenanceMessage,
        address: raw.address,
        city: raw.city,
        country: raw.country,
    },
    branding: {
        primaryColor: raw.primaryColor,
        secondaryColor: raw.secondaryColor,
        accentColor: raw.accentColor,
        textColor: raw.textColor,
        bgColor: raw.bgColor,
        darkPrimaryColor: raw.darkPrimaryColor,
        darkBgColor: raw.darkBgColor,
    },
    links: {
        homeUrl: raw.homeUrl,
        privacyPolicyUrl: raw.privacyPolicyUrl,
        termsUrl: raw.termsUrl,
        cookiePolicyUrl: raw.cookiePolicyUrl,
        appStoreUrl: raw.appStoreUrl,
        playStoreUrl: raw.playStoreUrl,
        docsUrl: raw.docsUrl,
    },
    social: {
        facebookUrl: raw.facebookUrl,
        twitterUrl: raw.twitterUrl,
        linkedinUrl: raw.linkedinUrl,
        instagramUrl: raw.instagramUrl,
        youtubeUrl: raw.youtubeUrl,
    },
    seo: {
        metaTitle: raw.metaTitle,
        metaDescription: raw.metaDescription,
        googleAnalyticsId: raw.googleAnalyticsId,
        ogTitle: raw.ogTitle,
        ogDescription: raw.ogDescription,
        ogImageUrl: raw.ogImageUrl,
        twitterCard: raw.twitterCard,
        robotsMeta: raw.robotsMeta,
        canonicalUrl: raw.canonicalUrl,
    },
    footer: {
        footerText: raw.footerText,
        copyrightText: raw.copyrightText,
    },
    scholarship: {
        autoApproveScholarships: raw.autoApproveScholarships,
        maxScholarshipsPerProf: raw.maxScholarshipsPerProf,
        featuredScholarshipLimit: raw.featuredScholarshipLimit,
        requireApprovalForEdit: raw.requireApprovalForEdit,
    },
    application: {
        maxApplicationsPerStudent: raw.maxApplicationsPerStudent,
        allowWithdrawal: raw.allowWithdrawal,
        deadlineBufferDays: raw.deadlineBufferDays,
        allowDraftApplications: raw.allowDraftApplications,
    },
    notification: {
        emailNotificationsEnabled: raw.emailNotificationsEnabled,
        pushNotificationsEnabled: raw.pushNotificationsEnabled,
        deadlineReminderDays: raw.deadlineReminderDays,
        notifyAdminOnNewScholarship: raw.notifyAdminOnNewScholarship,
        notifyAdminOnNewApplication: raw.notifyAdminOnNewApplication,
    },
    meta: {
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    },
});

// ─── Helper: flatten nested section groups into flat fields ──────────────────
const SECTION_KEYS = ['platform', 'site', 'branding', 'links', 'social', 'seo', 'footer', 'scholarship', 'application', 'notification'] as const;

const flattenBody = (body: Record<string, unknown>): Record<string, unknown> => {
    const flat: Record<string, unknown> = { ...body };
    for (const section of SECTION_KEYS) {
        if (flat[section] && typeof flat[section] === 'object' && !Array.isArray(flat[section])) {
            Object.assign(flat, flat[section] as Record<string, unknown>);
            delete flat[section];
        }
    }
    return flat;
};

// ─── Helper: build allowed-fields update data ────────────────────────────────
const pickAllowed = (body: Record<string, unknown>): Record<string, unknown> => {
    const data: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (body[key] !== undefined) data[key] = body[key];
    }
    return data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL  —  full grouped structure
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings
 * @desc    Get all settings grouped by section
 * @access  Private/Admin
 */
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw) } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE ALL / ANY FIELDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   PUT /api/settings
 * @desc    Update any settings fields
 * @access  Private/Admin
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const data = pickAllowed(flattenBody(req.body as Record<string, unknown>));
    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Settings updated successfully', data: { settings: toGrouped(raw) } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/platform
 * @access  Private/Admin
 */
export const getPlatformSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).platform } });
});

/**
 * @route   PUT /api/settings/platform
 * @access  Private/Admin
 */
export const updatePlatformSettings = asyncHandler(async (req: Request, res: Response) => {
    const { defaultLanguage, timezone, registrationEnabled, requireEmailVerification, maxFileSizeMB, allowedFileTypes } = req.body;

    const data: Record<string, unknown> = {};
    if (defaultLanguage !== undefined)          data.defaultLanguage = defaultLanguage;
    if (timezone !== undefined)                 data.timezone = timezone;
    if (registrationEnabled !== undefined)      data.registrationEnabled = Boolean(registrationEnabled);
    if (requireEmailVerification !== undefined) data.requireEmailVerification = Boolean(requireEmailVerification);
    if (maxFileSizeMB !== undefined)            data.maxFileSizeMB = Number(maxFileSizeMB);
    if (allowedFileTypes !== undefined)         data.allowedFileTypes = Array.isArray(allowedFileTypes) ? allowedFileTypes : [];

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Platform settings updated successfully', data: { settings: toGrouped(raw).platform } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SITE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/site
 * @access  Private/Admin
 */
export const getSiteSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).site } });
});

/**
 * @route   PUT /api/settings/site
 * @access  Private/Admin
 */
export const updateSiteSettings = asyncHandler(async (req: Request, res: Response) => {
    const {
        siteName, siteDescription, siteLogoUrl, siteFaviconUrl,
        contactEmail, supportEmail, supportPhone,
        maintenanceMode, maintenanceMessage,
        address, city, country,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (siteName !== undefined)           data.siteName = siteName;
    if (siteDescription !== undefined)    data.siteDescription = siteDescription;
    if (siteLogoUrl !== undefined)        data.siteLogoUrl = siteLogoUrl;
    if (siteFaviconUrl !== undefined)     data.siteFaviconUrl = siteFaviconUrl;
    if (contactEmail !== undefined)       data.contactEmail = contactEmail;
    if (supportEmail !== undefined)       data.supportEmail = supportEmail;
    if (supportPhone !== undefined)       data.supportPhone = supportPhone;
    if (maintenanceMode !== undefined)    data.maintenanceMode = Boolean(maintenanceMode);
    if (maintenanceMessage !== undefined) data.maintenanceMessage = maintenanceMessage;
    if (address !== undefined)            data.address = address;
    if (city !== undefined)               data.city = city;
    if (country !== undefined)            data.country = country;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Site settings updated successfully', data: { settings: toGrouped(raw).site } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BRANDING SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/branding
 * @access  Private/Admin
 */
export const getBrandingSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).branding } });
});

/**
 * @route   PUT /api/settings/branding
 * @access  Private/Admin
 */
export const updateBrandingSettings = asyncHandler(async (req: Request, res: Response) => {
    const { primaryColor, secondaryColor, accentColor, textColor, bgColor, darkPrimaryColor, darkBgColor } = req.body;

    const data: Record<string, unknown> = {};
    if (primaryColor !== undefined)    data.primaryColor = primaryColor;
    if (secondaryColor !== undefined)  data.secondaryColor = secondaryColor;
    if (accentColor !== undefined)     data.accentColor = accentColor;
    if (textColor !== undefined)       data.textColor = textColor;
    if (bgColor !== undefined)         data.bgColor = bgColor;
    if (darkPrimaryColor !== undefined) data.darkPrimaryColor = darkPrimaryColor;
    if (darkBgColor !== undefined)     data.darkBgColor = darkBgColor;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Branding settings updated successfully', data: { settings: toGrouped(raw).branding } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT / EXTERNAL LINKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/links
 * @access  Private/Admin
 */
export const getLinksSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).links } });
});

/**
 * @route   PUT /api/settings/links
 * @access  Private/Admin
 */
export const updateLinksSettings = asyncHandler(async (req: Request, res: Response) => {
    const { homeUrl, privacyPolicyUrl, termsUrl, cookiePolicyUrl, appStoreUrl, playStoreUrl, docsUrl } = req.body;

    const data: Record<string, unknown> = {};
    if (homeUrl !== undefined)          data.homeUrl = homeUrl;
    if (privacyPolicyUrl !== undefined) data.privacyPolicyUrl = privacyPolicyUrl;
    if (termsUrl !== undefined)         data.termsUrl = termsUrl;
    if (cookiePolicyUrl !== undefined)  data.cookiePolicyUrl = cookiePolicyUrl;
    if (appStoreUrl !== undefined)      data.appStoreUrl = appStoreUrl;
    if (playStoreUrl !== undefined)     data.playStoreUrl = playStoreUrl;
    if (docsUrl !== undefined)          data.docsUrl = docsUrl;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Links settings updated successfully', data: { settings: toGrouped(raw).links } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/social
 * @access  Private/Admin
 */
export const getSocialSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).social } });
});

/**
 * @route   PUT /api/settings/social
 * @access  Private/Admin
 */
export const updateSocialSettings = asyncHandler(async (req: Request, res: Response) => {
    const { facebookUrl, twitterUrl, linkedinUrl, instagramUrl, youtubeUrl } = req.body;

    const data: Record<string, unknown> = {};
    if (facebookUrl !== undefined)  data.facebookUrl = facebookUrl;
    if (twitterUrl !== undefined)   data.twitterUrl = twitterUrl;
    if (linkedinUrl !== undefined)  data.linkedinUrl = linkedinUrl;
    if (instagramUrl !== undefined) data.instagramUrl = instagramUrl;
    if (youtubeUrl !== undefined)   data.youtubeUrl = youtubeUrl;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Social media settings updated successfully', data: { settings: toGrouped(raw).social } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SEO SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/seo
 * @access  Private/Admin
 */
export const getSeoSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).seo } });
});

/**
 * @route   PUT /api/settings/seo
 * @access  Private/Admin
 */
export const updateSeoSettings = asyncHandler(async (req: Request, res: Response) => {
    const {
        metaTitle, metaDescription, googleAnalyticsId,
        ogTitle, ogDescription, ogImageUrl,
        twitterCard, robotsMeta, canonicalUrl,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (metaTitle !== undefined)         data.metaTitle = metaTitle;
    if (metaDescription !== undefined)   data.metaDescription = metaDescription;
    if (googleAnalyticsId !== undefined) data.googleAnalyticsId = googleAnalyticsId;
    if (ogTitle !== undefined)           data.ogTitle = ogTitle;
    if (ogDescription !== undefined)     data.ogDescription = ogDescription;
    if (ogImageUrl !== undefined)        data.ogImageUrl = ogImageUrl;
    if (twitterCard !== undefined)       data.twitterCard = twitterCard;
    if (robotsMeta !== undefined)        data.robotsMeta = robotsMeta;
    if (canonicalUrl !== undefined)      data.canonicalUrl = canonicalUrl;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'SEO settings updated successfully', data: { settings: toGrouped(raw).seo } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/footer
 * @access  Private/Admin
 */
export const getFooterSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).footer } });
});

/**
 * @route   PUT /api/settings/footer
 * @access  Private/Admin
 */
export const updateFooterSettings = asyncHandler(async (req: Request, res: Response) => {
    const { footerText, copyrightText } = req.body;

    const data: Record<string, unknown> = {};
    if (footerText !== undefined)    data.footerText = footerText;
    if (copyrightText !== undefined) data.copyrightText = copyrightText;

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Footer settings updated successfully', data: { settings: toGrouped(raw).footer } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHOLARSHIP SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/scholarship
 * @access  Private/Admin
 */
export const getScholarshipSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).scholarship } });
});

/**
 * @route   PUT /api/settings/scholarship
 * @access  Private/Admin
 */
export const updateScholarshipSettings = asyncHandler(async (req: Request, res: Response) => {
    const { autoApproveScholarships, maxScholarshipsPerProf, featuredScholarshipLimit, requireApprovalForEdit } = req.body;

    const data: Record<string, unknown> = {};
    if (autoApproveScholarships !== undefined)  data.autoApproveScholarships = Boolean(autoApproveScholarships);
    if (maxScholarshipsPerProf !== undefined)   data.maxScholarshipsPerProf = Number(maxScholarshipsPerProf);
    if (featuredScholarshipLimit !== undefined) data.featuredScholarshipLimit = Number(featuredScholarshipLimit);
    if (requireApprovalForEdit !== undefined)   data.requireApprovalForEdit = Boolean(requireApprovalForEdit);

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Scholarship settings updated successfully', data: { settings: toGrouped(raw).scholarship } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// APPLICATION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/application
 * @access  Private/Admin
 */
export const getApplicationSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).application } });
});

/**
 * @route   PUT /api/settings/application
 * @access  Private/Admin
 */
export const updateApplicationSettings = asyncHandler(async (req: Request, res: Response) => {
    const { maxApplicationsPerStudent, allowWithdrawal, deadlineBufferDays, allowDraftApplications } = req.body;

    const data: Record<string, unknown> = {};
    if (maxApplicationsPerStudent !== undefined) data.maxApplicationsPerStudent = Number(maxApplicationsPerStudent);
    if (allowWithdrawal !== undefined)           data.allowWithdrawal = Boolean(allowWithdrawal);
    if (deadlineBufferDays !== undefined)        data.deadlineBufferDays = Number(deadlineBufferDays);
    if (allowDraftApplications !== undefined)    data.allowDraftApplications = Boolean(allowDraftApplications);

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Application settings updated successfully', data: { settings: toGrouped(raw).application } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/settings/notification
 * @access  Private/Admin
 */
export const getNotificationSettings = asyncHandler(async (_req: Request, res: Response) => {
    const raw = await getOrCreateSettings();
    res.json({ success: true, data: { settings: toGrouped(raw).notification } });
});

/**
 * @route   PUT /api/settings/notification
 * @access  Private/Admin
 */
export const updateNotificationSettings = asyncHandler(async (req: Request, res: Response) => {
    const {
        emailNotificationsEnabled, pushNotificationsEnabled,
        deadlineReminderDays, notifyAdminOnNewScholarship, notifyAdminOnNewApplication,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (emailNotificationsEnabled !== undefined)   data.emailNotificationsEnabled = Boolean(emailNotificationsEnabled);
    if (pushNotificationsEnabled !== undefined)    data.pushNotificationsEnabled = Boolean(pushNotificationsEnabled);
    if (deadlineReminderDays !== undefined)        data.deadlineReminderDays = Number(deadlineReminderDays);
    if (notifyAdminOnNewScholarship !== undefined) data.notifyAdminOnNewScholarship = Boolean(notifyAdminOnNewScholarship);
    if (notifyAdminOnNewApplication !== undefined) data.notifyAdminOnNewApplication = Boolean(notifyAdminOnNewApplication);

    const raw = await prisma.settings.upsert({
        where: { id: 1 },
        create: { ...DEFAULT_SETTINGS, ...data },
        update: data,
    });
    res.json({ success: true, message: 'Notification settings updated successfully', data: { settings: toGrouped(raw).notification } });
});
