import { getDatabase, toCamelCase, convertBooleans } from './database';
import type {
    Student,
    StudentWithDetails,
    Allergy,
    EmergencyContact,
    DocumentChecklist,
    Agreement,
    AuthorizedPerson,
    Staff,
    StaffWithDetails,
    Certificate,
    CourseEvaluation,
    ExtraDuty,
    ComplianceDocument,
    ComplianceDocumentWithSignatures,
    DocumentSignature,
    DashboardStats,
    CriticalAllergy,
    ContractIssue,
    PendingSignature,
    Department,
    StaffQualification,
    Rank,
    Position,
} from '../shared/types';

const db = getDatabase();

// ===== NORMALIZATION HELPERS =====
function normalizeText(text: string): string {
    if (!text) return text;
    // Trim, replace multiple interior spaces with a single space, and capitalize first letter of words where appropriate
    return text
        .trim()
        .replace(/\s+/g, ' ')
        // Basic Title Case formatting:
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ===== DASHBOARD QUERIES =====

export function getDashboardStats(): DashboardStats {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const totalStaff = db.prepare('SELECT COUNT(*) as count FROM staff').get() as { count: number };
    const pendingContracts = db.prepare(
        "SELECT COUNT(*) as count FROM students WHERE contract_status IN ('pending', 'expired') OR is_paid = 0"
    ).get() as { count: number };
    const pendingSignatures = db.prepare(
        "SELECT COUNT(DISTINCT document_id) as count FROM document_signatures WHERE status = 'pending'"
    ).get() as { count: number };

    return {
        totalStudents: totalStudents.count,
        totalStaff: totalStaff.count,
        pendingContracts: pendingContracts.count,
        pendingSignatures: pendingSignatures.count,
    };
}

export function getCriticalAllergies(): CriticalAllergy[] {
    const rows = db.prepare(`
    SELECT 
      s.id as student_id,
      s.name as student_name,
      a.name as allergen,
      a.notes
    FROM allergies a
    JOIN students s ON a.student_id = s.id
    WHERE a.severity = 'life-threatening'
    ORDER BY s.name
  `).all();

    return toCamelCase<CriticalAllergy[]>(rows);
}

export function getContractIssues(): ContractIssue[] {
    const rows = db.prepare(`
    SELECT 
      id as student_id,
      name as student_name,
      CASE 
        WHEN is_paid = 0 THEN 'Unpaid Contract'
        WHEN contract_status = 'pending' THEN 'Pending Contract'
        WHEN contract_status = 'expired' THEN 'Expired Contract'
        ELSE 'Contract Issue'
      END as issue,
      contract_status as status
    FROM students
    WHERE contract_status IN ('pending', 'expired') OR is_paid = 0
    ORDER BY name
  `).all();

    return rows.map(row => convertBooleans(toCamelCase<ContractIssue>(row), []));
}

export function getPendingSignatures(): PendingSignature[] {
    const rows = db.prepare(`
    SELECT 
      cd.id as document_id,
      cd.title as document_title,
      COUNT(CASE WHEN ds.status = 'signed' THEN 1 END) as signed_count,
      COUNT(*) as total_count
    FROM compliance_documents cd
    JOIN document_signatures ds ON cd.id = ds.document_id
    GROUP BY cd.id, cd.title
    HAVING COUNT(CASE WHEN ds.status = 'pending' THEN 1 END) > 0
    ORDER BY cd.upload_date DESC
  `).all();

    return toCamelCase<PendingSignature[]>(rows);
}

// ===== STUDENT QUERIES =====

export function getAllStudents(): Student[] {
    const rows = db.prepare(`
    SELECT * FROM students ORDER BY name
  `).all();

    return rows.map(row => convertBooleans(toCamelCase<Student>(row), ['isPaid']));
}

export function getStudentById(id: string): StudentWithDetails | null {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) return null;

    const allergies = db.prepare('SELECT * FROM allergies WHERE student_id = ? ORDER BY severity DESC, name').all(id);
    const emergencyContacts = db.prepare('SELECT * FROM emergency_contacts WHERE student_id = ? ORDER BY is_primary DESC, name').all(id);
    const documentChecklist = db.prepare('SELECT * FROM document_checklist WHERE student_id = ? ORDER BY due_date').all(id);
    const agreements = db.prepare('SELECT * FROM agreements WHERE student_id = ? ORDER BY type').all(id);
    const authorizedPickup = db.prepare('SELECT * FROM authorized_pickup WHERE student_id = ? ORDER BY name').all(id);

    return {
        ...convertBooleans(toCamelCase<Student>(student), ['isPaid']),
        allergies: toCamelCase<Allergy[]>(allergies),
        emergencyContacts: emergencyContacts.map(c => convertBooleans(toCamelCase<EmergencyContact>(c), ['isPrimary'])),
        documentChecklist: documentChecklist.map(d => convertBooleans(toCamelCase<DocumentChecklist>(d), ['isComplete'])),
        agreements: toCamelCase<Agreement[]>(agreements),
        authorizedPickup: toCamelCase<AuthorizedPerson[]>(authorizedPickup),
    };
}

