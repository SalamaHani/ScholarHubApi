import { body, param, query } from 'express-validator';

// ==================== AUTH VALIDATORS ====================

export const registerValidator = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase, one uppercase, and one number'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name must be less than 50 characters'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name must be less than 50 characters'),
    body('role')
        .optional()
        .isIn(['STUDENT', 'PROFESSOR'])
        .withMessage('Role must be STUDENT or PROFESSOR'),
];

export const loginValidator = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

export const resetPasswordValidator = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase, one uppercase, and one number'),
];

// ==================== SCHOLARSHIP VALIDATORS ====================

export const createScholarshipValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    body('organization')
        .trim()
        .notEmpty()
        .withMessage('Organization is required'),
    body('country')
        .trim()
        .notEmpty()
        .withMessage('Country is required'),
    body('deadline')
        .isISO8601()
        .withMessage('Deadline must be a valid date'),
    body('applicationLink')
        .isURL()
        .withMessage('Application link must be a valid URL'),
    body('requirements')
        .trim()
        .notEmpty()
        .withMessage('Requirements are required'),
    body('eligibility')
        .trim()
        .notEmpty()
        .withMessage('Eligibility criteria are required'),
    body('fundingType')
        .isIn(['FULL', 'PARTIAL', 'TUITION_ONLY', 'STIPEND_ONLY'])
        .withMessage('Invalid funding type'),
    body('degreeLevel')
        .isArray({ min: 1 })
        .withMessage('At least one degree level is required'),
    body('fieldOfStudy')
        .isArray({ min: 1 })
        .withMessage('At least one field of study is required'),
    body('language')
        .optional()
        .trim(),
    body('studyMode')
        .optional()
        .trim()
        .isIn(['ONLINE', 'ON_CAMPUS', 'HYBRID'])
        .withMessage('Invalid study mode'),
    body('questions')
        .optional()
        .isArray()
        .withMessage('Questions must be an array'),
];

export const updateScholarshipValidator = [
    param('id')
        .notEmpty()
        .withMessage('Scholarship ID is required'),
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),
    body('deadline')
        .optional()
        .isISO8601()
        .withMessage('Deadline must be a valid date'),
    body('applicationLink')
        .optional()
        .isURL()
        .withMessage('Application link must be a valid URL'),
];

// ==================== APPLICATION VALIDATORS ====================

export const createApplicationValidator = [
    body('scholarshipId')
        .notEmpty()
        .withMessage('Scholarship ID is required'),
    body('coverLetter')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Cover letter must be less than 5000 characters'),
    body('documents')
        .optional()
        .isArray()
        .withMessage('Documents must be an array'),
    body('additionalInfo')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Additional info must be less than 2000 characters'),
    body('answers')
        .optional()
        .isArray()
        .withMessage('Answers must be an array'),
];

export const evaluateApplicationValidator = [
    param('id')
        .notEmpty()
        .withMessage('Application ID is required'),
    body('status')
        .isIn(['DRAFT', 'PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'])
        .withMessage('Invalid status'),
    body('evaluationNotes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Evaluation notes must be less than 2000 characters'),
];

// ==================== CATEGORY VALIDATORS ====================

export const createCategoryValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ max: 100 })
        .withMessage('Category name must be less than 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
];

// ==================== QUERY VALIDATORS ====================

export const paginationValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];

export const scholarshipQueryValidator = [
    ...paginationValidator,
    query('search')
        .optional()
        .trim(),
    query('country')
        .optional()
        .trim(),
    query('degreeLevel')
        .optional()
        .isIn(['BACHELOR', 'MASTER', 'PHD', 'POSTDOC', 'RESEARCH'])
        .withMessage('Invalid degree level'),
    query('fundingType')
        .optional()
        .isIn(['FULL', 'PARTIAL', 'TUITION_ONLY', 'STIPEND_ONLY'])
        .withMessage('Invalid funding type'),
    query('category')
        .optional()
        .trim(),
    query('language')
        .optional()
        .trim(),
    query('studyMode')
        .optional()
        .trim(),
    query('open')
        .optional()
        .isBoolean()
        .withMessage('Open filter must be a boolean'),
];

export const professorScholarshipQueryValidator = [
    ...paginationValidator,
    query('status')
        .optional()
        .isIn(['PENDING_APPROVAL', 'APPROVED', 'REJECTED'])
        .withMessage('Invalid status'),
    query('userId')
        .optional()
        .isString()
        .withMessage('Invalid user ID format'),
];

// ==================== ID VALIDATOR ====================

export const idParamValidator = [
    param('id')
        .notEmpty()
        .withMessage('ID is required'),
];

// ==================== SETTINGS VALIDATORS ====================

