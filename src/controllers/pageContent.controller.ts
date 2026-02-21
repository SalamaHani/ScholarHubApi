import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';

/**
 * @route   GET /api/page-content
 * @desc    Get all active page content entries (optional ?section= filter)
 * @access  Public
 */
export const getAllPageContent = asyncHandler(async (req: Request, res: Response) => {
  const { section } = req.query;

  const where: Record<string, unknown> = { isActive: true };
  if (section) where.section = section;

  const content = await prisma.pageContent.findMany({
    where,
    orderBy: { pageKey: 'asc' },
  });

  res.json({ success: true, data: { content } });
});

/**
 * @route   GET /api/page-content/:pageKey
 * @desc    Get a single page content entry by its unique page key
 * @access  Public
 */
export const getPageContentByKey = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey } = req.params;

  const content = await prisma.pageContent.findUnique({ where: { pageKey } });

  if (!content) {
    throw ApiError.notFound(`Page content for key "${pageKey}" not found`);
  }

  res.json({ success: true, data: { content } });
});

/**
 * @route   POST /api/page-content
 * @desc    Create a new page content entry
 * @access  Private/Admin
 */
export const createPageContent = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey, section, title, subtitle, description, heroText, ctaLabel, ctaLink, metaData } = req.body;

  const existing = await prisma.pageContent.findUnique({ where: { pageKey } });
  if (existing) {
    throw ApiError.conflict(`Page content with key "${pageKey}" already exists`);
  }

  const content = await prisma.pageContent.create({
    data: {
      pageKey,
      section,
      title,
      subtitle: subtitle ?? null,
      description: description ?? null,
      heroText: heroText ?? null,
      ctaLabel: ctaLabel ?? null,
      ctaLink: ctaLink ?? null,
      metaData: metaData ?? null,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Page content created successfully',
    data: { content },
  });
});

/**
 * @route   PUT /api/page-content/:pageKey
 * @desc    Update a page content entry by page key
 * @access  Private/Admin
 */
export const updatePageContent = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey } = req.params;
  const { section, title, subtitle, description, heroText, ctaLabel, ctaLink, metaData, isActive } = req.body;

  const existing = await prisma.pageContent.findUnique({ where: { pageKey } });
  if (!existing) {
    throw ApiError.notFound(`Page content for key "${pageKey}" not found`);
  }

  const updateData: Record<string, unknown> = {};
  if (section !== undefined)      updateData.section = section;
  if (title !== undefined)        updateData.title = title;
  if (subtitle !== undefined)     updateData.subtitle = subtitle;
  if (description !== undefined)  updateData.description = description;
  if (heroText !== undefined)     updateData.heroText = heroText;
  if (ctaLabel !== undefined)     updateData.ctaLabel = ctaLabel;
  if (ctaLink !== undefined)      updateData.ctaLink = ctaLink;
  if (metaData !== undefined)     updateData.metaData = metaData;
  if (isActive !== undefined)     updateData.isActive = isActive;

  const content = await prisma.pageContent.update({
    where: { pageKey },
    data: updateData,
  });

  res.json({
    success: true,
    message: 'Page content updated successfully',
    data: { content },
  });
});

/**
 * @route   DELETE /api/page-content/:pageKey
 * @desc    Delete a page content entry by page key
 * @access  Private/Admin
 */
export const deletePageContent = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey } = req.params;

  const existing = await prisma.pageContent.findUnique({ where: { pageKey } });
  if (!existing) {
    throw ApiError.notFound(`Page content for key "${pageKey}" not found`);
  }

  await prisma.pageContent.delete({ where: { pageKey } });

  res.json({ success: true, message: 'Page content deleted successfully' });
});
