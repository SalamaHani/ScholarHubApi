import { Request, Response } from 'express';
import { ApplicationStatus, UserRole } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler, updateUserCompleteness } from '../utils/index.js';



/**
 * @route   POST /api/applications
 * @desc    Submit a scholarship application (Student only)
 * @access  Private/Student
 */
export const createApplication = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { scholarshipId, coverLetter, documents, additionalInfo, status = ApplicationStatus.PENDING } = req.body;

    // Get student profile to validate completeness and prefill data
    const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        select: {
            id: true,
            university: true,
            fieldOfStudy: true,
            currentDegree: true,
            gpa: true,
            skills: true,
            languages: true,
            phoneNumber: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                },
            },
        },
    });

    if (!studentProfile) {
        throw ApiError.badRequest('Student profile not found. Please complete your profile first.');
    }

    // Calculate and update profile completeness
    const profileCompleteness = await updateUserCompleteness(userId, req.user!.role);

    // Check if scholarship exists and is open
    const scholarship = await prisma.scholarship.findUnique({
        where: { id: scholarshipId },
    });

    if (!scholarship) {
        throw ApiError.notFound('Scholarship not found');
    }

    if (scholarship.status !== 'APPROVED') {
        throw ApiError.badRequest('This scholarship is not accepting applications');
    }

    if (scholarship.deadline < new Date()) {
        throw ApiError.badRequest('The application deadline has passed');
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
        where: {
            userId_scholarshipId: { userId, scholarshipId },
        },
    });

    if (existingApplication) {
        throw ApiError.conflict('You have already applied to this scholarship');
    }

    // Prepare application data with profile information
    let applicationData = {
        userId,
        scholarshipId,
        coverLetter: coverLetter || '',
        documents: documents && Array.isArray(documents) ? documents : [],
        additionalInfo: additionalInfo || '',
        status: status as ApplicationStatus,
    };

    // Create application
    const application = await prisma.application.create({
        data: applicationData,
        include: {
            scholarship: {
                select: { id: true, title: true, organization: true, deadline: true },
            },
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });

    res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        progress: {
            profileCompleteness,
            applicationStatus: 'SUCCESS',
            step: 'Application submitted',
        },
        data: {
            application,
            studentProfile: {
                university: studentProfile.university,
                fieldOfStudy: studentProfile.fieldOfStudy,
                currentDegree: studentProfile.currentDegree,
                gpa: studentProfile.gpa,
                skills: studentProfile.skills,
                languages: studentProfile.languages,
                phone: studentProfile.phoneNumber,
            },
        },
    });
});

/**
 * @route   GET /api/applications
 * @desc    Get current user's applications
 * @access  Private/Student
 */
export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (status) {
        where.status = status as ApplicationStatus;
    }

    const [applications, total] = await Promise.all([
        prisma.application.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { submittedAt: 'desc' },
            include: {
                scholarship: {
                    select: {
                        id: true,
                        title: true,
                        organization: true,
                        country: true,
                        deadline: true,
                        fundingType: true,
                    },
                },
            },
        }),
        prisma.application.count({ where }),
    ]);

    res.json({
        success: true,
        data: {
            applications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        },
    });
});

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const application = await prisma.application.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    studentProfile: {
                        select: {
                            id: true,
                            university: true,
                            fieldOfStudy: true,
                            currentDegree: true,
                            gpa: true,
                            experience: true,
                        }
                    },
                },
            },
            scholarship: {
                include: {
                    createdBy: { select: { id: true } },
                },
            },
        },
    });

    if (!application) {
        throw ApiError.notFound('Application not found');
    }

    // Check permission: own application, scholarship creator, or admin
    const isOwner = application.userId === userId;
    const isScholarshipCreator = application.scholarship.createdById === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isScholarshipCreator && !isAdmin) {
        throw ApiError.forbidden('Not authorized to view this application');
    }

    res.json({
        success: true,
        data: { application },
    });
});

/**
 * @route   PUT /api/applications/:id/withdraw
 * @desc    Withdraw an application (Student only)
 * @access  Private/Student
 */
export const withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const application = await prisma.application.findUnique({
        where: { id },
    });

    if (!application) {
        throw ApiError.notFound('Application not found');
    }

    if (application.userId !== userId) {
        throw ApiError.forbidden('Not authorized to withdraw this application');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
        throw ApiError.badRequest('Application already withdrawn');
    }

    if (application.status === ApplicationStatus.ACCEPTED || application.status === ApplicationStatus.REJECTED) {
        throw ApiError.badRequest('Cannot withdraw a finalized application');
    }

    const updatedApplication = await prisma.application.update({
        where: { id },
        data: { status: ApplicationStatus.WITHDRAWN },
    });

    res.json({
        success: true,
        message: 'Application withdrawn successfully',
        data: { application: updatedApplication },
    });
});

/**
 * @route   PUT /api/applications/:id
 * @desc    Update an application (especially from DRAFT to PENDING)
 * @access  Private/Student
 */
