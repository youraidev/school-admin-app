import { randomUUID } from 'crypto';
import { sql, SQL } from 'drizzle-orm';
import { db } from './db/index.js';
import { toCamelCase, convertBooleans } from './db/utils.js';
import type {
    Student, StudentWithDetails, Allergy, EmergencyContact,
    DocumentChecklist, Agreement, AuthorizedPerson,
    Staff, StaffWithDetails, Certificate, CourseEvaluation, ExtraDuty,
    ComplianceDocument, ComplianceDocumentWithSignatures, DocumentSignature,
    DashboardStats, CriticalAllergy, ContractIssue, PendingSignature,
    Department, StaffQualification, Rank, Position, School, User,
} from '../shared/types/index.js';

type Row = Record<string, unknown>;

// Execute a SQL query and return all rows
async function qAll(query: SQL): Promise<Row[]> {
    const result = await db.execute(query);
    return (result as unknown as { rows: Row[] }).rows ?? [];
}

// Execute a SQL query and return one row or null
async function qOne(query: SQL): Promise<Row | null> {
    const rows = await qAll(query);
    return rows[0] ?? null;
}

function normalizeText(text: string): string {
    if (!text) return text;
    return text.trim().replace(/\s+/g, ' ')
        .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ===== AUTH QUERIES =====

export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const row = await qOne(sql`SELECT * FROM users WHERE email = ${email}`);
    return row ? toCamelCase<User & { passwordHash: string }>(row) : null;
}

export async function registerSchoolWithAdmin(data: {
    schoolName: string;
    email: string;
    passwordHash: string;
}): Promise<{ school: School; user: User }> {
    const schoolId = randomUUID();
    const userId   = randomUUID();
    const slug = data.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    await db.transaction(async tx => {
        await tx.execute(sql`INSERT INTO schools (id, name, slug) VALUES (${schoolId}, ${data.schoolName}, ${slug})`);
        await tx.execute(sql`INSERT INTO users (id, school_id, email, password_hash, role) VALUES (${userId}, ${schoolId}, ${data.email}, ${data.passwordHash}, 'school_admin')`);
    });

    const school = toCamelCase<School>((await qOne(sql`SELECT * FROM schools WHERE id = ${schoolId}`))!);
    const user   = toCamelCase<User>((await qOne(sql`SELECT * FROM users   WHERE id = ${userId}`))!);
    return { school, user };
}

// ===== DASHBOARD QUERIES =====

export async function getDashboardStats(schoolId: string): Promise<DashboardStats> {
    const [ts, tf, pc, ps] = await Promise.all([
        qOne(sql`SELECT COUNT(*) as count FROM students WHERE school_id = ${schoolId}`),
        qOne(sql`SELECT COUNT(*) as count FROM staff    WHERE school_id = ${schoolId}`),
        qOne(sql`SELECT COUNT(*) as count FROM students WHERE school_id = ${schoolId} AND (contract_status IN ('pending','expired') OR is_paid = false)`),
        qOne(sql`SELECT COUNT(DISTINCT ds.document_id) as count FROM document_signatures ds JOIN compliance_documents cd ON ds.document_id = cd.id WHERE cd.school_id = ${schoolId} AND ds.status = 'pending'`),
    ]);
    return {
        totalStudents:    Number((ts as Row).count),
        totalStaff:       Number((tf as Row).count),
        pendingContracts: Number((pc as Row).count),
        pendingSignatures:Number((ps as Row).count),
    };
}

export async function getCriticalAllergies(schoolId: string): Promise<CriticalAllergy[]> {
    const rows = await qAll(sql`
        SELECT s.id as student_id, s.name as student_name, a.name as allergen, a.notes
        FROM allergies a JOIN students s ON a.student_id = s.id
        WHERE s.school_id = ${schoolId} AND a.severity = 'life-threatening'
        ORDER BY s.name
    `);
    return toCamelCase<CriticalAllergy[]>(rows);
}

export async function getContractIssues(schoolId: string): Promise<ContractIssue[]> {
    const rows = await qAll(sql`
        SELECT id as student_id, name as student_name,
            CASE WHEN is_paid = false THEN 'Unpaid Contract'
                 WHEN contract_status = 'pending' THEN 'Pending Contract'
                 WHEN contract_status = 'expired' THEN 'Expired Contract'
                 ELSE 'Contract Issue' END as issue,
            contract_status as status
        FROM students
        WHERE school_id = ${schoolId} AND (contract_status IN ('pending','expired') OR is_paid = false)
        ORDER BY name
    `);
    return rows.map(r => toCamelCase<ContractIssue>(r));
}

