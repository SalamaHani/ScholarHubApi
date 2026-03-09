import { Request, Response } from 'express';
import { ApplicationStatus, UserRole, InterviewStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';
import { createNotification } from '../services/notification.helper.js';
import { sendInterviewScheduledEmail } from '../services/mail.service.js';

// ==================== PROFESSOR / ADMIN: SCHEDULE INTERVIEW ====================

/**
 * @route   POST /api/interviews
 * @desc    Schedule an interview for an application (Professor/Admin)
 * @access  Private/Professor|Admin
 */
export const scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { applicationId, scheduledAt, platform, meetingLink, location, notes, duration } = req.body;

    // Load application with scholarship and student info
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            scholarship: {
                select: { id: true, title: true, createdById: true },
            },
            user: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
            interview: true,
        },
    });

    if (!application) {
        throw ApiError.notFound('Application not found');
    }

    // Only scholarship creator or admin can schedule
    const isAdmin = userRole === UserRole.ADMIN;
    const isCreator = application.scholarship.createdById === userId;
    if (!isAdmin && !isCreator) {
        throw ApiError.forbidden('Not authorized to schedule an interview for this application');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
        throw ApiError.badRequest('Cannot schedule interview for a withdrawn application');
    }

    if (application.status === ApplicationStatus.REJECTED) {
        throw ApiError.badRequest('Cannot schedule interview for a rejected application');
    }

    if (application.interview) {
        throw ApiError.conflict('An interview is already scheduled for this application. Update the existing one.');
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
        throw ApiError.badRequest('Interview must be scheduled in the future');
    }

    // Create interview and update application status
    const [interview] = await prisma.$transaction([
        prisma.interview.create({
            data: {
                applicationId,
                scheduledAt: scheduledDate,
                platform: platform ?? 'OTHER',
                meetingLink: meetingLink ?? null,
                location: location ?? null,
                notes: notes ?? null,
                duration: duration ?? 60,
                status: InterviewStatus.SCHEDULED,
                scheduledBy: userId,
            },
        }),
        prisma.application.update({
            where: { id: applicationId },
            data: { status: ApplicationStatus.INTERVIEW_SCHEDULED },
        }),
    ]);

    // Notify student
    try {
        const studentId = application.user.id;
        const scholarshipTitle = application.scholarship.title;

        await createNotification(
            [studentId],
            {
                title: 'Interview Scheduled 📅',
                message: `An interview has been scheduled for your application to "${scholarshipTitle}". Check your details.`,
                type: 'interview_scheduled',
                link: `/applications/${applicationId}`,
            },
            async () => {
                await sendInterviewScheduledEmail(
                    application.user.email,
                    `${application.user.firstName} ${application.user.lastName}`,
                    scholarshipTitle,
                    scheduledDate,
                    platform ?? 'OTHER',
                    meetingLink,
                    location,
                    duration ?? 60,
                    notes
                );
            }
        );
    } catch (err) {
        console.error('Failed to send interview notification:', err);
    }

    res.status(201).json({
        success: true,
        message: 'Interview scheduled successfully',
        data: { interview },
    });
});

// ==================== STUDENT: VIEW MY INTERVIEWS ====================

/**
 * @route   GET /api/interviews/my
 * @desc    Get current student's interviews
 * @access  Private/Student
 */
export const getMyInterviews = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
        application: { userId },
    };
    if (status) where.status = status as InterviewStatus;

    const [interviews, total] = await Promise.all([
        prisma.interview.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { scheduledAt: 'asc' },
            include: {
                application: {
                    select: {
                        id: true,
                        status: true,
                        scholarship: {
                            select: { id: true, title: true, organization: true },
                        },
                    },
                },
            },
        }),
        prisma.interview.count({ where }),
    ]);

    res.json({
        success: true,
        data: {
            interviews,
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
 * @route   GET /api/interviews/:id
 * @desc    Get interview by ID
 * @access  Private
 */
export const getInterviewById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    scholarship: {
                        select: { id: true, title: true, organization: true, createdById: true },
                    },
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
            },
        },
    });

    if (!interview) {
        throw ApiError.notFound('Interview not found');
    }

    const isAdmin = userRole === UserRole.ADMIN;
    const isStudent = interview.application.user.id === userId;
    const isCreator = interview.application.scholarship.createdById === userId;

    if (!isAdmin && !isStudent && !isCreator) {
        throw ApiError.forbidden('Not authorized to view this interview');
    }

    res.json({
        success: true,
        data: { interview },
    });
});

