import { Router } from 'express';
import * as queries from '../queries.js';
import { hashPassword, verifyPassword, signToken } from '../auth.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimit, forgotPasswordRateLimit } from '../middleware/rateLimit.js';
import { sendPasswordResetEmail } from '../email.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// All error responses return stable CODES (translated client-side), never English text.

function normalizeLanguage(value: unknown): 'en' | 'lt' | null {
    return value === 'en' || value === 'lt' ? value : null;
}

// POST /api/auth/login
router.post('/login', loginRateLimit, async (req, res, next) => {
    try {
        const { email, password, language } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'EMAIL_PASSWORD_REQUIRED' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ error: 'INVALID_EMAIL' });
        }

        const user = await queries.getUserByEmail(email.toLowerCase().trim());
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
        }

        // The client sends `language` only when the user explicitly chose one on this
        // device — that choice updates the stored preference. Otherwise the stored
        // preference is returned so the client adopts it (e.g. logging in on a new device).
        const lang = normalizeLanguage(language);
        if (lang && lang !== user.preferredLanguage) {
            await queries.updateUserPreferredLanguage(user.schoolId, user.id, lang);
        }
        const preferredLanguage = lang ?? normalizeLanguage(user.preferredLanguage) ?? 'en';

        const token = signToken({ userId: user.id, schoolId: user.schoolId, role: user.role });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, schoolId: user.schoolId, preferredLanguage } });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/register — creates a new school + school_admin user
router.post('/register', async (req, res, next) => {
    try {
        const { schoolName, email, password, language } = req.body;
        if (!schoolName || !email || !password) {
            return res.status(400).json({ error: 'REGISTER_FIELDS_REQUIRED' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ error: 'INVALID_EMAIL' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
        }
        if (password.length > 72) {
            return res.status(400).json({ error: 'PASSWORD_TOO_LONG' });
        }

        if (await queries.getUserByEmail(email.toLowerCase().trim())) {
            return res.status(409).json({ error: 'EMAIL_TAKEN' });
        }

        const { school, user } = await queries.registerSchoolWithAdmin({
            schoolName: schoolName.trim(),
            email: email.toLowerCase().trim(),
            passwordHash: await hashPassword(password),
            preferredLanguage: normalizeLanguage(language) ?? 'en',
        });

        const token = signToken({ userId: user.id, schoolId: school.id, role: user.role });
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, schoolId: school.id, preferredLanguage: user.preferredLanguage ?? 'en' } });
    } catch (error) {
        if (error instanceof Error && error.message === 'SLUG_CONFLICT') {
            return res.status(409).json({ error: 'SCHOOL_NAME_TAKEN' });
        }
        next(error);
    }
});

// PATCH /api/auth/language — persist the signed-in user's UI language (used for emails)
router.patch('/language', authenticate, async (req, res, next) => {
    try {
        const lang = normalizeLanguage(req.body?.language);
        if (!lang) {
            return res.status(400).json({ error: 'LANGUAGE_INVALID' });
        }
        await queries.updateUserPreferredLanguage(req.user!.schoolId, req.user!.userId, lang);
        res.json({ language: lang });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordRateLimit, async (req, res, next) => {
    try {
        const { email, language } = req.body;

        // Always respond with 200 to prevent email enumeration
        if (!email || !EMAIL_RE.test(email)) {
            return res.json({ message: 'OK' });
        }

        const user = await queries.getUserByEmail(email.toLowerCase().trim());
        if (user) {
            const token    = await queries.createPasswordResetToken(user.id);
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
            // Prefer the stored account language; fall back to the requester's UI language
            const lang = normalizeLanguage(user.preferredLanguage) ?? normalizeLanguage(language) ?? 'en';
            await sendPasswordResetEmail(user.email, resetUrl, lang);
        }

        res.json({ message: 'OK' });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'RESET_FIELDS_REQUIRED' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
        }
        if (password.length > 72) {
            return res.status(400).json({ error: 'PASSWORD_TOO_LONG' });
        }

        const userId = await queries.validateAndConsumeResetToken(token);
        if (!userId) {
            return res.status(400).json({ error: 'RESET_LINK_INVALID' });
        }

        await queries.updateUserPassword(userId, await hashPassword(password));
        res.json({ message: 'OK' });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;
