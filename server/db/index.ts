import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.NEON_POSTGRES_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL environment variable is required');

// Works with both local Docker PostgreSQL and Neon in production.
// Vercel runs on Node.js runtime (not Edge), so standard TCP pg connections work fine.
const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
