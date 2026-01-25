import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';

interface TokenPayload {
    userId: string;
    role: string;
    type: 'access' | 'refresh';
}

/**
 * Generate an access token
 */
export const generateAccessToken = (userId: string, role: string): string => {
    const payload: TokenPayload = {
        userId,
        role,
        type: 'access',
    };

    const options: SignOptions = {
        expiresIn: config.jwtExpiresIn as any,
    };

    return jwt.sign(payload, config.jwtSecret, options);
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (userId: string, role: string): string => {
    const payload: TokenPayload = {
        userId,
        role,
        type: 'refresh',
    };

    const options: SignOptions = {
        expiresIn: config.jwtRefreshExpiresIn as any,
    };

    return jwt.sign(payload, config.jwtRefreshSecret, options);
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (userId: string, role: string) => {
    return {
        accessToken: generateAccessToken(userId, role),
        refreshToken: generateRefreshToken(userId, role),
    };
};
