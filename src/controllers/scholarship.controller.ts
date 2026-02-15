import { Request, Response } from "express";
import { ScholarshipStatus, UserRole, Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../utils/index.js";
import config from "../config/index.js";
import { sendPushNotification } from "../services/pusher.service.js";

/**
 * @route   POST /api/scholarships
 * @desc    Create a new scholarship (Professor only)
 * @access  Private/Professor
 */
export const createScholarship = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if professor is verified
    if (userRole === UserRole.PROFESSOR) {
      const profile = await prisma.professorProfile.findUnique({
        where: { userId },
      });

      if (!profile?.isVerified) {
        throw ApiError.forbidden(
          "Your professor account must be verified before posting scholarships",
        );
      }
    }

    const {
      title,
      description,
      organization,
      country,
      region,
      fieldOfStudy,
      degreeLevel,
      fundingType,
      amount,
      currency,
      deadline,
      startDate,
      duration,
      applicationLink,
      requirements,
      eligibility,
      benefits,
      documents,
      language,
      studyMode,
      categoryIds,
      questions,
    } = req.body;

    // Create scholarship
    const scholarship = await prisma.scholarship.create({
      data: {
        title,
        description,
        organization,
        country,
        region,
        fieldOfStudy,
        degreeLevel,
        fundingType,
        amount,
        currency,
        deadline: new Date(deadline),
        startDate: startDate ? new Date(startDate) : null,
        duration,
        language,
        studyMode,
        applicationLink,
        requirements,
        eligibility,
        benefits,
        documents: documents || [],
        status:
          userRole === UserRole.ADMIN
            ? ScholarshipStatus.APPROVED
            : ScholarshipStatus.PENDING_APPROVAL,
        createdById: userId,
        approvedById: userId,
        approvedAt: new Date(),
        categories: Array.isArray(categoryIds) && categoryIds.length > 0
          ? {
            create: categoryIds.map((categoryId: string) => ({
              categoryId,
            })),
          }
          : undefined,
        questions: Array.isArray(questions) && questions.length > 0
          ? {
            create: questions.map((q: any) => ({
              question: q.question,
              type: q.type || "TEXT",
              options: Array.isArray(q.options) ? q.options : [],
            })),
          }
          : undefined,
      } as any,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        categories: {
          include: { category: true },
        },
        questions: true,
      } as any,
    });

    res.status(201).json({
      success: true,
      message:
        userRole === UserRole.ADMIN
          ? "Scholarship created and approved"
          : "Scholarship submitted for approval",
      data: { scholarship },
    });
  },
);

/**
 * @route   GET /api/scholarships
 * @desc    Get all scholarships with filters
 * @access  Public
 */
