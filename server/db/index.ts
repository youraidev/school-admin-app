import { Pool } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const DATABASE_URL = process.env.NEON_POSTGRES_URL;
if (!DATABASE_URL) throw new Error('NEON_POSTGRES_URL environment variable is required');

// Use @neondatabase/serverless for Neon (production/preview) and standard pg locally.
// Neon's connection string uses the HTTP proxy endpoint which requires the serverless driver.
const isNeon = DATABASE_URL.includes('neon.tech');

export const db = isNeon
    ? drizzleNeon(neon(DATABASE_URL), { schema })
    : drizzlePg(new Pool({ connectionString: DATABASE_URL }), { schema });
