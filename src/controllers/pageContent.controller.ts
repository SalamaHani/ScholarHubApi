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
  const where: { isActive: boolean; section?: string } = { isActive: true };
  if (section && typeof section === 'string') where.section = section;

  const content = await prisma.pageContent.findMany({
    where,
    orderBy: { pageKey: 'asc' },
  });

  res.json({ success: true, data: { content } });
});

/**
 * @route   GET /api/page-content/:pageKey
 * @desc    Get a single page content entry by pageKey or id
 * @access  Public
 */
export const getPageContentByKey = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey } = req.params;

  const content = await prisma.pageContent.findFirst({
    where: { OR: [{ pageKey }, { id: pageKey }] },
  });
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
 * @desc    Update a page content entry by pageKey or id
 * @access  Private/Admin
 */
export const updatePageContent = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey } = req.params;
  const { section, title, subtitle, description, heroText, ctaLabel, ctaLink, metaData, isActive } = req.body;

  const existing = await prisma.pageContent.findFirst({
    where: { OR: [{ pageKey }, { id: pageKey }] },
  });
  if (!existing) {
    throw ApiError.notFound(`Page content for key "${pageKey}" not found`);
  }

  const content = await prisma.pageContent.update({
    where: { id: existing.id },
    data: {
      ...(section !== undefined      && { section }),
      ...(title !== undefined        && { title }),
      ...(subtitle !== undefined     && { subtitle }),
      ...(description !== undefined  && { description }),
      ...(heroText !== undefined     && { heroText }),
      ...(ctaLabel !== undefined     && { ctaLabel }),
      ...(ctaLink !== undefined      && { ctaLink }),
      ...(metaData !== undefined     && { metaData }),
      ...(isActive !== undefined     && { isActive: Boolean(isActive) }),
    },
  });

  res.json({
    success: true,
    message: 'Page content updated successfully',
    data: { content },
  });
});

/**
 * @route   DELETE /api/page-content/:pageKey
 * @desc    Delete a page content entry by pageKey or id
 * @access  Private/Admin
 */
export const deletePageContent = asyncHandler(async (req: Request, res: Response) => {
  const { pageKey } = req.params;

  const existing = await prisma.pageContent.findFirst({
    where: { OR: [{ pageKey }, { id: pageKey }] },
  });
  if (!existing) {
    throw ApiError.notFound(`Page content for key "${pageKey}" not found`);
  }

  await prisma.pageContent.delete({ where: { id: existing.id } });

  res.json({ success: true, message: 'Page content deleted successfully' });
});
