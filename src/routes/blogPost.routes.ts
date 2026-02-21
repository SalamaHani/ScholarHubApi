import { Router } from "express";
import {
  getAllBlogPosts,
  getAllBlogPostsAdmin,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../controllers/blogPost.controller.js";
import {
  authenticate,
  isAdmin,
  validate,
  idParamValidator,
  createBlogPostValidator,
  updateBlogPostValidator,
} from "../middleware/index.js";

const router = Router();

// ==================== ADMIN ROUTES (must be before /:slug) ====================

/**
 * @route   GET /api/blog-posts/admin/all
 * @desc    Get all blog posts regardless of status (Admin only)
 */
router.get("/admin/all", authenticate, isAdmin, getAllBlogPostsAdmin);

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/blog-posts
 * @desc    Get all published blog posts (optional ?tag=, ?limit=, ?offset=)
 */
router.get("/", getAllBlogPosts);

/**
 * @route   GET /api/blog-posts/:slug
 * @desc    Get a published blog post by slug
 */
router.get("/:slug", getBlogPostBySlug);

// ==================== ADMIN MUTATION ROUTES ====================

/**
 * @route   POST /api/blog-posts
 * @desc    Create a new blog post (Admin only)
 */
router.post("/", authenticate, isAdmin, createBlogPostValidator, validate, createBlogPost);

/**
 * @route   PUT /api/blog-posts/:id
 * @desc    Update a blog post (Admin only)
 */
router.put("/:id", authenticate, isAdmin, idParamValidator, updateBlogPostValidator, validate, updateBlogPost);

/**
 * @route   DELETE /api/blog-posts/:id
 * @desc    Delete a blog post (Admin only)
 */
router.delete("/:id", authenticate, isAdmin, idParamValidator, validate, deleteBlogPost);

export default router;
