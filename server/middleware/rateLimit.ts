import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { Request, Response, NextFunction } from 'express';

function makeMiddleware(limiter: Ratelimit | null) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!limiter) { next(); return; }
        const ip = (req.headers['x-forwarded-for'] as string | undefined)
            ?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';
        const { success, limit, remaining } = await limiter.limit(ip);
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        if (!success) {
            res.status(429).json({ error: 'Too many requests. Please try again later.' });
            return;
        }
        next();
    };
}

let loginLimiter:         Ratelimit | null = null;
let forgotPasswordLimiter: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = Redis.fromEnv();
    loginLimiter          = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '15 m'), prefix: 'rl:login' });
    forgotPasswordLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '15 m'),  prefix: 'rl:forgot' });
} else if (process.env.NODE_ENV === 'production') {
    console.warn('UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting is disabled');
}

export const loginRateLimit         = makeMiddleware(loginLimiter);
export const forgotPasswordRateLimit = makeMiddleware(forgotPasswordLimiter);