export const updatePlatformSettingsValidator = [
    body('defaultLanguage')
        .optional()
        .isIn(['ar', 'en'])
        .withMessage('defaultLanguage must be "ar" or "en"'),
    body('timezone')
        .optional()
        .isString()
        .isLength({ max: 60 })
        .withMessage('Timezone must be at most 60 characters'),
    body('registrationEnabled')
        .optional()
        .isBoolean()
        .withMessage('registrationEnabled must be a boolean'),
    body('requireEmailVerification')
        .optional()
        .isBoolean()
        .withMessage('requireEmailVerification must be a boolean'),
    body('maxFileSizeMB')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('maxFileSizeMB must be an integer between 1 and 100'),
    body('allowedFileTypes')
        .optional()
        .isArray()
        .withMessage('allowedFileTypes must be an array'),
    body('allowedFileTypes.*')
        .optional()
        .isString()
        .isLength({ max: 10 })
        .withMessage('Each file type must be a string of at most 10 characters'),
];

export const updateSiteSettingsValidator = [
    body('siteName')
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage('Site name must be at most 100 characters'),
    body('siteDescription')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Site description must be at most 500 characters'),
    body('siteLogoUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Site logo URL must be a valid URL'),
    body('siteFaviconUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Site favicon URL must be a valid URL'),
    body('contactEmail')
        .optional()
        .isEmail()
        .withMessage('Contact email must be a valid email address'),
    body('supportEmail')
        .optional({ nullable: true })
        .isEmail()
        .withMessage('Support email must be a valid email address'),
    body('supportPhone')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 30 })
        .withMessage('Support phone must be at most 30 characters'),
    body('maintenanceMode')
        .optional()
        .isBoolean()
        .withMessage('Maintenance mode must be a boolean'),
    body('maintenanceMessage')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 500 })
        .withMessage('Maintenance message must be at most 500 characters'),
    body('address')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 200 })
        .withMessage('Address must be at most 200 characters'),
    body('city')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 })
        .withMessage('City must be at most 100 characters'),
    body('country')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 })
        .withMessage('Country must be at most 100 characters'),
];

export const updateSocialSettingsValidator = [
    body('facebookUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Facebook URL must be a valid URL'),
    body('twitterUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Twitter URL must be a valid URL'),
    body('linkedinUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('LinkedIn URL must be a valid URL'),
    body('instagramUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Instagram URL must be a valid URL'),
    body('youtubeUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('YouTube URL must be a valid URL'),
];

export const updateBrandingSettingsValidator = [
    body('primaryColor')
        .optional()
        .isString()
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
        .withMessage('primaryColor must be a valid hex color (e.g. #3B82F6)'),
    body('secondaryColor')
        .optional()
        .isString()
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
        .withMessage('secondaryColor must be a valid hex color'),
    body('accentColor')
        .optional()
        .isString()
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
        .withMessage('accentColor must be a valid hex color'),
    body('textColor')
        .optional()
        .isString()
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
        .withMessage('textColor must be a valid hex color'),
    body('bgColor')
        .optional()
        .isString()
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
        .withMessage('bgColor must be a valid hex color'),
    body('darkPrimaryColor')
        .optional()
        .isString()
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
        .withMessage('darkPrimaryColor must be a valid hex color'),
    body('darkBgColor')
        .optional()
        .isString()
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
        .withMessage('darkBgColor must be a valid hex color'),
];

export const updateLinksSettingsValidator = [
    body('homeUrl')
        .optional()
        .isString()
        .isLength({ max: 200 })
        .withMessage('homeUrl must be at most 200 characters'),
    body('privacyPolicyUrl')
        .optional()
        .isString()
        .isLength({ max: 200 })
        .withMessage('privacyPolicyUrl must be at most 200 characters'),
    body('termsUrl')
        .optional()
        .isString()
        .isLength({ max: 200 })
        .withMessage('termsUrl must be at most 200 characters'),
    body('cookiePolicyUrl')
        .optional()
        .isString()
        .isLength({ max: 200 })
        .withMessage('cookiePolicyUrl must be at most 200 characters'),
    body('appStoreUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('appStoreUrl must be a valid URL'),
    body('playStoreUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('playStoreUrl must be a valid URL'),
    body('docsUrl')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 200 })
        .withMessage('docsUrl must be at most 200 characters'),
];

export const updateSeoSettingsValidator = [
    body('metaTitle')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 })
        .withMessage('metaTitle must be at most 100 characters'),
    body('metaDescription')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 300 })
        .withMessage('metaDescription must be at most 300 characters'),
    body('googleAnalyticsId')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 50 })
        .withMessage('googleAnalyticsId must be at most 50 characters'),
    body('ogTitle')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 })
        .withMessage('ogTitle must be at most 100 characters'),
    body('ogDescription')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 300 })
        .withMessage('ogDescription must be at most 300 characters'),
    body('ogImageUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('ogImageUrl must be a valid URL'),
    body('twitterCard')
        .optional()
        .isIn(['summary', 'summary_large_image', 'app', 'player'])
        .withMessage('twitterCard must be one of: summary, summary_large_image, app, player'),
    body('robotsMeta')
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage('robotsMeta must be at most 100 characters'),
    body('canonicalUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('canonicalUrl must be a valid URL'),
];

export const updateFooterSettingsValidator = [
    body('footerText')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 500 })
        .withMessage('Footer text must be at most 500 characters'),
    body('copyrightText')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 200 })
        .withMessage('Copyright text must be at most 200 characters'),
];