export const getScholarships = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 20,
      search,
      country,
      degreeLevel,
      fundingType,
      category,
      status,
      featured,
      language,
      studyMode,
      sortBy = "deadline",
      sortOrder = "asc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ScholarshipWhereInput = {};

    // Get user role from Authorization header
    let userRole: string | null = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        userRole = decoded.role;
      } catch (error) {
        // Token is invalid or expired, treat as unauthenticated
        userRole = null;
      }
    }

    // Admin sees all statuses, others see only approved
    const isAdmin = userRole === UserRole.ADMIN;

    // Set status filter
    if (!isAdmin) {
      where.status = status
        ? (status as ScholarshipStatus)
        : ScholarshipStatus.APPROVED;
    } else if (status) {
      where.status = status as ScholarshipStatus;
    }

    // Deadline filtering only for non-admin users
    if (!isAdmin) {
      // If open=true, only show non-expired scholarships
      // If open=false, only show expired scholarships
      if (req.query.open === "true") {
        where.deadline = { gte: new Date() };
      } else if (req.query.open === "false") {
        where.deadline = { lt: new Date() };
      } else {
        // Default to showing only open scholarships if status is APPROVED (typical for students)
        if (!status || status === ScholarshipStatus.APPROVED) {
          where.deadline = { gte: new Date() };
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { organization: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (country) {
      where.country = { equals: country as string, mode: "insensitive" };
    }

    if (degreeLevel) {
      where.degreeLevel = { has: degreeLevel as any };
    }

    if (fundingType) {
      where.fundingType = fundingType as any;
    }

    if (category) {
      where.categories = {
        some: {
          category: { slug: category as string },
        },
      };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (language) {
      where.language = { equals: language as string, mode: "insensitive" };
    }

    if (studyMode) {
      where.studyMode = { equals: studyMode as string, mode: "insensitive" };
    }

    // Build orderBy
    const orderBy: Prisma.ScholarshipOrderByWithRelationInput = {};
    if (sortBy === "deadline") {
      orderBy.deadline = sortOrder as "asc" | "desc";
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder as "asc" | "desc";
    } else if (sortBy === "views") {
      orderBy.views = sortOrder as "asc" | "desc";
    }

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          categories: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
          _count: { select: { applications: true } },
        },
      }),
      prisma.scholarship.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        scholarships,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

/**
 * @route   GET /api/scholarships/:id
 * @desc    Get scholarship by ID
 * @access  Public
 */
export const getScholarshipById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        categories: {
          include: { category: true },
        },
        questions: true,
        _count: { select: { applications: true, savedBy: true } },
      } as any,
    });

    if (!scholarship) {
      throw ApiError.notFound("Scholarship not found");
    }

    // Only allow viewing approved scholarships for non-authenticated or regular users
    if (scholarship.status !== ScholarshipStatus.APPROVED) {
      if (
        !req.user ||
        (req.user.role !== UserRole.ADMIN &&
          req.user.id !== scholarship.createdById)
      ) {
        throw ApiError.notFound("Scholarship not found");
      }
    }

    // Increment views
    await prisma.scholarship.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: { scholarship },
    });
  },
);

/**
 * @route   PUT /api/scholarships/:id
 * @desc    Update scholarship
 * @access  Private/Professor or Admin
 */
export const updateScholarship = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    if (userRole === UserRole.PROFESSOR) {
      const profile = await prisma.professorProfile.findUnique({
        where: { userId },
      });
      if (!profile?.isVerified) {
        throw ApiError.forbidden(
          "Your professor account must be verified before posting scholarships",
        );
      }
    }

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
    });

    if (!scholarship) {
      throw ApiError.notFound("Scholarship not found");
    }

    // Check permission
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.PROFESSOR &&
      scholarship.createdById !== userId
    ) {
      throw ApiError.forbidden("Not authorized to update this scholarship");
    }

    const {
      title,
      description,
      organization,
      country,
      region,
      fieldOfStudy,
      degreeLevel,
      fundingType,
      amount,
      currency,
      deadline,
      startDate,
      duration,
      language,
      studyMode,
      applicationLink,
      requirements,
      eligibility,
      benefits,
      documents,
      categoryIds,
      questions,
    } = req.body;

    // Build update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (organization) updateData.organization = organization;
    if (country) updateData.country = country;
    if (region !== undefined) updateData.region = region;
    if (fieldOfStudy) updateData.fieldOfStudy = fieldOfStudy;
    if (degreeLevel) updateData.degreeLevel = degreeLevel;
    if (fundingType) updateData.fundingType = fundingType;
    if (amount !== undefined) updateData.amount = amount;
    if (currency) updateData.currency = currency;
    if (deadline) updateData.deadline = new Date(deadline);
    if (startDate) updateData.startDate = new Date(startDate);
    if (duration) updateData.duration = duration;
    if (language) updateData.language = language;
    if (studyMode) updateData.studyMode = studyMode;
    if (applicationLink) updateData.applicationLink = applicationLink;
    if (requirements) updateData.requirements = requirements;
    if (eligibility) updateData.eligibility = eligibility;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (documents) updateData.documents = documents;

    // Update categories if provided
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      // Delete existing categories
      await prisma.categoryOnScholarship.deleteMany({
        where: { scholarshipId: id },
      });

      // Add new categories
      updateData.categories = {
        create: categoryIds.map((categoryId: string) => ({ categoryId })),
      };
    }

    // Update questions if provided
    if (Array.isArray(questions) && questions.length > 0) {
      // Delete existing questions
      await (prisma as any).scholarshipQuestion.deleteMany({
        where: { scholarshipId: id },
      });

      // Add new questions
      (updateData as any).questions = {
        create: questions.map((q: any) => ({
          question: q.question,
          type: q.type || "TEXT",
          options: Array.isArray(q.options) ? q.options : [],
        })),
      };
    }

    const updatedScholarship = await prisma.scholarship.update({
      where: { id },
      data: updateData,
      include: {
        categories: { include: { category: true } },
        questions: true,
      } as any,
    });

    res.json({
      success: true,
      message: "Scholarship updated successfully",
      data: { scholarship: updatedScholarship },
    });
  },
);

