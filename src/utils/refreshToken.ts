import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { AppError } from './appError.js';

export const signRefreshToken = (userId: string): string => {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
        throw new AppError('JWT_REFRESH_SECRET is not defined in the environment variables', 404);
    }

    return jwt.sign(
        { sub: userId, jti: crypto.randomUUID() },
        secret,
        { expiresIn: '7d'}
    );
};