import {
    pgTable, uuid, text, boolean, doublePrecision,
    integer, serial, timestamp, unique,
} from 'drizzle-orm/pg-core';

// ===== TENANT TABLES =====

export const schools = pgTable('schools', {
    id:        uuid('id').primaryKey().defaultRandom(),
    name:      text('name').notNull(),
    slug:      text('slug').notNull().unique(),
    plan:      text('plan').notNull().default('trial'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const users = pgTable('users', {
    id:           uuid('id').primaryKey().defaultRandom(),
    schoolId:     uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    email:        text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role:         text('role').notNull().default('staff'),
    createdAt:    timestamp('created_at', { mode: 'string' }).defaultNow(),
});

// ===== STAFF MODULE (defined before students so emergency_contacts can ref both) =====

export const departments = pgTable('departments', {
    id:          uuid('id').primaryKey().defaultRandom(),
    schoolId:    uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name:        text('name').notNull(),
    description: text('description'),
    createdAt:   timestamp('created_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
    schoolNameUnique: unique('departments_school_name_unique').on(t.schoolId, t.name),
}));

export const staff = pgTable('staff', {
    id:                uuid('id').primaryKey().defaultRandom(),
    schoolId:          uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    firstName:         text('first_name').notNull(),
    lastName:          text('last_name').notNull(),
    position:          text('position').notNull(),
    legacyName:        text('legacy_name'),
    role:              text('role').notNull(),
    department:        uuid('department').notNull().references(() => departments.id),
    photoUrl:          text('photo_url'),
    email:             text('email').notNull(),
    phone:             text('phone'),
    salary:            doublePrecision('salary'),
    salaryCoefficient: doublePrecision('salary_coefficient'),
    startDate:         text('start_date').notNull(),
    qualification:     text('qualification'),
    rank:              text('rank'),
    createdAt:         timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt:         timestamp('updated_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
    schoolEmailUnique: unique('staff_school_email_unique').on(t.schoolId, t.email),
}));

export const staffQualifications = pgTable('staff_qualifications', {
    id:           serial('id').primaryKey(),
    staffId:      uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
    degreeType:   text('degree_type').notNull(),
    fieldOfStudy: text('field_of_study').notNull(),
    institution:  text('institution').notNull(),
    year:         integer('year'),
});

export const certificates = pgTable('certificates', {
    id:       uuid('id').primaryKey().defaultRandom(),
    schoolId: uuid('school_id').notNull(),
    staffId:  uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
    name:     text('name').notNull(),
    issuer:   text('issuer').notNull(),
    date:     text('date').notNull(),
    fileUrl:  text('file_url'),
});

export const courseEvaluations = pgTable('course_evaluations', {
    id:         uuid('id').primaryKey().defaultRandom(),
    schoolId:   uuid('school_id').notNull(),
    staffId:    uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
    courseName: text('course_name').notNull(),
    rating:     doublePrecision('rating').notNull(),
    feedback:   text('feedback'),
    date:       text('date').notNull(),
});

export const extraDuties = pgTable('extra_duties', {
    id:       uuid('id').primaryKey().defaultRandom(),
    schoolId: uuid('school_id').notNull(),
    staffId:  uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
    dutyName: text('duty_name').notNull(),
});

// ===== STUDENT MODULE =====

export const students = pgTable('students', {
    id:                    uuid('id').primaryKey().defaultRandom(),
    schoolId:              uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name:                  text('name').notNull(),
    className:             text('class_name').notNull(),
    birthDate:             text('birth_date').notNull(),
    photoUrl:              text('photo_url'),
    specialEducationNeeds: text('special_education_needs'),
    healthStatus:          text('health_status').default('Good'),
    medicalSupport:        text('medical_support'),
    contractStatus:        text('contract_status').default('active'),
    contractStartDate:     text('contract_start_date'),
    contractEndDate:       text('contract_end_date'),
    isPaid:                boolean('is_paid').default(true),
    createdAt:             timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt:             timestamp('updated_at', { mode: 'string' }).defaultNow(),
});

export const allergies = pgTable('allergies', {
    id:        uuid('id').primaryKey().defaultRandom(),
    schoolId:  uuid('school_id').notNull(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    name:      text('name').notNull(),
    severity:  text('severity').default('low'),
    notes:     text('notes'),
});

export const emergencyContacts = pgTable('emergency_contacts', {
    id:        uuid('id').primaryKey().defaultRandom(),
    schoolId:  uuid('school_id').notNull(),
    studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),
    staffId:   uuid('staff_id').references(() => staff.id, { onDelete: 'cascade' }),
    name:      text('name').notNull(),
    phone:     text('phone').notNull(),
    relation:  text('relation').notNull(),
    isPrimary: boolean('is_primary').default(false),
});

export const documentChecklist = pgTable('document_checklist', {
    id:         uuid('id').primaryKey().defaultRandom(),
    schoolId:   uuid('school_id').notNull(),
    studentId:  uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    name:       text('name').notNull(),
    isComplete: boolean('is_complete').default(false),
    dueDate:    text('due_date'),
});

export const agreements = pgTable('agreements', {
    id:         uuid('id').primaryKey().defaultRandom(),
    schoolId:   uuid('school_id').notNull(),
    studentId:  uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    type:       text('type').default('other'),
    name:       text('name').notNull(),
    status:     text('status').notNull(),
    signedDate: text('signed_date'),
});

export const authorizedPickup = pgTable('authorized_pickup', {
    id:        uuid('id').primaryKey().defaultRandom(),
    schoolId:  uuid('school_id').notNull(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    name:      text('name').notNull(),
    phone:     text('phone').notNull(),
    relation:  text('relation').notNull(),
});

// ===== COMPLIANCE MODULE =====

export const complianceDocuments = pgTable('compliance_documents', {
    id:                uuid('id').primaryKey().defaultRandom(),
    schoolId:          uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    title:             text('title').notNull(),
    description:       text('description').notNull(),
    version:           text('version').notNull(),
    fileUrl:           text('file_url'),
    uploadDate:        text('upload_date').notNull(),
    dueDate:           text('due_date'),
    targetAudience:    text('target_audience').default('all'),
    targetDepartments: text('target_departments'),
    targetIndividuals: text('target_individuals'),
    createdAt:         timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const documentSignatures = pgTable('document_signatures', {
    id:         uuid('id').primaryKey().defaultRandom(),
    schoolId:   uuid('school_id').notNull(),
    documentId: uuid('document_id').notNull().references(() => complianceDocuments.id, { onDelete: 'cascade' }),
    staffId:    uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
    staffName:  text('staff_name').notNull(),
    status:     text('status').default('pending'),
    signedAt:   text('signed_at'),
});
