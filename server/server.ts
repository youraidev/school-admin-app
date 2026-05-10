import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './database.js';
import dashboardRouter from './routes/dashboard.js';
import studentsRouter from './routes/students.js';
import staffRouter from './routes/staff.js';
import departmentsRouter from './routes/departments.js';
import complianceRouter from './routes/compliance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
console.log('Initializing database...');
getDatabase();
console.log('Database initialized successfully');

// Mount API routers
app.use('/api/dashboard', dashboardRouter);
app.use('/api/students', studentsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/compliance', complianceRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

// Global error handler (must be last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});