export async function getPendingSignatures(schoolId: string): Promise<PendingSignature[]> {
    const rows = await qAll(sql`
        SELECT cd.id as document_id, cd.title as document_title,
            COUNT(CASE WHEN ds.status = 'signed'  THEN 1 END) as signed_count,
            COUNT(*) as total_count
        FROM compliance_documents cd JOIN document_signatures ds ON cd.id = ds.document_id
        WHERE cd.school_id = ${schoolId}
        GROUP BY cd.id, cd.title
        HAVING COUNT(CASE WHEN ds.status = 'pending' THEN 1 END) > 0
        ORDER BY cd.upload_date DESC
    `);
    return toCamelCase<PendingSignature[]>(rows);
}

// ===== STUDENT QUERIES =====

export async function getAllStudents(schoolId: string): Promise<Student[]> {
    const rows = await qAll(sql`SELECT * FROM students WHERE school_id = ${schoolId} ORDER BY name`);
    return rows.map(r => toCamelCase<Student>(r));
}

export async function getStudentById(schoolId: string, id: string): Promise<StudentWithDetails | null> {
    const student = await qOne(sql`SELECT * FROM students WHERE school_id = ${schoolId} AND id = ${id}`);
    if (!student) return null;

    const [allergies, emergencyContacts, documentChecklist, agreements, authorizedPickup] = await Promise.all([
        qAll(sql`SELECT * FROM allergies          WHERE student_id = ${id} ORDER BY severity DESC, name`),
        qAll(sql`SELECT * FROM emergency_contacts WHERE student_id = ${id} ORDER BY is_primary DESC, name`),
        qAll(sql`SELECT * FROM document_checklist WHERE student_id = ${id} ORDER BY due_date`),
        qAll(sql`SELECT * FROM agreements         WHERE student_id = ${id} ORDER BY type`),
        qAll(sql`SELECT * FROM authorized_pickup  WHERE student_id = ${id} ORDER BY name`),
    ]);

    return {
        ...toCamelCase<Student>(student),
        allergies:         toCamelCase<Allergy[]>(allergies),
        emergencyContacts: toCamelCase<EmergencyContact[]>(emergencyContacts),
        documentChecklist: toCamelCase<DocumentChecklist[]>(documentChecklist),
        agreements:        toCamelCase<Agreement[]>(agreements),
        authorizedPickup:  toCamelCase<AuthorizedPerson[]>(authorizedPickup),
    };
}

// ===== QUALIFICATION SUGGESTIONS =====

export async function getQualificationSuggestions(schoolId: string) {
    const [fields, institutions] = await Promise.all([
        qAll(sql`SELECT DISTINCT sq.field_of_study FROM staff_qualifications sq JOIN staff s ON sq.staff_id = s.id WHERE s.school_id = ${schoolId} ORDER BY sq.field_of_study`),
        qAll(sql`SELECT DISTINCT sq.institution    FROM staff_qualifications sq JOIN staff s ON sq.staff_id = s.id WHERE s.school_id = ${schoolId} ORDER BY sq.institution`),
    ]);
    return {
        fields:       fields.map((r: Row) => r.field_of_study as string),
        institutions: institutions.map((r: Row) => r.institution as string),
    };
}

// ===== STAFF QUERIES =====

async function attachQualifications(staffRows: Row[]): Promise<Staff[]> {
    return Promise.all(staffRows.map(async row => {
        const staffCamel = toCamelCase<Staff>(row);
        const quals = await qAll(sql`SELECT * FROM staff_qualifications WHERE staff_id = ${staffCamel.id} ORDER BY year DESC NULLS LAST`);
        return { ...staffCamel, qualifications: toCamelCase<StaffQualification[]>(quals) };
    }));
}

export async function getAllStaff(schoolId: string): Promise<Staff[]> {
    const rows = await qAll(sql`
        SELECT s.*, d.name as department_name FROM staff s
        LEFT JOIN departments d ON s.department = d.id
        WHERE s.school_id = ${schoolId} ORDER BY s.first_name, s.last_name
    `);
    return attachQualifications(rows);
}

