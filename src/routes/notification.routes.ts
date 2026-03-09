import { Router } from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    sendDeadlineReminders,
    getBeamsToken,
    sendEmail,
    pusherAuth,
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

/**
 * @route   POST /api/notifications/beams-auth
 * @desc    Get Pusher Beams authentication token
 */
router.post('/beams-auth', authenticate, getBeamsToken);

/**
 * @route   POST /api/notifications/pusher/auth
 * @desc    Authenticate user for their private Pusher Channel (WebSocket)
 * @body    { socket_id: string, channel_name: string }
 */
router.post('/pusher/auth', authenticate, pusherAuth);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/notifications/admin/send
 * @route   POST /api/admin/notifications/send
 * @desc    Send notification to users (all users, professors only, students only)
 * @example Body: { "role": "STUDENT", "title": "Test", "message": "Hello", "type": "success" }
 *          Body: { "role": "PROFESSOR", "title": "Test", "message": "Hello", "type": "error" }
 *          Body: { "role": "ALL", "title": "Test", "message": "Hello", "type": "warning" }
 */
router.post('/admin/send', authenticate, isAdmin, sendNotification);
router.post('/send', authenticate, isAdmin, sendNotification);

/**
 * @route   POST /api/notifications/admin/deadline-reminders
 * @route   POST /api/admin/notifications/deadline-reminders
 * @desc    Send deadline reminder notifications
 */
router.post('/admin/deadline-reminders', authenticate, isAdmin, sendDeadlineReminders);
router.post('/deadline-reminders', authenticate, isAdmin, sendDeadlineReminders);

/**
 * @route   POST /api/admin/notifications/email
 * @desc    Send a custom email to any address (e.g. reply to a contact message)
 * @body    { to: string, subject: string, message: string, name?: string }
 * @access  Private/Admin
 */
router.post('/admin/email', authenticate, isAdmin, sendEmail);
router.post('/email', authenticate, isAdmin, sendEmail);

export default router;
