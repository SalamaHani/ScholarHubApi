import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../utils/index.js";

/**
 * @route   GET /api/testimonials
 * @desc    Get all testimonials
 * @access  Public
 */
export const getAllTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = 10, offset = 0 } = req.query;

    const testimonials = await prisma.testimonial.findMany({
      take: Number(limit),
      skip: Number(offset),
      select: {
        id: true,
        quote: true,
        author: true,
        role: true,
        image: true,
        gradient: true,
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.testimonial.count();

    res.json({
      success: true,
      data: { testimonials, total },
    });
  }
);

/**
 * @route   GET /api/testimonials/:id
 * @desc    Get testimonial by ID
 * @access  Public
 */
export const getTestimonialById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      select: {
        id: true,
        quote: true,
        author: true,
        role: true,
        image: true,
        gradient: true,
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!testimonial) {
      throw ApiError.notFound("Testimonial not found");
    }

    res.json({
      success: true,
      data: { testimonial },
    });
  }
);

/**
 * @route   POST /api/testimonials
 * @desc    Create a new testimonial (Professor only)
 * @access  Private/Professor
 */
export const createTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { quote, author, role, image, gradient } = req.body;
    const professorId = req.user!.id;

    // Validate required fields
    if (!quote || !author || !role) {
      throw ApiError.badRequest("Quote, author, and role are required");
    }

    // Verify professor profile exists
    const professor = await prisma.user.findUnique({
      where: { id: professorId },
      include: { professorProfile: true },
    });

    if (!professor || professor.role !== UserRole.PROFESSOR) {
      throw ApiError.forbidden("Only professors can create testimonials");
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        quote,
        author,
        role,
        image: image || null,
        gradient: gradient || "from-blue-400 to-indigo-600",
        createdBy: professorId,
      },
      select: {
        id: true,
        quote: true,
        author: true,
        role: true,
        image: true,
        gradient: true,
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: { testimonial },
    });
  }
);

/**
 * @route   PUT /api/testimonials/:id
 * @desc    Update testimonial (Professor owner or Admin)
 * @access  Private/Professor/Admin
 */
export const updateTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quote, author, role, image, gradient } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw ApiError.notFound("Testimonial not found");
    }

    // Check authorization - only creator or admin can update
    if (
      testimonial.createdBy !== userId &&
      userRole !== UserRole.ADMIN
    ) {
      throw ApiError.forbidden(
        "You do not have permission to update this testimonial"
      );
    }

    const updateData: any = {};
    if (quote) updateData.quote = quote;
    if (author) updateData.author = author;
    if (role) updateData.role = role;
    if (image !== undefined) updateData.image = image;
    if (gradient) updateData.gradient = gradient;

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        quote: true,
        author: true,
        role: true,
        image: true,
        gradient: true,
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "Testimonial updated successfully",
      data: { testimonial: updatedTestimonial },
    });
  }
);

/**
 * @route   DELETE /api/testimonials/:id
 * @desc    Delete testimonial (Professor owner or Admin)
 * @access  Private/Professor/Admin
 */
export const deleteTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw ApiError.notFound("Testimonial not found");
    }

    // Check authorization - only creator or admin can delete
    if (
      testimonial.createdBy !== userId &&
      userRole !== UserRole.ADMIN
    ) {
      throw ApiError.forbidden(
        "You do not have permission to delete this testimonial"
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  }
);

/**
 * @route   GET /api/testimonials/professor/:professorId
 * @desc    Get testimonials by professor
 * @access  Public
 */
export const getTestimonialsByProfessor = asyncHandler(
  async (req: Request, res: Response) => {
    const { professorId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const testimonials = await prisma.testimonial.findMany({
      where: { createdBy: professorId },
      take: Number(limit),
      skip: Number(offset),
      select: {
        id: true,
        quote: true,
        author: true,
        role: true,
        image: true,
        gradient: true,
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.testimonial.count({
      where: { createdBy: professorId },
    });

    res.json({
      success: true,
      data: { testimonials, total },
    });
  }
);
