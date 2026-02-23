import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';

/**
 * @route   POST /api/contact-messages
 * @desc    Submit a contact message (public)
 * @access  Public
 */
export const createContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  const contactMessage = await prisma.contactMessage.create({
    data: { name, email, subject, message },
  });

  res.status(201).json({
    success: true,
    message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.',
    data: { contactMessage },
  });
});

/**
 * @route   GET /api/contact-messages
 * @desc    Get all contact messages (Admin)
 * @access  Private/Admin
 */
export const getAllContactMessages = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip  = (page - 1) * limit;

  const isRead = req.query.isRead !== undefined
    ? req.query.isRead === 'true'
    : undefined;

  const where = isRead !== undefined ? { isRead } : {};

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      messages,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
});

/**
 * @route   GET /api/contact-messages/:id
 * @desc    Get a single contact message by ID (Admin)
 * @access  Private/Admin
 */
export const getContactMessageById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) {
    throw ApiError.notFound('Contact message not found');
  }

  // Auto-mark as read when opened
  if (!message.isRead) {
    await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }

  res.json({ success: true, data: { message } });
});

/**
 * @route   PUT /api/contact-messages/:id/read
 * @desc    Mark a contact message as read/unread (Admin)
 * @access  Private/Admin
 */
export const markContactMessageRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const isRead: boolean = req.body.isRead !== false;

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('Contact message not found');
  }

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { isRead },
  });

  res.json({ success: true, message: 'Message updated', data: { message } });
});

/**
 * @route   DELETE /api/contact-messages/:id
 * @desc    Delete a contact message (Admin)
 * @access  Private/Admin
 */
export const deleteContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('Contact message not found');
  }

  await prisma.contactMessage.delete({ where: { id } });

  res.json({ success: true, message: 'Contact message deleted successfully' });
});