export const updateScholarshipSettingsValidator = [
    body('autoApproveScholarships')
        .optional()
        .isBoolean()
        .withMessage('autoApproveScholarships must be a boolean'),
    body('maxScholarshipsPerProf')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('maxScholarshipsPerProf must be an integer between 1 and 100'),
    body('featuredScholarshipLimit')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('featuredScholarshipLimit must be an integer between 1 and 20'),
    body('requireApprovalForEdit')
        .optional()
        .isBoolean()
        .withMessage('requireApprovalForEdit must be a boolean'),
];

export const updateApplicationSettingsValidator = [
    body('maxApplicationsPerStudent')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('maxApplicationsPerStudent must be an integer between 1 and 50'),
    body('allowWithdrawal')
        .optional()
        .isBoolean()
        .withMessage('allowWithdrawal must be a boolean'),
    body('deadlineBufferDays')
        .optional()
        .isInt({ min: 0, max: 30 })
        .withMessage('deadlineBufferDays must be an integer between 0 and 30'),
    body('allowDraftApplications')
        .optional()
        .isBoolean()
        .withMessage('allowDraftApplications must be a boolean'),
];

export const updateNotificationSettingsValidator = [
    body('emailNotificationsEnabled')
        .optional()
        .isBoolean()
        .withMessage('emailNotificationsEnabled must be a boolean'),
    body('pushNotificationsEnabled')
        .optional()
        .isBoolean()
        .withMessage('pushNotificationsEnabled must be a boolean'),
    body('deadlineReminderDays')
        .optional()
        .isInt({ min: 1, max: 30 })
        .withMessage('deadlineReminderDays must be an integer between 1 and 30'),
    body('notifyAdminOnNewScholarship')
        .optional()
        .isBoolean()
        .withMessage('notifyAdminOnNewScholarship must be a boolean'),
    body('notifyAdminOnNewApplication')
        .optional()
        .isBoolean()
        .withMessage('notifyAdminOnNewApplication must be a boolean'),
];

// Combined validator for PUT /api/settings (all fields)
export const updateSettingsValidator = [
    ...updatePlatformSettingsValidator,
    ...updateSiteSettingsValidator,
    ...updateBrandingSettingsValidator,
    ...updateLinksSettingsValidator,
    ...updateSocialSettingsValidator,
    ...updateSeoSettingsValidator,
    ...updateFooterSettingsValidator,
    ...updateScholarshipSettingsValidator,
    ...updateApplicationSettingsValidator,
    ...updateNotificationSettingsValidator,
];

// ==================== PAGE CONTENT VALIDATORS ====================

export const createPageContentValidator = [
    body('pageKey')
        .trim()
        .notEmpty().withMessage('Page key is required')
        .isLength({ max: 100 }).withMessage('Page key must be less than 100 characters')
        .matches(/^[a-z0-9-]+$/).withMessage('Page key must contain only lowercase letters, numbers, and hyphens'),
    body('section')
        .trim()
        .notEmpty().withMessage('Section is required')
        .isIn(['platform', 'resources', 'company']).withMessage('Section must be platform, resources, or company'),
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
    body('subtitle')
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage('Subtitle must be less than 300 characters'),
    body('ctaLink')
        .optional({ nullable: true })
        .isURL().withMessage('CTA link must be a valid URL'),
];

export const updatePageContentValidator = [
    body('section')
        .optional()
        .isIn(['platform', 'resources', 'company']).withMessage('Section must be platform, resources, or company'),
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
    body('subtitle')
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage('Subtitle must be less than 300 characters'),
    body('ctaLink')
        .optional({ nullable: true })
        .isURL().withMessage('CTA link must be a valid URL'),
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean'),
];

// ==================== FAQ ITEM VALIDATORS ====================

export const createFaqItemValidator = [
    body('pageKey')
        .trim()
        .notEmpty().withMessage('Page key is required'),
    body('question')
        .trim()
        .notEmpty().withMessage('Question is required')
        .isLength({ max: 500 }).withMessage('Question must be less than 500 characters'),
    body('answer')
        .trim()
        .notEmpty().withMessage('Answer is required'),
    body('order')
        .optional()
        .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
];

export const updateFaqItemValidator = [
    body('question')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Question must be less than 500 characters'),
    body('answer')
        .optional()
        .trim(),
    body('order')
        .optional()
        .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean'),
];

// ==================== CONTACT MESSAGE VALIDATORS ====================

export const createContactMessageValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('subject')
        .trim()
        .notEmpty().withMessage('Subject is required')
        .isLength({ min: 3, max: 200 }).withMessage('Subject must be between 3 and 200 characters'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters'),
];

// ==================== BLOG POST VALIDATORS ====================

export const createBlogPostValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 300 }).withMessage('Title must be less than 300 characters'),
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
    body('status')
        .optional()
        .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),
    body('coverImage')
        .optional({ nullable: true })
        .isURL().withMessage('Cover image must be a valid URL'),
];

export const updateBlogPostValidator = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage('Title must be less than 300 characters'),
    body('status')
        .optional()
        .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),
    body('coverImage')
        .optional({ nullable: true })
        .isURL().withMessage('Cover image must be a valid URL'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
];
