import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma.js';
import {
    ApiError,
    asyncHandler,
    hashPassword,
    comparePassword,
    generateTokens,
    verifyRefreshToken,
} from '../utils/index.js';
import config from '../config/index.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Student or Professor)
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role = 'STUDENT' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerifyToken = uuidv4();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with appropriate profile
    const userData: any = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as UserRole,
        emailVerifyToken,
        emailVerifyExpires,
    };

    // Add profile based on role
    if (role === 'STUDENT') {
        userData.studentProfile = { create: {} };
    } else if (role === 'PROFESSOR') {
        userData.professorProfile = {
            create: {
                institution: req.body.institution || 'Not specified',
            },
        };
    }

    const user = await prisma.user.create({
        data: userData,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
        },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Save refresh token to database
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });

    // TODO: Send verification email

    res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
            user,
            tokens,
        },
    });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            professorProfile: {
                select: { isVerified: true },
            },
        },
    });

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is blocked
    if (user.isBlocked) {
        throw ApiError.forbidden('Your account has been blocked. Please contact support.');
    }

    // Check if user is active
    if (!user.isActive) {
        throw ApiError.forbidden('Your account is inactive. Please contact support.');
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Save refresh token
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                professorVerified: user.professorProfile?.isVerified ?? null,
            },
            tokens,
        },
    });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw ApiError.badRequest('Refresh token is required');
    }

    // Verify refresh token
    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch (error) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Generate new tokens
    const tokens = generateTokens(storedToken.user.id, storedToken.user.role);

    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({
        data: {
            userId: storedToken.user.id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
    });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    if (token) {
        // Delete refresh token from database
        await prisma.refreshToken.deleteMany({
            where: { token },
        });
    }

    // Delete all refresh tokens for the user (logout from all devices)
    if (req.user) {
        await prisma.refreshToken.deleteMany({
            where: { userId: req.user.id },
        });
    }

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        throw ApiError.badRequest('Verification token is required');
    }

    const user = await prisma.user.findFirst({
        where: {
            emailVerifyToken: token,
            emailVerifyExpires: { gt: new Date() },
        },
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired verification token');
    }

    // Update user
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            emailVerifyToken: null,
            emailVerifyExpires: null,
        },
    });

    res.json({
        success: true,
        message: 'Email verified successfully',
    });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        // Don't reveal if user exists
        res.json({
            success: true,
            message: 'If an account exists, you will receive a password reset email.',
        });
        return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
        },
    });

    // TODO: Send password reset email

    res.json({
        success: true,
        message: 'If an account exists, you will receive a password reset email.',
    });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: new Date() },
        },
    });

    if (!user) {
        throw ApiError.badRequest('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
        where: { userId: user.id },
    });

    res.json({
        success: true,
        message: 'Password reset successfully. Please login with your new password.',
    });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            phone: true,
            isEmailVerified: true,
            createdAt: true,
            studentProfile: true,
            professorProfile: true,
        },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    res.json({
        success: true,
        data: { user },
    });
});
