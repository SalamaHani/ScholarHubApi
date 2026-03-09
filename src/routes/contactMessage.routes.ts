import { Router } from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  markContactMessageRead,
  deleteContactMessage,
} from '../controllers/contactMessage.controller.js';
import {
  authenticate,
  isAdmin,
  validate,
  idParamValidator,
  createContactMessageValidator,
} from '../middleware/index.js';

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/contact-messages
 * @desc    Submit a contact message
 * @body    { name, email, subject, message }
 * @access  Public
 */
router.post('/', createContactMessageValidator, validate, createContactMessage);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/contact-messages
 * @desc    Get all contact messages (paginated, optional ?isRead=true/false)
 * @access  Private/Admin
 */
router.get('/', authenticate, isAdmin, getAllContactMessages);

/**
 * @route   GET /api/contact-messages/:id
 * @desc    Get a single contact message (auto-marks as read)
 * @access  Private/Admin
 */
router.get('/:id', authenticate, isAdmin, idParamValidator, validate, getContactMessageById);

/**
 * @route   PATCH /api/contact-messages/:id/read
 * @desc    Mark a message as read or unread
 * @body    { isRead: boolean }
 * @access  Private/Admin
 */
router.patch('/:id/read', authenticate, isAdmin, idParamValidator, validate, markContactMessageRead);

/**
 * @route   DELETE /api/contact-messages/:id
 * @desc    Delete a contact message
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, idParamValidator, validate, deleteContactMessage);

export default router;
