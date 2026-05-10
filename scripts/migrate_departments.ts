import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../db/school.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`Connecting to database at ${DB_PATH}...`);
const db = new Database(DB_PATH);

try {
    // 1. Create departments table
    console.log('Creating departments table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Get distinct departments from staff
    console.log('Migrating existing departments...');
    const staff = db.prepare('SELECT id, department FROM staff').all() as { id: string, department: string }[];

    // Get unique department names
    const departmentNames = [...new Set(staff.map(s => s.department).filter(Boolean))];

    console.log(`Found ${departmentNames.length} unique departments.`);

    const insertDept = db.prepare('INSERT OR IGNORE INTO departments (id, name) VALUES (?, ?)');
    const updateStaff = db.prepare('UPDATE staff SET department = ? WHERE department = ?');

    let migratedCount = 0;

    db.transaction(() => {
        for (const deptName of departmentNames) {
            // Generate updated ID (using name as ID for simplicity or UUID?)
            // The plan says "Migrate ... Add foreign key".
            // If I use a UUID, I must update staff table.
            // Let's use a UUID-like format "dept-<timestamp>-<random>" to be consistent with app style
            // BUT wait, if I update staff table now, I might break running app if it expects names?
            // The app currently displays department name directly from staff.department.
            // If I change staff.department to an ID, the frontend will show the ID until I update the queries to join.
            // 
            // STRATEGY: 
            // 1. Create departments with properly generated IDs.
            // 2. Update staff queries to JOIN departments (or fetch department name).
            // 
            // HOWEVER, the user asked to "Add CRUD for Department management".
            // If I change the data model now, the current `getAllStaff` query will return IDs in the 'department' field.
            // I need to update `getAllStaff` in `server/queries.ts` to join or I need to update the frontend.
            // 
            // Safest approach for "live" migration:
            // 1. Just create the table and populate it. 
            // 2. The `staff.department` column currently holds NAMES. 
            // 3. I will keep it holding NAMES for now to avoid breaking the app, OR I update the app immediately.
            // 
            // The user wanted: "Change that when creating a stuff you should select department from list".
            // And "Add foreign key constraint".
            // 
            // If I want to implement "ForeignKey to departments.id", `staff.department` MUST hold the ID.
            // So I MUST update `staff.department` to hold IDs.
            // This means `getAllStaff` will return IDs. 
            // I need to update `server/queries.ts` to JOIN `departments` and return `departments.name` as `departmentName` or similar, 
            // or overwrite `department` field in the result object with the name.

            const id = `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Insert department
            insertDept.run(id, deptName);

            // Update staff references from Name to ID
            // updateStaff.run(id, deptName); 
            // WAIT! If I run this, `staff.department` becomes an ID.
            // existing `getAllStaff` does `SELECT * FROM staff`. 
            // Frontend expects `department` to be the name (e.g. "Mathematics").
            // If it becomes "dept-12345...", the UI will show "dept-12345...".

            // So I need to do this in sync:
            // 1. Migrate Data (this script).
            // 2. Update Backend Queries (to join and return name).
            // 3. Update Frontend (to handle object or just display name).

            // Let's do the update in the script. I'll update the code immediately after.
            insertDept.run(id, deptName);
            updateStaff.run(id, deptName);

            console.log(`Migrated department: ${deptName} -> ${id}`);
            migratedCount++;
        }
    })();

    console.log(`Migration complete. ${migratedCount} departments migrated.`);

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