export async function getStaffById(schoolId: string, id: string): Promise<StaffWithDetails | null> {
    const staff = await qOne(sql`
        SELECT s.*, d.name as department_name FROM staff s
        LEFT JOIN departments d ON s.department = d.id
        WHERE s.school_id = ${schoolId} AND s.id = ${id}
    `);
    if (!staff) return null;

    const [qualifications, certificates, courseEvaluations, extraDuties, emergencyContacts] = await Promise.all([
        qAll(sql`SELECT * FROM staff_qualifications WHERE staff_id = ${id} ORDER BY year DESC NULLS LAST`),
        qAll(sql`SELECT * FROM certificates         WHERE staff_id = ${id} ORDER BY date DESC`),
        qAll(sql`SELECT * FROM course_evaluations   WHERE staff_id = ${id} ORDER BY date DESC`),
        qAll(sql`SELECT * FROM extra_duties         WHERE staff_id = ${id} ORDER BY duty_name`),
        qAll(sql`SELECT * FROM emergency_contacts   WHERE staff_id = ${id} ORDER BY is_primary DESC, name`),
    ]);

    return {
        ...toCamelCase<Staff>(staff),
        qualifications:    toCamelCase<StaffQualification[]>(qualifications),
        certificates:      toCamelCase<Certificate[]>(certificates),
        courseEvaluations: toCamelCase<CourseEvaluation[]>(courseEvaluations),
        extraDuties:       toCamelCase<ExtraDuty[]>(extraDuties),
        emergencyContacts: toCamelCase<EmergencyContact[]>(emergencyContacts),
    };
}

export async function addStaff(schoolId: string, staffData: {
    firstName: string; lastName: string; email: string; role: string;
    department: string; position: Position; rank?: Rank; photoUrl?: string;
    startDate: string; qualifications?: StaffQualification[];
}): Promise<Staff> {
    const id = randomUUID();

    await db.transaction(async tx => {
        await tx.execute(sql`
            INSERT INTO staff (id, school_id, first_name, last_name, position, email, role, department, rank, photo_url, start_date)
            VALUES (${id}, ${schoolId}, ${staffData.firstName}, ${staffData.lastName}, ${staffData.position},
                    ${staffData.email}, ${staffData.role}, ${staffData.department},
                    ${staffData.rank ?? null}, ${staffData.photoUrl ?? null}, ${staffData.startDate})
        `);
        for (const qual of staffData.qualifications ?? []) {
            await tx.execute(sql`
                INSERT INTO staff_qualifications (staff_id, degree_type, field_of_study, institution, year)
                VALUES (${id}, ${qual.degreeType}, ${normalizeText(qual.fieldOfStudy)}, ${normalizeText(qual.institution)}, ${qual.year ?? null})
            `);
        }
    });

    const row = await qOne(sql`SELECT s.*, d.name as department_name FROM staff s LEFT JOIN departments d ON s.department = d.id WHERE s.id = ${id}`);
    const quals = await qAll(sql`SELECT * FROM staff_qualifications WHERE staff_id = ${id} ORDER BY year DESC NULLS LAST`);
    return { ...toCamelCase<Staff>(row!), qualifications: toCamelCase<StaffQualification[]>(quals) };
}

export async function updateStaff(schoolId: string, id: string, staffData: {
    firstName: string; lastName: string; email: string; role: string;
    department: string; position: Position; rank?: Rank; photoUrl?: string;
    startDate: string; qualifications?: StaffQualification[];
}): Promise<Staff | null> {
    const returning = await qOne(sql`
        UPDATE staff SET first_name = ${staffData.firstName}, last_name = ${staffData.lastName},
            position = ${staffData.position}, email = ${staffData.email}, role = ${staffData.role},
            department = ${staffData.department}, rank = ${staffData.rank ?? null},
            photo_url = ${staffData.photoUrl ?? null}, start_date = ${staffData.startDate}
        WHERE school_id = ${schoolId} AND id = ${id}
        RETURNING id
    `);
    if (!returning) return null;

    if (staffData.qualifications !== undefined) {
        await db.transaction(async tx => {
            await tx.execute(sql`DELETE FROM staff_qualifications WHERE staff_id = ${id}`);
            for (const qual of staffData.qualifications!) {
                await tx.execute(sql`
                    INSERT INTO staff_qualifications (staff_id, degree_type, field_of_study, institution, year)
                    VALUES (${id}, ${qual.degreeType}, ${normalizeText(qual.fieldOfStudy)}, ${normalizeText(qual.institution)}, ${qual.year ?? null})
                `);
            }
        });
    }

    const row = await qOne(sql`SELECT s.*, d.name as department_name FROM staff s LEFT JOIN departments d ON s.department = d.id WHERE s.id = ${id}`);
    const quals = await qAll(sql`SELECT * FROM staff_qualifications WHERE staff_id = ${id} ORDER BY year DESC NULLS LAST`);
    return { ...toCamelCase<Staff>(row!), qualifications: toCamelCase<StaffQualification[]>(quals) };
}