/**
 * @route   DELETE /api/scholarships/:id
 * @desc    Delete scholarship
 * @access  Private/Professor or Admin
 */
export const deleteScholarship = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole === UserRole.PROFESSOR) {
      const profile = await prisma.professorProfile.findUnique({
        where: { userId },
      });

      if (!profile?.isVerified) {
        throw ApiError.forbidden(
          "Your professor account must be verified before posting scholarships",
        );
      }
    }

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
    });

    if (!scholarship) {
      throw ApiError.notFound("Scholarship not found");
    }

    // Check permission
    if (userRole !== UserRole.ADMIN && scholarship.createdById !== userId) {
      throw ApiError.forbidden("Not authorized to delete this scholarship");
    }

    await prisma.scholarship.delete({ where: { id } });

    res.json({
      success: true,
      message: "Scholarship deleted successfully",
    });
  },
);

// ==================== PROFESSOR SCHOLARSHIP MANAGEMENT ====================

/**
 * @route   GET /api/professor/scholarships
 * @desc    Get professor's own scholarships
 * @access  Private/Professor
 */
export const getProfessorScholarships = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, userId } = req.query;
    const currentUserId = req.user!.id;
    const userRole = req.user!.role;

    const skip = (Number(page) - 1) * Number(limit);

    // If a userId is provided in query, use it (typically for Admin or for checking another professor)
    // Otherwise use current user's ID
    const targetUserId = (userId as string) || currentUserId;

    // Verify the target user is a professor
    if (userId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { role: true },
      });

      if (!targetUser || targetUser.role !== UserRole.PROFESSOR) {
        throw ApiError.badRequest("Scholarships can only be retrieved for professors");
      }

      // If viewing someone else's scholarships, must be an Admin
      if (targetUserId !== currentUserId && userRole !== UserRole.ADMIN) {
        throw ApiError.forbidden(
          "You are not authorized to view another professor's scholarships",
        );
      }
    }

    const where: Prisma.ScholarshipWhereInput = { createdById: targetUserId };
    if (status) {
      where.status = status as ScholarshipStatus;
    }

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          categories: { include: { category: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.scholarship.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        scholarships,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

// ==================== ADMIN SCHOLARSHIP MANAGEMENT ====================

/**
 * @route   GET /api/admin/scholarships/pending
 * @desc    Get pending scholarships for approval
 * @access  Private/Admin
 */
export const getPendingScholarships = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { status: ScholarshipStatus.PENDING_APPROVAL };

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "asc" },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          categories: { include: { category: true } },
        },
      }),
      prisma.scholarship.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        scholarships,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

/**
 * @route   PUT /api/admin/scholarships/:id/approve
 * @desc    Approve a scholarship
 * @access  Private/Admin
 */
export const approveScholarship = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user!.id;

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!scholarship) {
      throw ApiError.notFound("Scholarship not found");
    }

    if (scholarship.status !== ScholarshipStatus.PENDING_APPROVAL) {
      throw ApiError.badRequest("Scholarship is not pending approval");
    }

    await prisma.scholarship.update({
      where: { id },
      data: {
        status: ScholarshipStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
    });

    // Notify professor
    await prisma.notification.create({
      data: {
        userId: scholarship.createdById,
        title: "Scholarship Approved",
        message: `Your scholarship "${scholarship.title}" has been approved and is now live.`,
        type: "scholarship_approved",
        link: `/scholarships/${id}`,
      },
    });

    res.json({
      success: true,
      message: "Scholarship approved successfully",
    });
  },
);

