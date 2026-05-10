const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/school.db');
const db = new Database(dbPath);

const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
];

try {
    const staff = db.prepare('SELECT id, name FROM staff').all();

    console.log(`Found ${staff.length} staff members.`);

    const updateStmt = db.prepare('UPDATE staff SET photo_url = ? WHERE id = ?');

    db.transaction(() => {
        let cnt = 0;
        for (const member of staff) {
            const url = avatars[cnt % avatars.length];
            updateStmt.run(url, member.id);
            console.log(`Assigned image to ${member.name}`);
            cnt++;
        }
    })();

    console.log('Successfully updated staff records with photo URLs.');
} catch (err) {
    console.error('Error updating records:', err);
} finally {
    db.close();
}
