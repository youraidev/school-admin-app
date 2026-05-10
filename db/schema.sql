-- School Admin Core Database Schema

-- Students Table
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    photo_url TEXT,
    special_education_needs TEXT,
    health_status TEXT DEFAULT 'Good',
    medical_support TEXT,
    contract_status TEXT CHECK(contract_status IN ('active', 'pending', 'terminated', 'expired')) DEFAULT 'active',
    contract_start_date TEXT,
    contract_end_date TEXT,
    is_paid INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Allergies Table
CREATE TABLE allergies (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    name TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('low', 'medium', 'life-threatening')) DEFAULT 'low',
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Emergency Contacts Table (polymorphic: can link to student OR staff)
CREATE TABLE emergency_contacts (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    staff_id TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relation TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    CHECK ((student_id IS NOT NULL AND staff_id IS NULL) OR (student_id IS NULL AND staff_id IS NOT NULL))
);

-- Document Checklist Table
CREATE TABLE document_checklist (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_complete INTEGER DEFAULT 0,
    due_date TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Agreements Table
CREATE TABLE agreements (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('photography', 'travel', 'other')) DEFAULT 'other',
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    signed_date TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Authorized Pickup Table
CREATE TABLE authorized_pickup (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relation TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Staff Table
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

-- Departments Table
CREATE TABLE departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Staff Qualifications Table
CREATE TABLE staff_qualifications (
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

-- Certificates Table
CREATE TABLE certificates (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date TEXT NOT NULL,
    file_url TEXT,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Course Evaluations Table
CREATE TABLE course_evaluations (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    rating REAL NOT NULL,
    feedback TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Extra Duties Table
CREATE TABLE extra_duties (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    duty_name TEXT NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Compliance Documents Table
CREATE TABLE compliance_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    version TEXT NOT NULL,
    file_url TEXT,
    upload_date TEXT NOT NULL,
    due_date TEXT,
    target_audience TEXT CHECK(target_audience IN ('all', 'department', 'individual')) DEFAULT 'all',
    target_departments TEXT,
    target_individuals TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Document Signatures Table
CREATE TABLE document_signatures (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    status TEXT CHECK(status IN ('signed', 'pending')) DEFAULT 'pending',
    signed_at TEXT,
    FOREIGN KEY (document_id) REFERENCES compliance_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_students_contract_status ON students(contract_status);
CREATE INDEX idx_allergies_student_id ON allergies(student_id);
CREATE INDEX idx_allergies_severity ON allergies(severity);
CREATE INDEX idx_emergency_contacts_student_id ON emergency_contacts(student_id);
CREATE INDEX idx_emergency_contacts_staff_id ON emergency_contacts(staff_id);
CREATE INDEX idx_document_checklist_student_id ON document_checklist(student_id);
CREATE INDEX idx_agreements_student_id ON agreements(student_id);
CREATE INDEX idx_authorized_pickup_student_id ON authorized_pickup(student_id);
CREATE INDEX idx_certificates_staff_id ON certificates(staff_id);
CREATE INDEX idx_course_evaluations_staff_id ON course_evaluations(staff_id);
CREATE INDEX idx_extra_duties_staff_id ON extra_duties(staff_id);
CREATE INDEX idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX idx_document_signatures_staff_id ON document_signatures(staff_id);
CREATE INDEX idx_document_signatures_status ON document_signatures(status);
CREATE INDEX idx_staff_qual_staff_id ON staff_qualifications(staff_id);
CREATE INDEX idx_staff_qual_field ON staff_qualifications(field_of_study);
CREATE INDEX idx_staff_qual_inst ON staff_qualifications(institution);
CREATE INDEX idx_staff_qual_inst_field ON staff_qualifications(institution, field_of_study);
