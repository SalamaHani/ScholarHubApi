import { Router } from "express";
import authRoutes from "./auth.routes.js";
import professorRoutes from "./professor.routes.js";
import userRoutes from "./user.routes.js";
import scholarshipRoutes from "./scholarship.routes.js";
import applicationRoutes from "./application.routes.js";
import categoryRoutes from "./category.routes.js";
import savedRoutes from "./saved.routes.js";
import notificationRoutes from "./notification.routes.js";
import testimonialRoutes from "./testimonial.routes.js";
import documentRoutes from "./document.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "ScholarHub API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
// ==================== PROJECT ROUTES ====================
// GET    /api/health                          - Health check
// POST   /api/auth/register                   - User registration
// POST   /api/auth/login                      - User login
// POST   /api/auth/logout                     - User logout
// POST   /api/auth/refresh-token              - Refresh access token
// POST   /api/auth/forgot-password            - Request password reset
// POST   /api/auth/reset-password             - Reset password
// POST   /api/auth/verify-email               - Verify email
//
// GET    /api/users/profile                   - Get current user profile
// PUT    /api/users/profile                   - Update user profile (with avatar upload)
// PUT    /api/users/change-password           - Change password
// GET    /api/users                           - Get all users (Admin)
// GET    /api/users/:id                       - Get user by ID (Admin)
// PUT    /api/users/:id/block                 - Block/unblock user (Admin)
// PUT    /api/users/:id/verify-professor      - Verify professor (Admin)
// DELETE /api/users/:id                       - Delete user (Admin)
//
// POST   /api/scholarships                    - Create scholarship
// GET    /api/scholarships                    - Get all scholarships (with filters)
// GET    /api/scholarships/:id                - Get scholarship by ID
// PUT    /api/scholarships/:id                - Update scholarship
// DELETE /api/scholarships/:id                - Delete scholarship
// GET    /api/scholarships/:id/applications   - Get scholarship applications
//
// POST   /api/applications                    - Create application
// GET    /api/applications                    - Get user applications
// GET    /api/applications/:id                - Get application by ID
// PUT    /api/applications/:id                - Update application
// PUT    /api/applications/:id/evaluate       - Evaluate application (Admin/Professor)
// DELETE /api/applications/:id                - Delete application
//
// GET    /api/categories                      - Get all categories
// POST   /api/categories                      - Create category (Admin)
// PUT    /api/categories/:id                  - Update category (Admin)
// DELETE /api/categories/:id                  - Delete category (Admin)
//
// POST   /api/saved                           - Save scholarship
// GET    /api/saved                           - Get saved scholarships
// DELETE /api/saved/:scholarshipId            - Remove saved scholarship
//
// GET    /api/notifications                   - Get notifications
// PUT    /api/notifications/:id/read          - Mark notification as read
// DELETE /api/notifications/:id               - Delete notification
//
// GET    /api/testimonials                    - Get all testimonials
// GET    /api/testimonials/:id                - Get testimonial by ID
// POST   /api/testimonials                    - Create testimonial (Professor/Admin)
// PUT    /api/testimonials/:id                - Update testimonial (Professor/Admin)
// DELETE /api/testimonials/:id                - Delete testimonial (Professor/Admin)
// GET    /api/testimonials/professor/:professorId - Get testimonials by professor

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/scholarships", scholarshipRoutes);
router.use("/applications", applicationRoutes);
router.use("/categories", categoryRoutes);
router.use("/saved", savedRoutes);
router.use("/notifications", notificationRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/documents", documentRoutes);
router.use("/professor", professorRoutes);
router.use("/settings", settingsRoutes);
router.use("/profile", userRoutes);
router.use("/avatar", userRoutes);

export default router;
