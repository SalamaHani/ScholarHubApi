import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { ApiError, verifyAccessToken } from "../utils/index.js";
import prisma from "../lib/prisma.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    if (decoded.type !== "access") {
      throw ApiError.unauthorized("Invalid token type");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isBlocked: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    if (!user.isActive || user.isBlocked) {
      throw ApiError.forbidden("Account is inactive or blocked");
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role ${req.user.role} is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(UserRole.ADMIN);

/**
 * Check if user is professor
 */
export const isProfessor = authorize(UserRole.PROFESSOR);

/**
 * Check if user is student
 */
export const isStudent = authorize(UserRole.STUDENT);

/**
 * Check if user is professor or admin
 */
export const isProfessorOrAdmin = authorize(UserRole.PROFESSOR, UserRole.ADMIN);