/**
 * @route   GET /api/interviews/application/:applicationId
 * @desc    Get interview for a specific application
 * @access  Private
 */
export const getInterviewByApplication = asyncHandler(async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            scholarship: { select: { createdById: true } },
            interview: true,
        },
    });

    if (!application) {
        throw ApiError.notFound('Application not found');
    }

    const isAdmin = userRole === UserRole.ADMIN;
    const isStudent = application.userId === userId;
    const isCreator = application.scholarship.createdById === userId;

    if (!isAdmin && !isStudent && !isCreator) {
        throw ApiError.forbidden('Not authorized to view this application\'s interview');
    }

    if (!application.interview) {
        throw ApiError.notFound('No interview scheduled for this application');
    }

    res.json({
        success: true,
        data: { interview: application.interview },
    });
});

// ==================== PROFESSOR / ADMIN: MANAGE INTERVIEWS ====================

/**
 * @route   GET /api/interviews
 * @desc    Get interviews (Admin: all; Professor: for their scholarships)
 * @access  Private/Professor|Admin
 */
export const getInterviews = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { page = 1, limit = 20, status, scholarshipId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status as InterviewStatus;

    if (userRole === UserRole.PROFESSOR) {
        where.application = { scholarship: { createdById: userId } };
    } else if (scholarshipId) {
        where.application = { scholarshipId: scholarshipId as string };
    }

    const [interviews, total] = await Promise.all([
        prisma.interview.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { scheduledAt: 'asc' },
            include: {
                application: {
                    select: {
                        id: true,
                        status: true,
                        scholarship: { select: { id: true, title: true, organization: true } },
                        user: { select: { id: true, firstName: true, lastName: true, email: true } },
                    },
                },
            },
        }),
        prisma.interview.count({ where }),
    ]);

    res.json({
        success: true,
        data: {
            interviews,
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
 * @route   PUT /api/interviews/:id
 * @desc    Update interview details (Professor/Admin)
 * @access  Private/Professor|Admin
 */
export const updateInterview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { scheduledAt, platform, meetingLink, location, notes, duration } = req.body;

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    scholarship: { select: { createdById: true, title: true } },
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            },
        },
    });

    if (!interview) {
        throw ApiError.notFound('Interview not found');
    }

    const isAdmin = userRole === UserRole.ADMIN;
    const isCreator = interview.application.scholarship.createdById === userId;
    if (!isAdmin && !isCreator) {
        throw ApiError.forbidden('Not authorized to update this interview');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
        throw ApiError.badRequest('Cannot update a cancelled interview');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
        throw ApiError.badRequest('Cannot update a completed interview');
    }

    const updateData: any = {};
    if (scheduledAt !== undefined) {
        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            throw ApiError.badRequest('Interview must be scheduled in the future');
        }
        updateData.scheduledAt = scheduledDate;
    }
    if (platform !== undefined) updateData.platform = platform;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (duration !== undefined) updateData.duration = duration;

    const updatedInterview = await prisma.interview.update({
        where: { id },
        data: updateData,
    });

    // Notify student of update
    try {
        await createNotification(
            [interview.application.user.id],
            {
                title: 'Interview Updated 📅',
                message: `Your interview details for "${interview.application.scholarship.title}" have been updated.`,
                type: 'interview_updated',
                link: `/applications/${interview.applicationId}`,
            },
            async () => {
                if (scheduledAt) {
                    await sendInterviewScheduledEmail(
                        interview.application.user.email,
                        `${interview.application.user.firstName} ${interview.application.user.lastName}`,
                        interview.application.scholarship.title,
                        new Date(scheduledAt),
                        updateData.platform ?? interview.platform,
                        updateData.meetingLink ?? interview.meetingLink ?? undefined,
                        updateData.location ?? interview.location ?? undefined,
                        updateData.duration ?? interview.duration,
                        updateData.notes ?? interview.notes ?? undefined
                    );
                }
            }
        );
    } catch (err) {
        console.error('Failed to send interview update notification:', err);
    }

    res.json({
        success: true,
        message: 'Interview updated successfully',
        data: { interview: updatedInterview },
    });
});

