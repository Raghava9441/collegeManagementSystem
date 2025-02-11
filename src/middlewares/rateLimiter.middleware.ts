// src/middlewares/rateLimiter.middleware.ts
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../utils/logger';

interface RateLimitConfig {
    windowMs: number;
    max: number;
    message?: string;
}

export const createRateLimiter = (config: RateLimitConfig) => {
    return rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: config.message || 'Too many requests, please try again later.',
        handler: (req: Request, res: Response) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: config.message || 'Too many requests, please try again later.'
            });
        },
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    });
};

// Default rate limiters for different types of routes
export const defaultRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

export const authRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 failed attempts per hour
    message: 'Too many login attempts, please try again after an hour'
});

export const apiRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
});