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
    : ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api', authenticate);
app.use('/api/dashboard',   dashboardRouter);
app.use('/api/students',    studentsRouter);
app.use('/api/staff',       staffRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/compliance',  complianceRouter);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;
