import { Router } from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    sendDeadlineReminders,
} from '../controllers/index.js';
import { authenticate, isAdmin, validate, idParamValidator, paginationValidator } from '../middleware/index.js';

const router = Router();

// ==================== USER ROUTES ====================

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 */
router.get('/', authenticate, paginationValidator, validate, getNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 */
router.put('/:id/read', authenticate, idParamValidator, validate, markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all as read
 */
router.put('/read-all', authenticate, markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 */
router.delete('/:id', authenticate, idParamValidator, validate, deleteNotification);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/notifications/admin/send
 * @desc    Send notification to users
 */
router.post('/admin/send', authenticate, isAdmin, sendNotification);

/**
 * @route   POST /api/notifications/admin/deadline-reminders
 * @desc    Send deadline reminder notifications
 */
router.post('/admin/deadline-reminders', authenticate, isAdmin, sendDeadlineReminders);

export default router;
