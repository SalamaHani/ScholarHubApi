import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';

// Helper to generate slug
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const { includeCount } = req.query;

    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: includeCount === 'true' ? {
            _count: { select: { scholarships: true } },
        } : undefined,
    });

    res.json({
        success: true,
        data: { categories },
    });
});

/**
 * @route   GET /api/categories/:slug
 * @desc    Get category by slug
 * @access  Public
 */
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
        where: { slug },
        include: {
            _count: { select: { scholarships: true } },
        },
    });

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    res.json({
        success: true,
        data: { category },
    });
});

// ==================== ADMIN CATEGORY MANAGEMENT ====================

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories including inactive (Admin only)
 * @access  Private/Admin
 */
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { scholarships: true } },
        },
    });

    res.json({
        success: true,
        data: { categories },
    });
});

/**
 * @route   POST /api/admin/categories
 * @desc    Create a new category (Admin only)
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, icon, color } = req.body;

    const slug = generateSlug(name);

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
        where: {
            OR: [{ name }, { slug }],
        },
    });

    if (existingCategory) {
        throw ApiError.conflict('Category with this name already exists');
    }

    const category = await prisma.category.create({
        data: {
            name,
            slug,
            description,
            icon,
            color,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category },
    });
});

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update a category (Admin only)
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, icon, color, isActive } = req.body;

    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    const updateData: any = {};
    if (name) {
        updateData.name = name;
        updateData.slug = generateSlug(name);
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await prisma.category.update({
        where: { id },
        data: updateData,
    });

    res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category: updatedCategory },
    });
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete a category (Admin only)
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { scholarships: true } } },
    });

    if (!category) {
        throw ApiError.notFound('Category not found');
    }

    if (category._count.scholarships > 0) {
        throw ApiError.badRequest(
            `Cannot delete category with ${category._count.scholarships} scholarships. Remove scholarships first or deactivate the category.`
        );
    }

    await prisma.category.delete({ where: { id } });

    res.json({
        success: true,
        message: 'Category deleted successfully',
    });
});
