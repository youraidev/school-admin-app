// TypeScript Type Definitions for School Admin Core

// ===== STUDENT MODULE =====

export type ContractStatus = 'active' | 'pending' | 'terminated' | 'expired';
export type AllergySeverity = 'low' | 'medium' | 'life-threatening';
export type AgreementType = 'photography' | 'travel' | 'other';

export interface Student {
    id: string;
    name: string;
    className: string;
    birthDate: string;
    photoUrl?: string;
    specialEducationNeeds?: string;
    healthStatus: string;
    medicalSupport?: string;
    contractStatus: ContractStatus;
    contractStartDate?: string;
    contractEndDate?: string;
    isPaid: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Allergy {
    id: string;
    studentId: string;
    name: string;
    severity: AllergySeverity;
    notes?: string;
}

export interface EmergencyContact {
    id: string;
    studentId?: string;
    staffId?: string;
    name: string;
    phone: string;
    relation: string;
    isPrimary: boolean;
}

export interface DocumentChecklist {
    id: string;
    studentId: string;
    name: string;
    isComplete: boolean;
    dueDate?: string;
}

export interface Agreement {
    id: string;
    studentId: string;
    type: AgreementType;
    name: string;
    status: string;
    signedDate?: string;
}

export interface AuthorizedPerson {
    id: string;
    studentId: string;
    name: string;
    phone: string;
    relation: string;
}

// Student with related data
export interface StudentWithDetails extends Student {
    allergies: Allergy[];
    emergencyContacts: EmergencyContact[];
    documentChecklist: DocumentChecklist[];
    agreements: Agreement[];
    authorizedPickup: AuthorizedPerson[];
}

// ===== STAFF MODULE =====

// Staff Types
export type Rank =
    | 'Assistant Teacher'
    | 'Teacher'
    | 'Senior Teacher'
    | 'Lead Teacher'
    | 'Master Teacher'
    | 'Department Head'
    | 'Vice Principal'
    | 'Principal';

export const RANK_OPTIONS: Rank[] = [
    'Assistant Teacher',
    'Teacher',
    'Senior Teacher',
    'Lead Teacher',
    'Master Teacher',
    'Department Head',
    'Vice Principal',
    'Principal'
];

export type Position =
    | 'Teacher'
    | 'PE Teacher'
    | 'Math Teacher'
    | 'English Teacher'
    | 'Science Teacher'
    | 'History Teacher'
    | 'Arts Teacher'
    | 'Librarian'
    | 'Counselor'
    | 'Special Education Teacher'
    | 'Admin'
    | 'Principal'
    | 'Other';

export const POSITION_OPTIONS: Position[] = [
    'Teacher',
    'PE Teacher',
    'Math Teacher',
    'English Teacher',
    'Science Teacher',
    'History Teacher',
    'Arts Teacher',
    'Librarian',
    'Counselor',
    'Special Education Teacher',
    'Admin',
    'Principal',
    'Other'
];

export type DegreeType =
    // Degrees
    | 'Diploma in Education'
    | 'Bachelor of Education (B.Ed)'
    | 'Bachelor’s Degree'
    | 'PGDE / PGCE'
    | 'Master of Education (M.Ed)'
    | 'Master’s Degree'
    | 'Doctor of Education (Ed.D)'
    | 'PhD'
    // Certifications
    | 'Teaching License'
    | 'QTS'
    | 'Montessori Certification'
    | 'Special Education Certification'
    | 'TESOL / TEFL'
    | 'IB Teacher Certification';

export const DEGREE_TYPES_GROUPED = [
    {
        label: "Degrees",
        options: [
            'Diploma in Education',
            'Bachelor of Education (B.Ed)',
            'Bachelor’s Degree',
            'PGDE / PGCE',
            'Master of Education (M.Ed)',
            'Master’s Degree',
            'Doctor of Education (Ed.D)',
            'PhD'
        ] as DegreeType[]
    },
    {
        label: "Teaching Certifications",
        options: [
            'Teaching License',
            'QTS',
            'Montessori Certification',
            'Special Education Certification',
            'TESOL / TEFL',
            'IB Teacher Certification'
        ] as DegreeType[]
    }
];

export const DEGREE_WEIGHTS: Record<DegreeType, number> = {
    'PhD': 1,
    'Doctor of Education (Ed.D)': 1,
    'Master’s Degree': 2,
    'Master of Education (M.Ed)': 2,
    'PGDE / PGCE': 3,
    'Bachelor’s Degree': 4,
    'Bachelor of Education (B.Ed)': 4,
    'Diploma in Education': 5,
    'Teaching License': 6,
    'QTS': 6,
    'Montessori Certification': 6,
    'Special Education Certification': 6,
    'TESOL / TEFL': 6,
    'IB Teacher Certification': 6
};

export interface StaffQualification {
    id?: number;
    staffId?: string;
    degreeType: DegreeType;
    fieldOfStudy: string;
    institution: string;
    year: number | null;
}

export interface Department {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    staffCount?: number;
}

export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    legacyName?: string | null;
    role: string;
    department: string; // Department ID
    departmentName?: string; // Department Name (joined)
    photoUrl?: string;
    email: string;
    phone?: string;
    salary?: number;
    salaryCoefficient?: number;
    startDate: string;
    position: Position;
    rank?: Rank;
    qualifications?: StaffQualification[];
    createdAt: string;
    updatedAt: string;
}

export interface Certificate {
    id: string;
    staffId: string;
    name: string;
    issuer: string;
    date: string;
    fileUrl?: string;
}

export interface CourseEvaluation {
    id: string;
    staffId: string;
    courseName: string;
    rating: number;
    feedback?: string;
    date: string;
}

export interface ExtraDuty {
    id: string;
    staffId: string;
    dutyName: string;
}

// Staff with related data
export interface StaffWithDetails extends Staff {
    certificates: Certificate[];
    courseEvaluations: CourseEvaluation[];
    extraDuties: ExtraDuty[];
    emergencyContacts: EmergencyContact[];
}

// ===== COMPLIANCE MODULE =====

export type TargetAudience = 'all' | 'department' | 'individual';
export type SignatureStatus = 'signed' | 'pending';

export interface ComplianceDocument {
    id: string;
    title: string;
    description: string;
    version: string;
    fileUrl?: string;
    uploadDate: string;
    dueDate?: string;
    targetAudience: TargetAudience;
    targetDepartments?: string;
    targetIndividuals?: string;
    createdAt: string;
}

export interface DocumentSignature {
    id: string;
    documentId: string;
    staffId: string;
    staffName: string;
    status: SignatureStatus;
    signedAt?: string;
}

// Compliance document with signatures
export interface ComplianceDocumentWithSignatures extends ComplianceDocument {
    signatures: DocumentSignature[];
    totalSignatures: number;
    signedCount: number;
    pendingCount: number;
}

// ===== DASHBOARD MODULE =====

export interface DashboardStats {
    totalStudents: number;
    totalStaff: number;
    pendingContracts: number;
    pendingSignatures: number;
}

export interface CriticalAllergy {
    studentId: string;
    studentName: string;
    allergen: string;
    notes?: string;
}

export interface ContractIssue {
    studentId: string;
    studentName: string;
    issue: string;
    status: ContractStatus;
}

export interface PendingSignature {
    documentId: string;
    documentTitle: string;
    signedCount: number;
    totalCount: number;
}
