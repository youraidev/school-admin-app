import type {
    Student,
    StudentWithDetails,
    Staff,
    StaffWithDetails,
    Certificate,
    CourseEvaluation,
    ComplianceDocumentWithSignatures,
    DashboardStats,
    CriticalAllergy,
    ContractIssue,
    PendingSignature,
    Department,
    AuthResponse,
    StaffQualification,
} from '../../shared/types/index.js';
import { getToken, clearAuth } from './auth';

const API_BASE_URL = '/api';

/**
 * API errors carry a stable error CODE (e.g. 'INVALID_CREDENTIALS'), not a
 * human-readable message. UI code translates codes via useErrorMessage().
 */
export class ApiError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(status: number, code: string) {
        super(code);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

function authHeaders(): HeadersInit {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(): never {
    clearAuth();
    // Dispatch event so AuthContext can clear user state and let RequireAuth navigate to /login
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new ApiError(401, 'SESSION_EXPIRED');
}

async function errorCodeFrom(response: Response): Promise<string> {
    const data = await response.json().catch(() => ({}));
    return (data as { error?: string }).error || 'UNKNOWN';
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: authHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new ApiError(response.status, await errorCodeFrom(response));
    return response.json();
}

async function mutateAPI<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new ApiError(response.status, await errorCodeFrom(response));
    if (response.status === 204) return undefined as T;
    return response.json();
}

// ===== AUTH API =====

async function parseAuthResponse(response: Response): Promise<Record<string, unknown>> {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(response.status, (data as { error?: string }).error || 'UNKNOWN');
    return data as Record<string, unknown>;
}

export async function loginUser(email: string, password: string, language?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, language }),
    });
    return parseAuthResponse(response) as Promise<AuthResponse>;
}

export async function registerSchool(schoolName: string, email: string, password: string, language?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolName, email, password, language }),
    });
    return parseAuthResponse(response) as Promise<AuthResponse>;
}

/** Persists the user's UI language so server-sent emails use it. */
export async function updatePreferredLanguage(language: string): Promise<void> {
    await mutateAPI<{ language: string }>('PATCH', '/auth/language', { language });
}

// ===== PASSWORD RESET API =====

export async function forgotPassword(email: string, language?: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language }),
    });
    return parseAuthResponse(response) as Promise<{ message: string }>;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    return parseAuthResponse(response) as Promise<{ message: string }>;
}

// ===== DASHBOARD API =====

export async function getDashboardStats(): Promise<DashboardStats> {
    return fetchAPI<DashboardStats>('/dashboard/stats');
}

export async function getCriticalAllergies(): Promise<CriticalAllergy[]> {
    return fetchAPI<CriticalAllergy[]>('/dashboard/critical-allergies');
}

export async function getContractIssues(): Promise<ContractIssue[]> {
    return fetchAPI<ContractIssue[]>('/dashboard/contract-issues');
}

export async function getPendingSignatures(): Promise<PendingSignature[]> {
    return fetchAPI<PendingSignature[]>('/dashboard/pending-signatures');
}

// ===== STUDENTS API =====

export async function getAllStudents(): Promise<Student[]> {
    return fetchAPI<Student[]>('/students');
}

export interface StudentStats {
    totalStudents: number;
    missingDocuments: number;
    specialNeeds: number;
    withAllergies: number;
    perClass: { className: string; count: number }[];
    newEnrollments: number;
}

export async function getStudentStats(): Promise<StudentStats> {
    return fetchAPI<StudentStats>('/students/stats');
}

export async function getStudentById(id: string): Promise<StudentWithDetails | null> {
    try {
        return await fetchAPI<StudentWithDetails>(`/students/${id}`);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function updatePickupNotes(
    studentId: string,
    pickupId: string,
    notes: string,
): Promise<{ notes: string }> {
    return mutateAPI<{ notes: string }>('PATCH', `/students/${studentId}/pickup/${pickupId}`, { notes });
}

// ===== STAFF API =====

export async function getAllStaff(): Promise<Staff[]> {
    return fetchAPI<Staff[]>('/staff');
}

export async function getStaffById(id: string): Promise<StaffWithDetails | null> {
    try {
        return await fetchAPI<StaffWithDetails>(`/staff/${id}`);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function addStaff(staffData: {
    firstName: string; lastName: string; email: string; role: string;
    department: string; position: string; rank?: string; photoUrl?: string;
    startDate: string; qualifications?: StaffQualification[];
}): Promise<Staff> {
    return mutateAPI<Staff>('POST', '/staff', staffData);
}

export async function updateStaff(id: string, staffData: {
    firstName: string; lastName: string; email: string; role: string;
    department: string; position: string; rank?: string; photoUrl?: string;
    startDate: string; qualifications?: StaffQualification[];
}): Promise<Staff> {
    return mutateAPI<Staff>('PUT', `/staff/${id}`, staffData);
}

export async function getQualificationSuggestions(): Promise<{ fields: string[]; institutions: string[] }> {
    return fetchAPI('/staff/qualifications/suggestions');
}

export async function updateCertificates(staffId: string, certificates: {
    name: string; issuer: string; date: string; fileUrl?: string;
}[]): Promise<Certificate[]> {
    return mutateAPI<Certificate[]>('PUT', `/staff/${staffId}/certificates`, { certificates });
}

export async function updateCourseEvaluations(staffId: string, evaluations: {
    courseName: string; rating: number; feedback?: string; date: string;
}[]): Promise<CourseEvaluation[]> {
    return mutateAPI<CourseEvaluation[]>('PUT', `/staff/${staffId}/evaluations`, { evaluations });
}

// ===== DEPARTMENTS API =====

export async function getAllDepartments(): Promise<Department[]> {
    return fetchAPI<Department[]>('/departments');
}

export async function getDepartmentById(id: string): Promise<Department | null> {
    try {
        return await fetchAPI<Department>(`/departments/${id}`);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function addDepartment(data: { name: string; description?: string }): Promise<Department> {
    return mutateAPI<Department>('POST', '/departments', data);
}

export async function updateDepartment(id: string, data: { name: string; description?: string }): Promise<Department> {
    return mutateAPI<Department>('PUT', `/departments/${id}`, data);
}

export async function deleteDepartment(id: string): Promise<void> {
    return mutateAPI<void>('DELETE', `/departments/${id}`);
}

// ===== COMPLIANCE API =====

export async function getAllComplianceDocuments(): Promise<ComplianceDocumentWithSignatures[]> {
    return fetchAPI<ComplianceDocumentWithSignatures[]>('/compliance');
}

export async function getComplianceDocumentById(id: string): Promise<ComplianceDocumentWithSignatures | null> {
    try {
        return await fetchAPI<ComplianceDocumentWithSignatures>(`/compliance/${id}`);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

// Tenure formatting moved to src/i18n/format.ts (formatTenure) so it is localized.
