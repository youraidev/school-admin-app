import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../db/school.db');

console.log('Running database migration for staff_qualifications...');

try {
    const db = new Database(DB_PATH);

    // Create staff_qualifications table
    db.exec(`
        CREATE TABLE IF NOT EXISTS staff_qualifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            staff_id TEXT NOT NULL,
            degree_type TEXT NOT NULL CHECK(degree_type IN (
                'Diploma in Education', 
                'Bachelor of Education (B.Ed)', 
                'Bachelor’s Degree', 
                'PGDE / PGCE', 
                'Master of Education (M.Ed)', 
                'Master’s Degree', 
                'Doctor of Education (Ed.D)', 
                'PhD', 
                'Teaching License', 
                'QTS', 
                'Montessori Certification', 
                'Special Education Certification', 
                'TESOL / TEFL', 
                'IB Teacher Certification'
            )),
            field_of_study TEXT NOT NULL,
            institution TEXT NOT NULL,
            year INTEGER CHECK (year IS NULL OR (year BETWEEN 1950 AND 2100)),
            FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
        );
    `);
    console.log('Created staff_qualifications table (if not exists).');

    // Create indexes
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staff_qual_staff_id ON staff_qualifications(staff_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staff_qual_field ON staff_qualifications(field_of_study);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staff_qual_inst ON staff_qualifications(institution);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staff_qual_inst_field ON staff_qualifications(institution, field_of_study);`);
    console.log('Created indexes.');

    // Update existing null ranks to 'Teacher' (fallback)
    const result = db.prepare(`UPDATE staff SET rank = 'Teacher' WHERE rank IS NULL OR rank = ''`).run();
    console.log(`Updated ${result.changes} staff records with null/empty rank to 'Teacher'.`);

    db.close();
    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