export async function updateCertificates(schoolId: string, staffId: string, certs: {
    name: string; issuer: string; date: string; fileUrl?: string;
}[]): Promise<Certificate[]> {
    const exists = await qOne(sql`SELECT id FROM staff WHERE school_id = ${schoolId} AND id = ${staffId}`);
    if (!exists) throw new Error('Staff member not found');

    await db.transaction(async tx => {
        await tx.execute(sql`DELETE FROM certificates WHERE staff_id = ${staffId}`);
        for (const cert of certs) {
            await tx.execute(sql`
                INSERT INTO certificates (id, school_id, staff_id, name, issuer, date, file_url)
                VALUES (${randomUUID()}, ${schoolId}, ${staffId}, ${cert.name.trim()}, ${cert.issuer.trim()}, ${cert.date}, ${cert.fileUrl ?? null})
            `);
        }
    });

    return toCamelCase<Certificate[]>(await qAll(sql`SELECT * FROM certificates WHERE staff_id = ${staffId} ORDER BY date DESC`));
}

export async function updateCourseEvaluations(schoolId: string, staffId: string, evals: {
    courseName: string; rating: number; feedback?: string; date: string;
}[]): Promise<CourseEvaluation[]> {
    const exists = await qOne(sql`SELECT id FROM staff WHERE school_id = ${schoolId} AND id = ${staffId}`);
    if (!exists) throw new Error('Staff member not found');

    await db.transaction(async tx => {
        await tx.execute(sql`DELETE FROM course_evaluations WHERE staff_id = ${staffId}`);
        for (const ev of evals) {
            await tx.execute(sql`
                INSERT INTO course_evaluations (id, school_id, staff_id, course_name, rating, feedback, date)
                VALUES (${randomUUID()}, ${schoolId}, ${staffId}, ${ev.courseName.trim()}, ${Math.min(5, Math.max(0, ev.rating))}, ${ev.feedback?.trim() ?? null}, ${ev.date})
            `);
        }
    });

    return toCamelCase<CourseEvaluation[]>(await qAll(sql`SELECT * FROM course_evaluations WHERE staff_id = ${staffId} ORDER BY date DESC`));
}

// ===== DEPARTMENT QUERIES =====

export async function getAllDepartments(schoolId: string): Promise<Department[]> {
    const rows = await qAll(sql`
        SELECT d.*, COUNT(s.id) as staff_count FROM departments d
        LEFT JOIN staff s ON d.id = s.department AND s.school_id = d.school_id
        WHERE d.school_id = ${schoolId} GROUP BY d.id ORDER BY d.name
    `);
    return toCamelCase<Department[]>(rows);
}

export async function getDepartmentById(schoolId: string, id: string): Promise<Department | null> {
    const row = await qOne(sql`
        SELECT d.*, COUNT(s.id) as staff_count FROM departments d
        LEFT JOIN staff s ON d.id = s.department AND s.school_id = d.school_id
        WHERE d.school_id = ${schoolId} AND d.id = ${id} GROUP BY d.id
    `);
    return row ? toCamelCase<Department>(row) : null;
}