// ===== NORMALIZATION AND AUTOSUGGESTION QUERIES =====

export function getQualificationSuggestions() {
    const fields = db.prepare(`SELECT DISTINCT field_of_study FROM staff_qualifications ORDER BY field_of_study COLLATE NOCASE ASC`).all() as { field_of_study: string }[];
    const institutions = db.prepare(`SELECT DISTINCT institution FROM staff_qualifications ORDER BY institution COLLATE NOCASE ASC`).all() as { institution: string }[];

    return {
        fields: fields.map(f => f.field_of_study),
        institutions: institutions.map(i => i.institution)
    };
}

// ===== STAFF QUERIES =====

export function getAllStaff(): Staff[] {
    const rows = db.prepare(`
    SELECT s.*, d.name as department_name 
    FROM staff s
    LEFT JOIN departments d ON s.department = d.id
    ORDER BY s.first_name, s.last_name
  `).all();

    return rows.map(row => {
        const staffCamel = toCamelCase<Staff>(row);
        const qualifications = db.prepare(`SELECT * FROM staff_qualifications WHERE staff_id = ? ORDER BY year DESC NULLS LAST`).all(staffCamel.id);
        return {
            ...staffCamel,
            qualifications: toCamelCase<StaffQualification[]>(qualifications)
        };
    });
}

export function getStaffById(id: string): StaffWithDetails | null {
    const staff = db.prepare(`
        SELECT s.*, d.name as department_name 
        FROM staff s
        LEFT JOIN departments d ON s.department = d.id
        WHERE s.id = ?
    `).get(id);

    if (!staff) return null;

    const qualifications = db.prepare('SELECT * FROM staff_qualifications WHERE staff_id = ? ORDER BY year DESC NULLS LAST').all(id);
    const certificates = db.prepare('SELECT * FROM certificates WHERE staff_id = ? ORDER BY date DESC').all(id);
    const courseEvaluations = db.prepare('SELECT * FROM course_evaluations WHERE staff_id = ? ORDER BY date DESC').all(id);
    const extraDuties = db.prepare('SELECT * FROM extra_duties WHERE staff_id = ? ORDER BY duty_name').all(id);
    const emergencyContacts = db.prepare('SELECT * FROM emergency_contacts WHERE staff_id = ? ORDER BY is_primary DESC, name').all(id);

    return {
        ...toCamelCase<Staff>(staff),
        qualifications: toCamelCase<StaffQualification[]>(qualifications),
        certificates: toCamelCase<Certificate[]>(certificates),
        courseEvaluations: toCamelCase<CourseEvaluation[]>(courseEvaluations),
        extraDuties: toCamelCase<ExtraDuty[]>(extraDuties),
        emergencyContacts: emergencyContacts.map(c => convertBooleans(toCamelCase<EmergencyContact>(c), ['isPrimary'])),
    };
}

