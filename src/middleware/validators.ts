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
    body('contactEmail')
        .optional()
        .isEmail()
        .withMessage('Contact email must be a valid email address'),
    body('maintenanceMode')
        .optional()
        .isBoolean()
        .withMessage('Maintenance mode must be a boolean'),
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
];

// Combined validator for PUT /api/settings (all fields)
export const updateSettingsValidator = [
    ...updateSiteSettingsValidator,
    ...updateScholarshipSettingsValidator,
    ...updateApplicationSettingsValidator,
    ...updateNotificationSettingsValidator,
];