export async function addDepartment(schoolId: string, data: { name: string; description?: string }): Promise<Department> {
    if (!data.name?.trim()) throw new Error('Department name is required');
    if (data.name.length > 100) throw new Error('Department name exceeds 100 characters');
    if (data.description && data.description.length > 500) throw new Error('Description exceeds 500 characters');
    const id = randomUUID();
    try {
        await db.execute(sql`INSERT INTO departments (id, school_id, name, description) VALUES (${id}, ${schoolId}, ${data.name.trim()}, ${data.description ?? null})`);
    } catch (err: unknown) {
        if (isUniqueViolation(err)) throw new Error('Department with this name already exists');
        throw err;
    }
    return toCamelCase<Department>((await qOne(sql`SELECT * FROM departments WHERE id = ${id}`))!);
}

export async function updateDepartment(schoolId: string, id: string, data: { name: string; description?: string }): Promise<Department | null> {
    if (!data.name?.trim()) throw new Error('Department name is required');
    if (data.name.length > 100) throw new Error('Department name exceeds 100 characters');
    if (data.description && data.description.length > 500) throw new Error('Description exceeds 500 characters');
    try {
        const row = await qOne(sql`UPDATE departments SET name = ${data.name.trim()}, description = ${data.description ?? null} WHERE school_id = ${schoolId} AND id = ${id} RETURNING id`);
        if (!row) return null;
    } catch (err: unknown) {
        if (isUniqueViolation(err)) throw new Error('Department with this name already exists');
        throw err;
    }
    return toCamelCase<Department>((await qOne(sql`SELECT * FROM departments WHERE id = ${id}`))!);
}

export async function getDepartmentStaffCount(schoolId: string, id: string): Promise<number> {
    const row = await qOne(sql`SELECT COUNT(*) as count FROM staff WHERE school_id = ${schoolId} AND department = ${id}`);
    return Number((row as Row).count);
}

export async function deleteDepartment(schoolId: string, id: string): Promise<boolean> {
    const count = await getDepartmentStaffCount(schoolId, id);
    if (count > 0) throw new Error(`Cannot delete department. ${count} staff members are assigned to this department.`);
    const row = await qOne(sql`DELETE FROM departments WHERE school_id = ${schoolId} AND id = ${id} RETURNING id`);
    return row !== null;
}

// ===== COMPLIANCE QUERIES =====

export async function getAllComplianceDocuments(schoolId: string): Promise<ComplianceDocumentWithSignatures[]> {
    const docs = await qAll(sql`SELECT * FROM compliance_documents WHERE school_id = ${schoolId} ORDER BY upload_date DESC`);
    return Promise.all(docs.map(async doc => {
        const docCamel = toCamelCase<ComplianceDocument>(doc);
        const sigs = toCamelCase<DocumentSignature[]>(
            await qAll(sql`SELECT * FROM document_signatures WHERE document_id = ${docCamel.id} ORDER BY signed_at DESC NULLS LAST, staff_name`)
        );
        return { ...docCamel, signatures: sigs, totalSignatures: sigs.length, signedCount: sigs.filter(s => s.status === 'signed').length, pendingCount: sigs.filter(s => s.status === 'pending').length };
    }));
}

export async function getComplianceDocumentById(schoolId: string, id: string): Promise<ComplianceDocumentWithSignatures | null> {
    const doc = await qOne(sql`SELECT * FROM compliance_documents WHERE school_id = ${schoolId} AND id = ${id}`);
    if (!doc) return null;
    const docCamel = toCamelCase<ComplianceDocument>(doc);
    const sigs = toCamelCase<DocumentSignature[]>(
        await qAll(sql`SELECT * FROM document_signatures WHERE document_id = ${id} ORDER BY signed_at DESC NULLS LAST, staff_name`)
    );
    return { ...docCamel, signatures: sigs, totalSignatures: sigs.length, signedCount: sigs.filter(s => s.status === 'signed').length, pendingCount: sigs.filter(s => s.status === 'pending').length };
}

// ===== UTILITY =====

export function calculateTenure(startDate: string): string {
    const start = new Date(startDate);
    const now   = new Date();
    let totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) totalMonths--;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    if (y === 0) return `${m} ${m === 1 ? 'mo' : 'mos'}`;
    if (m === 0) return `${y} ${y === 1 ? 'yr' : 'yrs'}`;
    return `${y} ${y === 1 ? 'yr' : 'yrs'}, ${m} ${m === 1 ? 'mo' : 'mos'}`;
}

function isUniqueViolation(err: unknown): boolean {
    // PostgreSQL unique constraint violation code
    return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505';
}
