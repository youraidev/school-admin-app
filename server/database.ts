import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../db/school.db');
const SCHEMA_PATH = path.join(__dirname, '../db/schema.sql');
const SEED_PATH = path.join(__dirname, '../db/seed.sql');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
    if (db) {
        return db;
    }

    // Create database directory if it doesn't exist
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Check if database needs to be initialized
    const dbExists = fs.existsSync(DB_PATH);

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    if (!dbExists) {
        console.log('Initializing database...');
        initializeDatabase(db);
    }

    return db;
}

function initializeDatabase(database: Database.Database): void {
    // Read and execute schema
    if (fs.existsSync(SCHEMA_PATH)) {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        database.exec(schema);
        console.log('Schema created successfully');
    } else {
        console.warn('Warning: schema.sql not found');
    }

    // Read and execute seed data
    if (fs.existsSync(SEED_PATH)) {
        const seed = fs.readFileSync(SEED_PATH, 'utf-8');
        database.exec(seed);
        console.log('Database seeded successfully');
    } else {
        console.warn('Warning: seed.sql not found');
    }
}

export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
    }
}

// Helper function to convert database rows to camelCase
export function toCamelCase<T>(obj: any): T {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
        return obj.map(toCamelCase) as T;
    }
    if (typeof obj !== 'object') return obj;

    const result: any = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = obj[key];
    }
    return result;
}

// Helper function to convert boolean fields (SQLite uses 0/1)
export function convertBooleans<T extends Record<string, any>>(obj: T, booleanFields: string[]): T {
    const result = { ...obj };
    booleanFields.forEach(field => {
        if (field in result) {
            (result as any)[field] = Boolean((result as any)[field]);
        }
    });
    return result;
}
