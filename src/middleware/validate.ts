import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/index.js';

/**
 * Middleware to handle validation errors from express-validator
 */
export const validate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err: any) => ({
            field: err.path,
            message: err.msg,
        }));

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages,
        });
        return;
    }

    next();
};
