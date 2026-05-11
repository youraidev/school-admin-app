# Naming Conventions Specification

## 1. Files & Directories

| Context | Convention | Example |
|---------|-----------|---------|
| React components | `PascalCase.tsx` | `StaffCard.tsx`, `AppLayout.tsx` |
| React pages | `PascalCase.tsx` with `Page` suffix | `StaffPage.tsx`, `AddStaffPage.tsx` |
| Server route files | `camelCase.ts` matching domain | `staff.ts`, `compliance.ts` |
| Server utility files | `camelCase.ts` | `auth.ts`, `queries.ts` |
| Spec files | `kebab-case.md` | `api-contracts.md` |
| Directories | `camelCase` for code, `kebab-case` for docs | `components/`, `spec/` |

---

## 2. TypeScript Identifiers

### Variables & Parameters
- `camelCase` for all variables, function parameters, and local constants.
- Descriptive names — no single-letter variables except loop indices (`i`, `j`) or short lambdas.

```ts
// Good
const staffMember = await queries.getStaffById(schoolId, id);
const totalMonths = years * 12 + months;

// Bad
const s = await q.get(sid, id);
const x = y * 12 + z;
```

### Functions
- `camelCase` for all functions.
- Action verbs for mutations: `add`, `update`, `delete`, `create`, `register`.
- Question verbs for booleans: `is`, `has`, `can`, `should`.
- Retrieval verbs: `get`, `fetch`, `find`, `load`.

```ts
// Good
async function getStaffById(schoolId: string, staffId: string)
async function addStaff(schoolId: string, data: StaffInput)
async function updateCertificates(schoolId: string, staffId: string, certs: Certificate[])
function isUniqueViolation(error: unknown): boolean
```

### Types & Interfaces
- `PascalCase` for types and interfaces.
- Suffix `With` for enriched/joined versions: `StaffWithDetails`, `StudentWithDetails`.
- Suffix `Input` for create/update payloads (future): `StaffInput`, `DepartmentInput`.
- Suffix `Response` for API response shapes: `AuthResponse`.

```ts
interface StaffWithDetails extends Staff {
    certificates: Certificate[];
    courseEvaluations: CourseEvaluation[];
}
```

### Constants
- `SCREAMING_SNAKE_CASE` for module-level constants that are not runtime values.

```ts
const JWT_EXPIRES_IN = '7d';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const RANK_OPTIONS: Rank[] = [...];
```

### Enums (not used — use union types)
```ts
// Good (union type)
type ContractStatus = 'active' | 'pending' | 'terminated' | 'expired';

// Bad (enum)
enum ContractStatus { Active = 'active', ... }
```

---

## 3. Database Column Names

All database columns use `snake_case` (PostgreSQL convention):

| TypeScript (camelCase) | DB column (snake_case) |
|-----------------------|----------------------|
| `schoolId` | `school_id` |
| `firstName` | `first_name` |
| `passwordHash` | `password_hash` |
| `createdAt` | `created_at` |
| `contractStartDate` | `contract_start_date` |

Drizzle maps these automatically when using its ORM methods.

---

## 4. React Components

### Component props
- Props interface named `<ComponentName>Props`

```tsx
interface StaffListProps {
    staff: Staff[];
    loading: boolean;
    onSelect?: (id: string) => void;
}

export function StaffList({ staff, loading, onSelect }: StaffListProps) { ... }
```

### Event handlers
- Prefix with `handle` for handler functions: `handleSubmit`, `handleDelete`, `handleInclude`
- Prefix with `on` for callback props: `onSelect`, `onDelete`, `onSave`

```tsx
// Component receives:
interface Props { onDelete: (id: string) => void; }

// Component defines internally:
function handleDelete(id: string) {
    onDelete(id);
}
```

### State variables
- `[noun, setNoun]` pattern: `[staff, setStaff]`, `[loading, setLoading]`, `[error, setError]`

---

## 5. API Routes

Follow REST resource naming:

| Pattern | Example |
|---------|---------|
| Collection | `GET /api/staff` |
| Single resource | `GET /api/staff/:id` |
| Create | `POST /api/staff` |
| Replace | `PUT /api/staff/:id` |
| Sub-resource | `PUT /api/staff/:id/certificates` |
| Delete | `DELETE /api/departments/:id` |

- Route paths: `kebab-case` (`/forgot-password`, not `/forgotPassword`)
- Route params: `camelCase` in code (`req.params.staffId`), but Express uses the param name as defined (`:id`, `:staffId`)

---

## 6. Database Table & Column Naming

| Object | Convention | Example |
|--------|-----------|---------|
| Tables | `snake_case`, plural | `staff`, `students`, `compliance_documents` |
| Columns | `snake_case` | `school_id`, `first_name` |
| Primary key | always `id` | |
| Foreign keys | `<table_singular>_id` | `staff_id`, `school_id` |
| Boolean columns | `is_` prefix | `is_paid`, `is_primary`, `is_complete` |
| Timestamp columns | `created_at`, `updated_at`, `expires_at`, `signed_at` | |
| Unique constraints | `<table>_<cols>_unique` | `staff_school_email_unique` |

---

## 7. Environment Variables

- `SCREAMING_SNAKE_CASE`
- Prefix by service when not obvious: `UPSTASH_REDIS_REST_URL`, `DATABASE_URL`

```
DATABASE_URL
JWT_SECRET
NODE_ENV
FRONTEND_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

---

## 8. Git & Commits

Follow Conventional Commits:

```
feat: add staff certificate upload endpoint
fix: await hashPassword in seed script
docs: add spec directory with initial specification set
refactor: split queries.ts into per-module files
chore: update dependencies
```

Branch naming: `feature/<short-description>`, `fix/<issue>`, `chore/<task>`.
