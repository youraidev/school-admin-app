import ws from 'ws';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema.js';

// Required for Node.js environments (Vercel serverless); not needed on Edge Runtime
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL environment variable is required');

const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
