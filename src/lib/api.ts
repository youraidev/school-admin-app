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
} from '../../shared/types';

const API_BASE_URL = '/api';

// Helper function for API calls
async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}

// Dashboard API
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

// Students API
export async function getAllStudents(): Promise<Student[]> {
    return fetchAPI<Student[]>('/students');
}

export async function getStudentById(id: string): Promise<StudentWithDetails | null> {
    try {
        return await fetchAPI<StudentWithDetails>(`/students/${id}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
            return null;
        }
        throw error;
    }
}

// Staff API
export async function getAllStaff(): Promise<Staff[]> {
    return fetchAPI<Staff[]>('/staff');
}

export async function getStaffById(id: string): Promise<StaffWithDetails | null> {
    try {
        return await fetchAPI<StaffWithDetails>(`/staff/${id}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
            return null;
        }
        throw error;
    }
}

// Compliance API
export async function getAllComplianceDocuments(): Promise<ComplianceDocumentWithSignatures[]> {
    return fetchAPI<ComplianceDocumentWithSignatures[]>('/compliance');
}

export async function getComplianceDocumentById(id: string): Promise<ComplianceDocumentWithSignatures | null> {
    try {
        return await fetchAPI<ComplianceDocumentWithSignatures>(`/compliance/${id}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
            return null;
        }
        throw error;
    }
}

// Helper function to calculate tenure (moved from queries)
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

export async function addStaff(staffData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    position: string;
    rank?: string;
    photoUrl?: string;
    startDate: string;
    qualifications?: any[]; // To avoid tight coupling with shared types here, frontend will pass StaffQualification[]
}): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function updateStaff(id: string, staffData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    position: string;
    rank?: string;
    photoUrl?: string;
    startDate: string;
    qualifications?: any[];
}): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function getQualificationSuggestions(): Promise<{ fields: string[], institutions: string[] }> {
    return fetchAPI<{ fields: string[], institutions: string[] }>('/staff/qualifications/suggestions');
}

export async function updateCertificates(staffId: string, certificates: {
    name: string;
    issuer: string;
    date: string;
    fileUrl?: string;
}[]): Promise<Certificate[]> {
    const response = await fetch(`${API_BASE_URL}/staff/${staffId}/certificates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificates }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }
    return response.json();
}

export async function updateCourseEvaluations(staffId: string, evaluations: {
    courseName: string;
    rating: number;
    feedback?: string;
    date: string;
}[]): Promise<CourseEvaluation[]> {
    const response = await fetch(`${API_BASE_URL}/staff/${staffId}/evaluations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluations }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }
    return response.json();
}

// Department API

export async function getAllDepartments(): Promise<Department[]> {
    return fetchAPI<Department[]>('/departments');
}

export async function getDepartmentById(id: string): Promise<Department | null> {
    try {
        return await fetchAPI<Department>(`/departments/${id}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
            return null;
        }
        throw error;
    }
}

export async function addDepartment(data: { name: string; description?: string }): Promise<Department> {
    const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function updateDepartment(id: string, data: { name: string; description?: string }): Promise<Department> {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteDepartment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }
}
