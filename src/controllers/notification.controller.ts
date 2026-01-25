import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (unreadOnly === 'true') {
        where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    res.json({
        success: true,
        data: {
            notifications,
            unreadCount,
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
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await prisma.notification.findUnique({
        where: { id },
    });

    if (!notification) {
        throw ApiError.notFound('Notification not found');
    }

    if (notification.userId !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    await prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });

    res.json({
        success: true,
        message: 'Notification marked as read',
    });
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });

    res.json({
        success: true,
        message: 'All notifications marked as read',
    });
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await prisma.notification.findUnique({
        where: { id },
    });

    if (!notification) {
        throw ApiError.notFound('Notification not found');
    }

    if (notification.userId !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    await prisma.notification.delete({ where: { id } });

    res.json({
        success: true,
        message: 'Notification deleted',
    });
});

// ==================== ADMIN NOTIFICATION MANAGEMENT ====================

/**
 * @route   POST /api/admin/notifications
 * @desc    Send notification to users (Admin only)
 * @access  Private/Admin
 */
export const sendNotification = asyncHandler(async (req: Request, res: Response) => {
    const { userIds, role, title, message, type = 'system', link } = req.body;

    let targetUserIds: string[] = [];

    if (userIds && userIds.length > 0) {
        // Send to specific users
        targetUserIds = userIds;
    } else if (role) {
        // Send to all users with a specific role
        const users = await prisma.user.findMany({
            where: { role: role as UserRole, isActive: true },
            select: { id: true },
        });
        targetUserIds = users.map((u) => u.id);
    } else {
        throw ApiError.badRequest('Either userIds or role must be provided');
    }

    // Create notifications
    const notifications = await prisma.notification.createMany({
        data: targetUserIds.map((userId) => ({
            userId,
            title,
            message,
            type,
            link,
        })),
    });

    res.status(201).json({
        success: true,
        message: `Notification sent to ${notifications.count} users`,
        data: { count: notifications.count },
    });
});

/**
 * @route   POST /api/admin/notifications/deadline-reminders
 * @desc    Send deadline reminder notifications
 * @access  Private/Admin
 */
export const sendDeadlineReminders = asyncHandler(async (req: Request, res: Response) => {
    const { daysBeforeDeadline = 7 } = req.body;

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + daysBeforeDeadline);

    // Find scholarships with upcoming deadlines
    const upcomingScholarships = await prisma.scholarship.findMany({
        where: {
            status: 'APPROVED',
            deadline: {
                gte: new Date(),
                lte: deadlineDate,
            },
        },
        include: {
            savedBy: {
                select: { userId: true },
            },
        },
    });

    let notificationsSent = 0;

    for (const scholarship of upcomingScholarships) {
        const userIds = scholarship.savedBy.map((s) => s.userId);

        if (userIds.length > 0) {
            await prisma.notification.createMany({
                data: userIds.map((userId) => ({
                    userId,
                    title: 'Deadline Reminder',
                    message: `The deadline for "${scholarship.title}" is approaching (${scholarship.deadline.toLocaleDateString()}).`,
                    type: 'deadline_reminder',
                    link: `/scholarships/${scholarship.id}`,
                })),
            });
            notificationsSent += userIds.length;
        }
    }

    res.json({
        success: true,
        message: `Sent ${notificationsSent} deadline reminders for ${upcomingScholarships.length} scholarships`,
    });
});
