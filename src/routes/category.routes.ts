import { Router } from 'express';
import {
    getCategories,
    getCategoryBySlug,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/index.js';
import {
    authenticate,
    isAdmin,
    validate,
    createCategoryValidator,
    idParamValidator,
} from '../middleware/index.js';

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/categories
 * @desc    Get all active categories
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/:slug
 * @desc    Get category by slug
 */
router.get('/:slug', getCategoryBySlug);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/categories/admin/all
 * @desc    Get all categories including inactive
 */
router.get('/admin/all', authenticate, isAdmin, getAllCategories);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 */
router.post('/', authenticate, isAdmin, createCategoryValidator, validate, createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 */
router.put('/:id', authenticate, isAdmin, idParamValidator, validate, updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 */
router.delete('/:id', authenticate, isAdmin, idParamValidator, validate, deleteCategory);

export default router;
