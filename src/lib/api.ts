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

export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'ApiError';
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
    throw new ApiError(401, 'Session expired');
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: authHeaders(),
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) throw new ApiError(response.status, `API Error: ${response.statusText}`);
    return response.json();
}

async function mutateAPI<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (response.status === 401) handleUnauthorized();
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, (errorData as { error?: string }).error || `API Error: ${response.statusText}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
}

// ===== AUTH API =====

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new ApiError(response.status, data.error || 'Login failed');
    return data;
}

export async function registerSchool(schoolName: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolName, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new ApiError(response.status, data.error || 'Registration failed');
    return data;
}

// ===== PASSWORD RESET API =====

export async function forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new ApiError(response.status, data.error || 'Request failed');
    return data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new ApiError(response.status, data.error || 'Request failed');
    return data;
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

export async function getStudentById(id: string): Promise<StudentWithDetails | null> {
    try {
        return await fetchAPI<StudentWithDetails>(`/students/${id}`);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
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
