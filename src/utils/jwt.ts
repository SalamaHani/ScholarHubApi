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
 * Parse a duration string like "15m", "7d", "1h" into milliseconds
 */
const parseDurationMs = (duration: string): number => {
    const units: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000; // default 15m
    return parseInt(match[1]) * (units[match[2]] ?? 1000);
};

/**
 * Generate both access and refresh tokens with expiration metadata
 */
export const generateTokens = (userId: string, role: string) => {
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId, role);

    const accessExpiresMs = parseDurationMs(config.jwtExpiresIn);
    const refreshExpiresMs = parseDurationMs(config.jwtRefreshExpiresIn);

    return {
        accessToken,
        refreshToken,
        expiresIn: config.jwtExpiresIn,
        accessTokenExpiresAt: new Date(Date.now() + accessExpiresMs).toISOString(),
        refreshTokenExpiresAt: new Date(Date.now() + refreshExpiresMs).toISOString(),
    };
};
