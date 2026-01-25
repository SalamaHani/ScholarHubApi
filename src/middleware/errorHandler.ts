import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/index.js';
import config from '../config/index.js';

interface ErrorResponse {
    success: false;
    message: string;
    errors?: any;
    stack?: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: any = undefined;

    // Handle ApiError instances
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Handle Prisma errors
    if (err.constructor.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;
        if (prismaError.code === 'P2002') {
            statusCode = 409;
            message = 'A record with this value already exists';
        } else if (prismaError.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        }
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = err;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    const response: ErrorResponse = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    // Include stack trace in development
    if (config.env === 'development' && err.stack) {
        response.stack = err.stack;
    }

    // Log error
    console.error(`[ERROR] ${statusCode} - ${message}`, {
        path: req.path,
        method: req.method,
        stack: err.stack,
    });

    res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    next(ApiError.notFound(`Route ${req.method} ${req.path} not found`));
};