/**
 * @route   PUT /api/admin/scholarships/:id/reject
 * @desc    Reject a scholarship
 * @access  Private/Admin
 */
export const rejectScholarship = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!scholarship) {
      throw ApiError.notFound("Scholarship not found");
    }

    await prisma.scholarship.update({
      where: { id },
      data: {
        status: ScholarshipStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    // Notify professor
    await prisma.notification.create({
      data: {
        userId: scholarship.createdById,
        title: "Scholarship Rejected",
        message: `Your scholarship "${scholarship.title
          }" was not approved. Reason: ${reason || "Not specified"}`,
        type: "scholarship_rejected",
        link: `/dashboard/scholarships/${id}`,
      },
    });

    res.json({
      success: true,
      message: "Scholarship rejected",
    });
  },
);

/**
 * @route   GET /api/admin/scholarships
 * @desc    Get all scholarships (admin view with advanced filters)
 * @access  Private/Admin
 */
export const getAllScholarshipsAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 20,
      search,
      country,
      degreeLevel,
      fundingType,
      category,
      status,
      featured,
      language,
      studyMode,
      createdBy,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause with all filters
    const where: Prisma.ScholarshipWhereInput = {};

    // Filter by status
    if (status) {
      where.status = status as ScholarshipStatus;
    }

    // Filter by search term (title, description, organization)
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { organization: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Filter by country
    if (country) {
      where.country = { equals: country as string, mode: "insensitive" };
    }

    // Filter by degree level
    if (degreeLevel) {
      where.degreeLevel = { has: degreeLevel as any };
    }

    // Filter by funding type
    if (fundingType) {
      where.fundingType = fundingType as any;
    }

    // Filter by category
    if (category) {
      where.categories = {
        some: {
          category: { slug: category as string },
        },
      };
    }

    // Filter by featured
    if (featured === "true") {
      where.isFeatured = true;
    } else if (featured === "false") {
      where.isFeatured = false;
    }

    // Filter by language
    if (language) {
      where.language = { equals: language as string, mode: "insensitive" };
    }

    // Filter by study mode
    if (studyMode) {
      where.studyMode = { equals: studyMode as string, mode: "insensitive" };
    }

    // Filter by creator
    if (createdBy) {
      where.createdById = createdBy as string;
    }

    // Build orderBy with multiple sort options
    const orderBy: Prisma.ScholarshipOrderByWithRelationInput = {};
    if (sortBy === "deadline") {
      orderBy.deadline = sortOrder as "asc" | "desc";
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder as "asc" | "desc";
    } else if (sortBy === "views") {
      orderBy.views = sortOrder as "asc" | "desc";
    } else if (sortBy === "amount") {
      orderBy.amount = sortOrder as "asc" | "desc";
    }

    // Get total count and scholarships
    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          categories: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
          _count: {
            select: {
              applications: true,
              savedBy: true,
            },
          },
        },
      }),
      prisma.scholarship.count({ where }),
    ]);

    // Calculate statistics
    const stats = await prisma.scholarship.aggregate({
      where,
      _count: true,
      _sum: { amount: true },
      _avg: { views: true },
    });

    res.json({
      success: true,
      data: {
        scholarships,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
          hasMore: skip + Number(limit) < total,
        },
        stats: {
          totalCount: stats._count,
          totalFunding: stats._sum.amount || 0,
          averageViews: Math.round(stats._avg.views || 0),
        },
      },
    });
  },
);

/**
 * @route   PUT /api/admin/scholarships/:id/feature
 * @desc    Toggle featured status
 * @access  Private/Admin
 */
export const toggleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { featured } = req.body;

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: { isFeatured: featured },
      select: { id: true, title: true, isFeatured: true },
    });

    res.json({
      success: true,
      message: featured ? "Scholarship featured" : "Scholarship unfeatured",
      data: { scholarship },
    });
  },
);