/**
 * @route   PUT /api/interviews/:id/cancel
 * @desc    Cancel an interview (Professor/Admin)
 * @access  Private/Professor|Admin
 */
export const cancelInterview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { cancelReason } = req.body;

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    scholarship: { select: { createdById: true, title: true } },
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            },
        },
    });

    if (!interview) {
        throw ApiError.notFound('Interview not found');
    }

    const isAdmin = userRole === UserRole.ADMIN;
    const isCreator = interview.application.scholarship.createdById === userId;
    if (!isAdmin && !isCreator) {
        throw ApiError.forbidden('Not authorized to cancel this interview');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
        throw ApiError.badRequest('Interview is already cancelled');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
        throw ApiError.badRequest('Cannot cancel a completed interview');
    }

    // Cancel interview and revert application status to UNDER_REVIEW
    const [updatedInterview] = await prisma.$transaction([
        prisma.interview.update({
            where: { id },
            data: {
                status: InterviewStatus.CANCELLED,
                cancelReason: cancelReason ?? null,
            },
        }),
        prisma.application.update({
            where: { id: interview.applicationId },
            data: { status: ApplicationStatus.UNDER_REVIEW },
        }),
    ]);

    // Notify student
    try {
        await createNotification(
            [interview.application.user.id],
            {
                title: 'Interview Cancelled',
                message: `Your interview for "${interview.application.scholarship.title}" has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ''}`,
                type: 'interview_cancelled',
                link: `/applications/${interview.applicationId}`,
            }
        );
    } catch (err) {
        console.error('Failed to send interview cancellation notification:', err);
    }

    res.json({
        success: true,
        message: 'Interview cancelled successfully',
        data: { interview: updatedInterview },
    });
});

/**
 * @route   PUT /api/interviews/:id/complete
 * @desc    Mark interview as completed (Professor/Admin)
 * @access  Private/Professor|Admin
 */
export const completeInterview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { notes } = req.body;

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    scholarship: { select: { createdById: true, title: true } },
                    user: { select: { id: true } },
                },
            },
        },
    });

    if (!interview) {
        throw ApiError.notFound('Interview not found');
    }

    const isAdmin = userRole === UserRole.ADMIN;
    const isCreator = interview.application.scholarship.createdById === userId;
    if (!isAdmin && !isCreator) {
        throw ApiError.forbidden('Not authorized to complete this interview');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
        throw ApiError.badRequest('Cannot complete a cancelled interview');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
        throw ApiError.badRequest('Interview is already marked as completed');
    }

    const updateData: any = { status: InterviewStatus.COMPLETED };
    if (notes !== undefined) updateData.notes = notes;

    const updatedInterview = await prisma.interview.update({
        where: { id },
        data: updateData,
    });

    // Notify student
    try {
        await createNotification(
            [interview.application.user.id],
            {
                title: 'Interview Completed',
                message: `Your interview for "${interview.application.scholarship.title}" has been completed. The committee will be in touch soon.`,
                type: 'interview_completed',
                link: `/applications/${interview.applicationId}`,
            }
        );
    } catch (err) {
        console.error('Failed to send interview complete notification:', err);
    }

    res.json({
        success: true,
        message: 'Interview marked as completed',
        data: { interview: updatedInterview },
    });
});

/**
 * @route   PUT /api/interviews/:id/no-show
 * @desc    Mark student as no-show for interview (Professor/Admin)
 * @access  Private/Professor|Admin
 */
export const markNoShow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    scholarship: { select: { createdById: true, title: true } },
                    user: { select: { id: true } },
                },
            },
        },
    });

    if (!interview) {
        throw ApiError.notFound('Interview not found');
    }

    const isAdmin = userRole === UserRole.ADMIN;
    const isCreator = interview.application.scholarship.createdById === userId;
    if (!isAdmin && !isCreator) {
        throw ApiError.forbidden('Not authorized to update this interview');
    }

    if (interview.status !== InterviewStatus.SCHEDULED) {
        throw ApiError.badRequest(`Cannot mark as no-show — interview is already ${interview.status.toLowerCase()}`);
    }

    const updatedInterview = await prisma.interview.update({
        where: { id },
        data: { status: InterviewStatus.NO_SHOW },
    });

    res.json({
        success: true,
        message: 'Interview marked as no-show',
        data: { interview: updatedInterview },
    });
});
