import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { Request, Response, NextFunction } from 'express';

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '15 m'),
        prefix: 'rl:login',
    });
} else if (process.env.NODE_ENV === 'production') {
    console.warn('UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — login rate limiting is disabled');
}

export async function loginRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!ratelimit) { next(); return; }

    const ip = (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';

    const { success, limit, remaining } = await ratelimit.limit(ip);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (!success) {
        res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
        return;
    }
    next();
}