export function addStaff(staffData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    position: Position;
    rank?: Rank;
    photoUrl?: string;
    startDate: string;
    qualifications?: StaffQualification[];
}): Staff {
    const id = `staff-${Date.now()}`;

    const transaction = db.transaction((data) => {
        const insertStaffStmt = db.prepare(`
            INSERT INTO staff (id, first_name, last_name, position, email, role, department, rank, photo_url, start_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertStaffStmt.run(
            id,
            data.firstName,
            data.lastName,
            data.position,
            data.email,
            data.role,
            data.department,
            data.rank || null,
            data.photoUrl || null,
            data.startDate
        );

        if (data.qualifications && data.qualifications.length > 0) {
            const insertQualStmt = db.prepare(`
                INSERT INTO staff_qualifications (staff_id, degree_type, field_of_study, institution, year)
                VALUES (?, ?, ?, ?, ?)
            `);
            for (const qual of data.qualifications) {
                insertQualStmt.run(
                    id,
                    qual.degreeType,
                    normalizeText(qual.fieldOfStudy),
                    normalizeText(qual.institution),
                    qual.year || null
                );
            }
        }
    });

    transaction(staffData);

    const newStaff = db.prepare(`
        SELECT s.*, d.name as department_name 
        FROM staff s
        LEFT JOIN departments d ON s.department = d.id
        WHERE s.id = ?
    `).get(id);

    const staffCamel = toCamelCase<Staff>(newStaff);
    const qualifications = db.prepare(`SELECT * FROM staff_qualifications WHERE staff_id = ? ORDER BY year DESC NULLS LAST`).all(id);
    return {
        ...staffCamel,
        qualifications: toCamelCase<StaffQualification[]>(qualifications)
    };
}

export function updateStaff(id: string, staffData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    position: Position;
    rank?: Rank;
    photoUrl?: string;
    startDate: string;
    qualifications?: StaffQualification[];
}): Staff | null {
    let resultChanges = 0;

    const transaction = db.transaction((data) => {
        const updateStaffStmt = db.prepare(`
            UPDATE staff 
            SET first_name = ?, last_name = ?, position = ?, email = ?, role = ?, department = ?, rank = ?, photo_url = ?, start_date = ?
            WHERE id = ?
        `);

        const result = updateStaffStmt.run(
            data.firstName,
            data.lastName,
            data.position,
            data.email,
            data.role,
            data.department,
            data.rank || null,
            data.photoUrl || null,
            data.startDate,
            id
        );

        resultChanges = result.changes;

        if (resultChanges > 0 && data.qualifications !== undefined) {
            // Delete existing
            db.prepare(`DELETE FROM staff_qualifications WHERE staff_id = ?`).run(id);

            // Insert new array
            if (data.qualifications.length > 0) {
                const insertQualStmt = db.prepare(`
                    INSERT INTO staff_qualifications (staff_id, degree_type, field_of_study, institution, year)
                    VALUES (?, ?, ?, ?, ?)
                 `);
                for (const qual of data.qualifications) {
                    insertQualStmt.run(
                        id,
                        qual.degreeType,
                        normalizeText(qual.fieldOfStudy),
                        normalizeText(qual.institution),
                        qual.year || null
                    );
                }
            }
        }
    });

    transaction(staffData);

    if (resultChanges === 0) return null;

    const updatedStaff = db.prepare(`
        SELECT s.*, d.name as department_name 
        FROM staff s
        LEFT JOIN departments d ON s.department = d.id
        WHERE s.id = ?
    `).get(id);

    const staffCamel = toCamelCase<Staff>(updatedStaff);
    const qualifications = db.prepare(`SELECT * FROM staff_qualifications WHERE staff_id = ? ORDER BY year DESC NULLS LAST`).all(id);
    return {
        ...staffCamel,
        qualifications: toCamelCase<StaffQualification[]>(qualifications)
    };
}

export function updateCertificates(staffId: string, certs: {
    name: string;
    issuer: string;
    date: string;
    fileUrl?: string;
}[]): Certificate[] {
    const transaction = db.transaction(() => {
        db.prepare(`DELETE FROM certificates WHERE staff_id = ?`).run(staffId);
        const insertStmt = db.prepare(`
            INSERT INTO certificates (id, staff_id, name, issuer, date, file_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const cert of certs) {
            insertStmt.run(
                `cert-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                staffId,
                cert.name.trim(),
                cert.issuer.trim(),
                cert.date,
                cert.fileUrl || null
            );
        }
    });
    transaction();
    const rows = db.prepare('SELECT * FROM certificates WHERE staff_id = ? ORDER BY date DESC').all(staffId);
    return toCamelCase<Certificate[]>(rows);
}

export function updateCourseEvaluations(staffId: string, evals: {
    courseName: string;
    rating: number;
    feedback?: string;
    date: string;
}[]): CourseEvaluation[] {
    const transaction = db.transaction(() => {
        db.prepare(`DELETE FROM course_evaluations WHERE staff_id = ?`).run(staffId);
        const insertStmt = db.prepare(`
            INSERT INTO course_evaluations (id, staff_id, course_name, rating, feedback, date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const ev of evals) {
            insertStmt.run(
                `eval-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                staffId,
                ev.courseName.trim(),
                Math.min(5, Math.max(0, ev.rating)),
                ev.feedback?.trim() || null,
                ev.date,
            );
        }
    });
    transaction();
    const rows = db.prepare('SELECT * FROM course_evaluations WHERE staff_id = ? ORDER BY date DESC').all(staffId);
    return toCamelCase<CourseEvaluation[]>(rows);
}

// ===== DEPARTMENT QUERIES =====

export function getAllDepartments(): Department[] {
    const rows = db.prepare(`
        SELECT d.*, COUNT(s.id) as staff_count
        FROM departments d
        LEFT JOIN staff s ON d.id = s.department
        GROUP BY d.id
        ORDER BY d.name ASC
    `).all();
    return toCamelCase<Department[]>(rows);
}

export function getDepartmentById(id: string): Department | null {
    const dept = db.prepare(`
        SELECT d.*, COUNT(s.id) as staff_count
        FROM departments d
        LEFT JOIN staff s ON d.id = s.department
        WHERE d.id = ?
        GROUP BY d.id
    `).get(id);
    return dept ? toCamelCase<Department>(dept) : null;
}

export function addDepartment(data: { name: string; description?: string }): Department {
    if (!data.name || data.name.trim() === '') {
        throw new Error('Department name is required');
    }
    if (data.name.length > 100) {
        throw new Error('Department name exceeds 100 characters');
    }
    if (data.description && data.description.length > 500) {
        throw new Error('Description exceeds 500 characters');
    }

    const id = `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const stmt = db.prepare(`
        INSERT INTO departments (id, name, description)
        VALUES (?, ?, ?)
    `);

    try {
        stmt.run(id, data.name.trim(), data.description || null);
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Department with this name already exists');
        }
        throw err;
    }

    const newDept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
    return toCamelCase<Department>(newDept);
}

export function updateDepartment(id: string, data: { name: string; description?: string }): Department | null {
    if (!data.name || data.name.trim() === '') {
        throw new Error('Department name is required');
    }
    if (data.name.length > 100) {
        throw new Error('Department name exceeds 100 characters');
    }
    if (data.description && data.description.length > 500) {
        throw new Error('Description exceeds 500 characters');
    }

    const stmt = db.prepare(`
        UPDATE departments 
        SET name = ?, description = ?
        WHERE id = ?
    `);

    try {
        const result = stmt.run(data.name.trim(), data.description || null, id);
        if (result.changes === 0) return null;
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Department with this name already exists');
        }
        throw err;
    }

    const updatedDept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
    return toCamelCase<Department>(updatedDept);
}

export function getDepartmentStaffCount(id: string): number {
    const result = db.prepare('SELECT COUNT(*) as count FROM staff WHERE department = ?').get(id) as { count: number };
    return result.count;
}

export function deleteDepartment(id: string): boolean {
    // Check for existing staff
    const staffCount = getDepartmentStaffCount(id);
    if (staffCount > 0) {
        throw new Error(`Cannot delete department. ${staffCount} staff members are assigned to this department.`);
    }

    const stmt = db.prepare('DELETE FROM departments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}

// Calculate tenure from start date
export function calculateTenure(startDate: string): string {
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();

    let totalMonths = years * 12 + months;
    if (now.getDate() < start.getDate()) {
        totalMonths--;
    }

    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;

    if (y === 0) {
        return `${m} ${m === 1 ? 'mo' : 'mos'}`;
    } else if (m === 0) {
        return `${y} ${y === 1 ? 'yr' : 'yrs'}`;
    } else {
        return `${y} ${y === 1 ? 'yr' : 'yrs'}, ${m} ${m === 1 ? 'mo' : 'mos'}`;
    }
}

// ===== COMPLIANCE QUERIES =====

export function getAllComplianceDocuments(): ComplianceDocumentWithSignatures[] {
    const documents = db.prepare(`
    SELECT * FROM compliance_documents ORDER BY upload_date DESC
  `).all();

    return documents.map(doc => {
        const docCamel = toCamelCase<ComplianceDocument>(doc);
        const signatures = db.prepare(`
      SELECT * FROM document_signatures WHERE document_id = ? ORDER BY signed_at DESC NULLS LAST, staff_name
    `).all(docCamel.id);

        const signaturesCamel = toCamelCase<DocumentSignature[]>(signatures);
        const signedCount = signaturesCamel.filter(s => s.status === 'signed').length;

        return {
            ...docCamel,
            signatures: signaturesCamel,
            totalSignatures: signaturesCamel.length,
            signedCount,
            pendingCount: signaturesCamel.length - signedCount,
        };
    });
}

export function getComplianceDocumentById(id: string): ComplianceDocumentWithSignatures | null {
    const doc = db.prepare('SELECT * FROM compliance_documents WHERE id = ?').get(id);
    if (!doc) return null;

    const docCamel = toCamelCase<ComplianceDocument>(doc);
    const signatures = db.prepare(`
    SELECT * FROM document_signatures WHERE document_id = ? ORDER BY signed_at DESC NULLS LAST, staff_name
  `).all(id);

    const signaturesCamel = toCamelCase<DocumentSignature[]>(signatures);
    const signedCount = signaturesCamel.filter(s => s.status === 'signed').length;

    return {
        ...docCamel,
        signatures: signaturesCamel,
        totalSignatures: signaturesCamel.length,
        signedCount,
        pendingCount: signaturesCamel.length - signedCount,
    };
}
