import { Router } from 'express';
import * as queries from '../queries.js';
import { hashPassword, verifyPassword, signToken } from '../auth.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimit, forgotPasswordRateLimit } from '../middleware/rateLimit.js';
import { sendPasswordResetEmail } from '../email.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/login
router.post('/login', loginRateLimit, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const user = await queries.getUserByEmail(email.toLowerCase().trim());
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
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        if (password.length > 72) {
            return res.status(400).json({ error: 'Password must be 72 characters or fewer' });
        }

        if (await queries.getUserByEmail(email.toLowerCase().trim())) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const { school, user } = await queries.registerSchoolWithAdmin({
            schoolName: schoolName.trim(),
            email: email.toLowerCase().trim(),
            passwordHash: await hashPassword(password),
        });

        const token = signToken({ userId: user.id, schoolId: school.id, role: user.role });
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, schoolId: school.id } });
    } catch (error: any) {
        if (error.message === 'SLUG_CONFLICT') {
            return res.status(409).json({ error: 'A school with that name already exists' });
        }
        next(error);
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordRateLimit, async (req, res, next) => {
    try {
        const { email } = req.body;

        // Always respond with 200 to prevent email enumeration
        if (!email || !EMAIL_RE.test(email)) {
            return res.json({ message: 'If that email is registered, a reset link has been sent.' });
        }

        const user = await queries.getUserByEmail(email.toLowerCase().trim());
        if (user) {
            const token    = await queries.createPasswordResetToken(user.id);
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
            await sendPasswordResetEmail(user.email, resetUrl);
        }

        res.json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        if (password.length > 72) {
            return res.status(400).json({ error: 'Password must be 72 characters or fewer' });
        }

        const userId = await queries.validateAndConsumeResetToken(token);
        if (!userId) {
            return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
        }

        await queries.updateUserPassword(userId, await hashPassword(password));
        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;
