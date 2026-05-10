import Database from 'better-sqlite3';

const db = new Database('./db/school.db');
try {
    const updateStaffStmt = db.prepare(`
        UPDATE staff 
        SET first_name = ?, last_name = ?, position = ?, email = ?, role = ?, department = ?, rank = ?, photo_url = ?, start_date = ?
        WHERE id = ?
    `);

    updateStaffStmt.run(
        'Demo',
        'Test',
        'Teacher',
        'test@demo',
        'test',
        'dept-1',
        null,
        null,
        '2023-01-01',
        'staff-4'
    );
    console.log("Success");
} catch (e) {
    console.error(e);
}
db.close();
