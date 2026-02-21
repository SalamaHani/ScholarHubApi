import { Request, Response } from 'express';
import { BlogPostStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';

const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

/**
 * @route   GET /api/blog-posts
 * @desc    Get all published blog posts with optional pagination and tag filter
 * @access  Public
 */
export const getAllBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10, offset = 0, tag } = req.query;

  const where: Record<string, unknown> = { status: BlogPostStatus.PUBLISHED };
  if (tag) where.tags = { has: tag as string };

  const [blogPosts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        authorName: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({ success: true, data: { blogPosts, total } });
});

/**
 * @route   GET /api/blog-posts/admin/all
 * @desc    Get all blog posts regardless of status
 * @access  Private/Admin
 */
export const getAllBlogPostsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 20, offset = 0, status } = req.query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [blogPosts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({ success: true, data: { blogPosts, total } });
});

/**
 * @route   GET /api/blog-posts/:slug
 * @desc    Get a single published blog post by slug
 * @access  Public
 */
export const getBlogPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const blogPost = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });

  if (!blogPost || blogPost.status !== BlogPostStatus.PUBLISHED) {
    throw ApiError.notFound('Blog post not found');
  }

  res.json({ success: true, data: { blogPost } });
});

/**
 * @route   POST /api/blog-posts
 * @desc    Create a new blog post
 * @access  Private/Admin
 */
export const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, excerpt, content, coverImage, tags, status, publishedAt } = req.body;
  const authorId = req.user!.id;
  const authorName = `${req.user!.firstName} ${req.user!.lastName}`;

  const slug = generateSlug(title);

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    throw ApiError.conflict('A blog post with this title already exists');
  }

  const resolvedStatus: BlogPostStatus = status ?? BlogPostStatus.DRAFT;
  const resolvedPublishedAt =
    resolvedStatus === BlogPostStatus.PUBLISHED
      ? (publishedAt ? new Date(publishedAt) : new Date())
      : null;

  const blogPost = await prisma.blogPost.create({
    data: {
      slug,
      title,
      excerpt: excerpt ?? null,
      content,
      coverImage: coverImage ?? null,
      authorName,
      authorId,
      tags: tags ?? [],
      status: resolvedStatus,
      publishedAt: resolvedPublishedAt,
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Blog post created successfully',
    data: { blogPost },
  });
});

/**
 * @route   PUT /api/blog-posts/:id
 * @desc    Update a blog post by ID
 * @access  Private/Admin
 */
export const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, excerpt, content, coverImage, tags, status, publishedAt } = req.body;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('Blog post not found');
  }

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) {
    updateData.title = title;
    updateData.slug = generateSlug(title);
  }
  if (excerpt !== undefined)    updateData.excerpt = excerpt;
  if (content !== undefined)    updateData.content = content;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (tags !== undefined)       updateData.tags = tags;
  if (status !== undefined) {
    updateData.status = status;
    if (status === BlogPostStatus.PUBLISHED && !existing.publishedAt) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
    }
  }

  const blogPost = await prisma.blogPost.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });

  res.json({
    success: true,
    message: 'Blog post updated successfully',
    data: { blogPost },
  });
});

/**
 * @route   DELETE /api/blog-posts/:id
 * @desc    Delete a blog post by ID
 * @access  Private/Admin
 */
export const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('Blog post not found');
  }

  await prisma.blogPost.delete({ where: { id } });

  res.json({ success: true, message: 'Blog post deleted successfully' });
});
