import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticate } from './middleware/authenticate.js';
import authRouter        from './routes/auth.js';
import dashboardRouter   from './routes/dashboard.js';
import studentsRouter    from './routes/students.js';
import staffRouter       from './routes/staff.js';
import departmentsRouter from './routes/departments.js';
import complianceRouter  from './routes/compliance.js';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
}

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRouter);

// Public endpoints (no auth): health check and visitor country for language detection.
// The country comes from the hosting platform's edge headers (Vercel / Cloudflare);
// locally neither header exists and country is null, so the client falls back to
// browser-language detection.
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/geo', (req, res) => {
    const country = req.headers['x-vercel-ip-country'] ?? req.headers['cf-ipcountry'] ?? null;
    res.json({ country: typeof country === 'string' ? country.toUpperCase() : null });
});

app.use('/api', authenticate);
app.use('/api/dashboard',   dashboardRouter);
app.use('/api/students',    studentsRouter);
app.use('/api/staff',       staffRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/compliance',  complianceRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;