export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { coverLetter, documents, additionalInfo, status } = req.body;

    const application = await prisma.application.findUnique({
        where: { id },
    });

    if (!application) {
        throw ApiError.notFound('Application not found');
    }

    if (application.userId !== userId) {
        throw ApiError.forbidden('Not authorized to update this application');
    }

    if (application.status !== ApplicationStatus.DRAFT && application.status !== ApplicationStatus.PENDING) {
        throw ApiError.badRequest('Cannot update a finalized application');
    }

    const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
            coverLetter,
            documents,
            additionalInfo,
            status: status as ApplicationStatus,
        },
    });

    res.json({
        success: true,
        message: status === ApplicationStatus.PENDING ? 'Application submitted successfully' : 'Application updated',
        data: { application: updatedApplication },
    });
});

// ==================== PROFESSOR APPLICATION MANAGEMENT ====================

/**
 * @route   GET /api/professor/applications
 * @desc    Get applications to professor's scholarships
 * @access  Private/Professor
 */
export const getProfessorApplications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status, scholarshipId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
        scholarship: { createdById: userId },
        status: { not: ApplicationStatus.DRAFT }, // Professors should not see drafts
    };

    if (status) {
        where.status = status as ApplicationStatus;
    }

    if (scholarshipId) {
        where.scholarshipId = scholarshipId as string;
    }

    const [applications, total] = await Promise.all([
        prisma.application.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { submittedAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        studentProfile: {
                            select: {
                                id: true,
                                university: true,
                                fieldOfStudy: true,
                                currentDegree: true,
                                gpa: true,
                                experience: true,
                            }
                        },
                    },
                },
                scholarship: {
                    select: { id: true, title: true },
                },
            },
        }),
        prisma.application.count({ where }),
    ]);

    res.json({
        success: true,
        data: {
            applications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        },
    });
});

/**
 * @route   PUT /api/professor/applications/:id/evaluate
 * @desc    Evaluate an application
 * @access  Private/Professor
 */
export const evaluateApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { status, evaluationNotes } = req.body;

    const application = await prisma.application.findUnique({
        where: { id },
        include: {
            scholarship: { select: { createdById: true, title: true } },
            user: { select: { id: true } },
        },
    });

    if (!application) {
        throw ApiError.notFound('Application not found');
    }

    if (application.scholarship.createdById !== userId) {
        throw ApiError.forbidden('Not authorized to evaluate this application');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
        throw ApiError.badRequest('Cannot evaluate a withdrawn application');
    }

    const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
            status: status as ApplicationStatus,
            evaluationNotes,
            evaluatedBy: userId,
            evaluatedAt: new Date(),
        },
    });

    // Notify student
    let notificationTitle = '';
    let notificationMessage = '';

    if (status === ApplicationStatus.ACCEPTED) {
        notificationTitle = 'Application Accepted! 🎉';
        notificationMessage = `Congratulations! Your application for "${application.scholarship.title}" has been accepted.`;
    } else if (status === ApplicationStatus.REJECTED) {
        notificationTitle = 'Application Update';
        notificationMessage = `Your application for "${application.scholarship.title}" was not selected.`;
    } else if (status === ApplicationStatus.UNDER_REVIEW) {
        notificationTitle = 'Application Under Review';
        notificationMessage = `Your application for "${application.scholarship.title}" is now under review.`;
    }

    if (notificationTitle) {
        await prisma.notification.create({
            data: {
                userId: application.user.id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'application_update',
                link: `/applications/${id}`,
            },
        });
    }

    res.json({
        success: true,
        message: 'Application evaluated successfully',
        data: { application: updatedApplication },
    });
});

// ==================== ADMIN APPLICATION MANAGEMENT ====================

/**
 * @route   GET /api/admin/applications
 * @desc    Get all applications (Admin only)
 * @access  Private/Admin
 */
export const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, scholarshipId, userId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status as ApplicationStatus;
    if (scholarshipId) where.scholarshipId = scholarshipId as string;
    if (userId) where.userId = userId as string;

    const [applications, total] = await Promise.all([
        prisma.application.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { submittedAt: 'desc' },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                scholarship: {
                    select: { id: true, title: true, organization: true },
                },
            },
        }),
        prisma.application.count({ where }),
    ]);

    res.json({
        success: true,
        data: {
            applications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        },
    });
});

/**
 * @route   GET /api/admin/applications/stats
 * @desc    Get application statistics
 * @access  Private/Admin
 */
export const getApplicationStats = asyncHandler(async (req: Request, res: Response) => {
    const [
        total,
        pending,
        underReview,
        accepted,
        rejected,
        withdrawn,
    ] = await Promise.all([
        prisma.application.count(),
        prisma.application.count({ where: { status: ApplicationStatus.PENDING } }),
        prisma.application.count({ where: { status: ApplicationStatus.UNDER_REVIEW } }),
        prisma.application.count({ where: { status: ApplicationStatus.ACCEPTED } }),
        prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),
        prisma.application.count({ where: { status: ApplicationStatus.WITHDRAWN } }),
    ]);

    res.json({
        success: true,
        data: {
            total,
            byStatus: {
                pending,
                underReview,
                accepted,
                rejected,
                withdrawn,
            },
        },
    });
});
