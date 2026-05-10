import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../db/school.db');

console.log('Running database migration for staff names and positions...');

try {
    const db = new Database(DB_PATH);

    db.exec('PRAGMA foreign_keys=off;');
    db.exec('BEGIN TRANSACTION;');

    // 1. Rename existing 'staff' table to 'staff_old'
    db.exec('ALTER TABLE staff RENAME TO staff_old;');

    // 2. Create the new 'staff' table with first_name, last_name, position, legacy_name
    db.exec(`
        CREATE TABLE staff (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            position TEXT NOT NULL,
            legacy_name TEXT,
            role TEXT NOT NULL,
            department TEXT NOT NULL,
            photo_url TEXT,
            email TEXT NOT NULL,
            phone TEXT,
            salary REAL,
            salary_coefficient REAL,
            start_date TEXT NOT NULL,
            qualification TEXT,
            rank TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log('Created new staff table schema.');

    // 3. Migrate data from 'staff_old' to 'staff'
    // Splitting by first space:
    // first_name: everything before first space (or full name if no space)
    // last_name: everything after first space (or '-' if no space)
    db.exec(`
        INSERT INTO staff (
            id, first_name, last_name, position, legacy_name, role, department, 
            photo_url, email, phone, salary, salary_coefficient, start_date, 
            qualification, rank, created_at, updated_at
        )
        SELECT 
            id,
            CASE 
                WHEN instr(name, ' ') > 0 THEN substr(name, 1, instr(name, ' ') - 1)
                ELSE name
            END as first_name,
            CASE 
                WHEN instr(name, ' ') > 0 THEN substr(name, instr(name, ' ') + 1)
                ELSE '-'
            END as last_name,
            'Teacher' as position,
            name as legacy_name,
            role,
            department,
            photo_url,
            email,
            phone,
            salary,
            salary_coefficient,
            start_date,
            qualification,
            rank,
            created_at,
            updated_at
        FROM staff_old;
    `);

    // 4. Drop the old table
    db.exec('DROP TABLE staff_old;');

    console.log('Migrated data successfully.');

    // Commit changes
    db.exec('COMMIT;');
    db.exec('PRAGMA foreign_keys=on;');

    db.close();
    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
