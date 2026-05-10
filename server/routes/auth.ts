import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as queries from '../queries.js';
import { hashPassword, verifyPassword, signToken } from '../auth.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await queries.getUserByEmail(email);
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ userId: user.id, schoolId: user.schoolId, role: user.role });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, schoolId: user.schoolId } });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/register — creates a new school + school_admin user
router.post('/register', async (req, res, next) => {
    try {
        const { schoolName, email, password } = req.body;
        if (!schoolName || !email || !password) {
            return res.status(400).json({ error: 'School name, email, and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        if (await queries.getUserByEmail(email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const { school, user } = await queries.registerSchoolWithAdmin({
            schoolName,
            email,
            passwordHash: await hashPassword(password),
        });

        const token = signToken({ userId: user.id, schoolId: school.id, role: user.role });
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, schoolId: school.id } });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me — verify token and return current user info
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;
