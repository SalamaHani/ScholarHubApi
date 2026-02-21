import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';

/**
 * @route   GET /api/faq-items
 * @desc    Get all active FAQ items (optional ?pageKey= filter)
 * @access  Public
 */
export const getAllFaqItems = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey } = req.query;

  const where: Record<string, unknown> = { isActive: true };
  if (pageKey) where.pageKey = pageKey;

  const faqItems = await prisma.faqItem.findMany({
    where,
    orderBy: [{ pageKey: 'asc' }, { order: 'asc' }],
  });

  res.json({ success: true, data: { faqItems } });
});

/**
 * @route   GET /api/faq-items/:id
 * @desc    Get a single FAQ item by ID
 * @access  Public
 */
export const getFaqItemById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const faqItem = await prisma.faqItem.findUnique({ where: { id } });
  if (!faqItem) {
    throw ApiError.notFound('FAQ item not found');
  }

  res.json({ success: true, data: { faqItem } });
});

/**
 * @route   POST /api/faq-items
 * @desc    Create a new FAQ item
 * @access  Private/Admin
 */
export const createFaqItem = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey, question, answer, order } = req.body;

  const faqItem = await prisma.faqItem.create({
    data: {
      pageKey,
      question,
      answer,
      order: order ?? 0,
    },
  });

  res.status(201).json({
    success: true,
    message: 'FAQ item created successfully',
    data: { faqItem },
  });
});

/**
 * @route   PUT /api/faq-items/:id
 * @desc    Update a FAQ item by ID
 * @access  Private/Admin
 */
export const updateFaqItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { pageKey, question, answer, order, isActive } = req.body;

  const existing = await prisma.faqItem.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('FAQ item not found');
  }

  const updateData: Record<string, unknown> = {};
  if (pageKey !== undefined)   updateData.pageKey = pageKey;
  if (question !== undefined)  updateData.question = question;
  if (answer !== undefined)    updateData.answer = answer;
  if (order !== undefined)     updateData.order = order;
  if (isActive !== undefined)  updateData.isActive = isActive;

  const faqItem = await prisma.faqItem.update({ where: { id }, data: updateData });

  res.json({
    success: true,
    message: 'FAQ item updated successfully',
    data: { faqItem },
  });
});

/**
 * @route   DELETE /api/faq-items/:id
 * @desc    Delete a FAQ item by ID
 * @access  Private/Admin
 */
export const deleteFaqItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.faqItem.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('FAQ item not found');
  }

  await prisma.faqItem.delete({ where: { id } });

  res.json({ success: true, message: 'FAQ item deleted successfully' });
});
