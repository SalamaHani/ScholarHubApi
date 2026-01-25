import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../utils/index.js';

/**
 * @route   POST /api/saved
 * @desc    Save/bookmark a scholarship
 * @access  Private/Student
 */
export const saveScholarship = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { scholarshipId, notes } = req.body;

    // Check if scholarship exists
    const scholarship = await prisma.scholarship.findUnique({
        where: { id: scholarshipId },
    });

    if (!scholarship) {
        throw ApiError.notFound('Scholarship not found');
    }

    // Check if already saved
    const existing = await prisma.savedScholarship.findUnique({
        where: {
            userId_scholarshipId: { userId, scholarshipId },
        },
    });

    if (existing) {
        // Update notes if already saved
        const updated = await prisma.savedScholarship.update({
            where: { id: existing.id },
            data: { notes },
            include: {
                scholarship: {
                    select: { id: true, title: true, organization: true, deadline: true },
                },
            },
        });

        res.json({
            success: true,
            message: 'Saved scholarship updated',
            data: { saved: updated },
        });
        return;
    }

    // Create new save
    const saved = await prisma.savedScholarship.create({
        data: {
            userId,
            scholarshipId,
            notes,
        },
        include: {
            scholarship: {
                select: { id: true, title: true, organization: true, deadline: true },
            },
        },
    });

    res.status(201).json({
        success: true,
        message: 'Scholarship saved successfully',
        data: { saved },
    });
});

/**
 * @route   GET /api/saved
 * @desc    Get saved scholarships
 * @access  Private
 */
export const getSavedScholarships = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [saved, total] = await Promise.all([
        prisma.savedScholarship.findMany({
            where: { userId },
            skip,
            take: Number(limit),
            orderBy: { savedAt: 'desc' },
            include: {
                scholarship: {
                    select: {
                        id: true,
                        title: true,
                        organization: true,
                        country: true,
                        deadline: true,
                        fundingType: true,
                        degreeLevel: true,
                        status: true,
                    },
                },
            },
        }),
        prisma.savedScholarship.count({ where: { userId } }),
    ]);

    res.json({
        success: true,
        data: {
            saved,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        },
    });
});

/**
 * @route   DELETE /api/saved/:scholarshipId
 * @desc    Remove a saved scholarship
 * @access  Private
 */
export const unsaveScholarship = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { scholarshipId } = req.params;

    const saved = await prisma.savedScholarship.findUnique({
        where: {
            userId_scholarshipId: { userId, scholarshipId },
        },
    });

    if (!saved) {
        throw ApiError.notFound('Saved scholarship not found');
    }

    await prisma.savedScholarship.delete({ where: { id: saved.id } });

    res.json({
        success: true,
        message: 'Scholarship removed from saved',
    });
});

/**
 * @route   GET /api/saved/check/:scholarshipId
 * @desc    Check if a scholarship is saved
 * @access  Private
 */
export const checkSaved = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { scholarshipId } = req.params;

    const saved = await prisma.savedScholarship.findUnique({
        where: {
            userId_scholarshipId: { userId, scholarshipId },
        },
    });

    res.json({
        success: true,
        data: { isSaved: !!saved },
    });
});
