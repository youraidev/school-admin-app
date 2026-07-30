import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'AUTH_REQUIRED' });
        return;
    }

    try {
        req.user = verifyToken(header.slice(7));
        next();
    } catch {
        res.status(401).json({ error: 'INVALID_TOKEN' });
    }
}

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'FORBIDDEN' });
            return;
        }
        next();
    };
}
