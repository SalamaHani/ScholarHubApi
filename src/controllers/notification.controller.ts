import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';
import {
  sendPushNotificationToUsers,
  generateBeamsToken
} from '../services/pusher.service.js';

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
 * @route   POST /api/admin/notifications/send
 * @desc    Send notification to users (Admin only)
 * @access  Private/Admin
 * @body    { userIds?: string[], role?: 'STUDENT'|'PROFESSOR'|'ADMIN'|'ALL', title: string, message: string, type?: 'success'|'error'|'warning'|'info'|'system', link?: string }
 */
export const sendNotification = asyncHandler(async (req: Request, res: Response) => {
    const { userIds, role, title, message, type = 'system', link } = req.body;

    // Validate notification type
    const validTypes = ['success', 'error', 'warning', 'info', 'system', 'waiting'];
    if (type && !validTypes.includes(type)) {
        throw ApiError.badRequest(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate required fields
    if (!title || !message) {
        throw ApiError.badRequest('Title and message are required');
    }

    let targetUserIds: string[] = [];
    let recipientDescription = '';

    if (userIds && userIds.length > 0) {
        // Send to specific users
        targetUserIds = userIds;
        recipientDescription = `${userIds.length} specific users`;
    } else if (role) {
        if (role.toUpperCase() === 'ALL') {
            // Send to ALL active users
            const users = await prisma.user.findMany({
                where: { isActive: true },
                select: { id: true },
            });
            targetUserIds = users.map((u) => u.id);
            recipientDescription = 'all users';
        } else {
            // Send to all users with a specific role
            const users = await prisma.user.findMany({
                where: { role: role as UserRole, isActive: true },
                select: { id: true },
            });
            targetUserIds = users.map((u) => u.id);
            recipientDescription = `all ${role.toLowerCase()}s`;
        }
    } else {
        throw ApiError.badRequest('Either userIds or role must be provided');
    }

    if (targetUserIds.length === 0) {
        throw ApiError.badRequest('No users found matching the criteria');
    }

    // Create notifications in database
    const notifications = await prisma.notification.createMany({
        data: targetUserIds.map((userId) => ({
            userId,
            title,
            message,
            type,
            link,
        })),
    });

    // Send push notifications via Pusher
    await sendPushNotificationToUsers(targetUserIds, {
        title,
        body: message,
        url: link,
        data: { type, notificationId: 'bulk-notification' },
    });

    res.status(201).json({
        success: true,
        message: `Notification sent to ${notifications.count} users (${recipientDescription})`,
        data: {
            count: notifications.count,
            recipients: recipientDescription,
            type
        },
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
            const notificationMessage = `The deadline for "${scholarship.title}" is approaching (${scholarship.deadline.toLocaleDateString()}).`;
            const link = `/scholarships/${scholarship.id}`;

            // Create database notifications
            await prisma.notification.createMany({
                data: userIds.map((userId) => ({
                    userId,
                    title: 'Deadline Reminder ⏰',
                    message: notificationMessage,
                    type: 'deadline_reminder',
                    link,
                })),
            });

            // Send push notifications
            await sendPushNotificationToUsers(userIds, {
                title: 'Deadline Reminder ⏰',
                body: notificationMessage,
                url: link,
                data: {
                    type: 'deadline_reminder',
                    scholarshipId: scholarship.id
                },
            });

            notificationsSent += userIds.length;
        }
    }

    res.json({
        success: true,
        message: `Sent ${notificationsSent} deadline reminders for ${upcomingScholarships.length} scholarships`,
    });
});

// ==================== PUSHER BEAMS ====================

/**
 * @route   POST /api/notifications/beams-auth
 * @desc    Generate Pusher Beams authentication token for client
 * @access  Private
 */
export const getBeamsToken = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    try {
        const beamsToken = generateBeamsToken(userId);

        res.json({
            success: true,
            data: beamsToken,
        });
    } catch (error) {
        throw ApiError.internal('Failed to generate Beams token');
    }
});
