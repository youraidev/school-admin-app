# API Contracts Specification

## 1. Conventions

| Convention | Rule |
|-----------|------|
| Base path | `/api` |
| Auth | `Authorization: Bearer <jwt>` on all authenticated routes |
| Content-Type | `application/json` for all request/response bodies |
| Success codes | `200` (read/update), `201` (create), `204` (delete) |
| Error format | `{ "error": "Human-readable message" }` |
| 401 behaviour | Token missing/invalid → `{ "error": "Authentication required" \| "Invalid or expired token" }` |
| 403 behaviour | Role insufficient → `{ "error": "Forbidden" }` |
| 404 behaviour | Resource not found → `{ "error": "<Resource> not found" }` |
| 409 behaviour | Conflict (duplicate) → `{ "error": "..." }` |
| Tenant isolation | All responses are scoped by `school_id` from JWT. Never expose another tenant's data. |

---

## 2. Authentication Endpoints

### `POST /api/auth/register`
Creates a new school + `school_admin` user.

**Public** (no auth required). **Rate limited.**

```json
// Request
{
  "schoolName": "Demo School",
  "email": "admin@school.edu",
  "password": "Admin1234!"
}

// Response 201
{
  "token": "<jwt>",
  "user": { "id": "uuid", "email": "...", "role": "school_admin", "schoolId": "uuid" }
}
```

Validation:
- `schoolName`, `email`, `password` required
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: 8–72 characters
- 409 if email already registered
- 409 with `"A school with that name already exists"` on slug conflict

---

### `POST /api/auth/login`
**Public. Rate limited.**

```json
// Request
{ "email": "admin@school.edu", "password": "Admin1234!" }

// Response 200
{
  "token": "<jwt>",
  "user": { "id": "uuid", "email": "...", "role": "school_admin", "schoolId": "uuid" }
}
```

- 400 if fields missing or email invalid
- 401 if credentials wrong (no distinction between "user not found" and "wrong password")

---

### `POST /api/auth/forgot-password`
**Public. Rate limited.**

Always responds `200` with the same message regardless of whether the email exists (prevents enumeration).

```json
// Request
{ "email": "any@email.com" }

// Response 200
{ "message": "If that email is registered, a reset link has been sent." }
```

---

### `POST /api/auth/reset-password`
**Public.**

```json
// Request
{ "token": "<reset-token>", "password": "NewPass1234!" }

// Response 200
{ "message": "Password reset successfully. You can now log in." }
```

- 400 if token invalid/expired
- Password: 8–72 characters

---

### `GET /api/auth/me`
**Authenticated.**

```json
// Response 200
{ "user": { "userId": "uuid", "schoolId": "uuid", "role": "school_admin" } }
```

---

## 3. Dashboard Endpoints

All **Authenticated**.

### `GET /api/dashboard/stats`
```json
{
  "totalStudents": 42,
  "totalStaff": 12,
  "pendingContracts": 3,
  "pendingSignatures": 7
}
```

### `GET /api/dashboard/critical-allergies`
```json
[
  { "studentId": "uuid", "studentName": "Emma J.", "allergen": "Peanuts", "notes": "Carries EpiPen" }
]
```

### `GET /api/dashboard/contract-issues`
```json
[
  { "studentId": "uuid", "studentName": "Sofia A.", "issue": "pending", "status": "pending" }
]
```

### `GET /api/dashboard/pending-signatures`
```json
[
  { "documentId": "uuid", "documentTitle": "Internal Work Rules 2026", "signedCount": 2, "totalCount": 5 }
]
```

---

## 4. Staff Endpoints

### `GET /api/staff`
Returns all staff with department name joined.

```json
[
  {
    "id": "uuid",
    "firstName": "Jonas",
    "lastName": "Petrauskas",
    "role": "Math Teacher",
    "department": "uuid",
    "departmentName": "Mathematics",
    "email": "j.petrauskas@school.lt",
    "position": "Math Teacher",
    "rank": "Senior",
    "startDate": "2018-09-01",
    "qualifications": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### `GET /api/staff/:id`
Returns `StaffWithDetails` (includes certificates, evaluations, extra duties, emergency contacts).

### `POST /api/staff`
**Requires `school_admin` or `super_admin` role.**

```json
// Request
{
  "firstName": "Jonas",
  "lastName": "Petrauskas",
  "email": "j.petrauskas@school.lt",
  "role": "Math Teacher",
  "department": "uuid",
  "position": "Math Teacher",
  "rank": "Senior",
  "startDate": "2018-09-01",
  "qualifications": [
    { "degreeType": "Master of Education (M.Ed)", "fieldOfStudy": "Mathematics", "institution": "KTU", "year": 2016 }
  ]
}

// Response 201 — Staff object
```

Validation:
- `firstName`, `lastName`, `email`, `role`, `department`, `startDate`, `position` required
- Qualification: `degreeType`, `fieldOfStudy`, `institution` required; `year` must be 1950–2100

### `PUT /api/staff/:id`
Same body as POST. **Requires `school_admin` or `super_admin` role.**

### `PUT /api/staff/:id/certificates`
```json
// Request
{
  "certificates": [
    { "name": "First Aid", "issuer": "Red Cross", "date": "2024-01-15", "fileUrl": null }
  ]
}
// Response 200 — Certificate[]
```
Full replacement (not merge).

### `PUT /api/staff/:id/evaluations`
```json
// Request
{
  "evaluations": [
    { "courseName": "Algebra Gr 8", "rating": 4.8, "feedback": "Excellent", "date": "2024-06-15" }
  ]
}
// Response 200 — CourseEvaluation[]
```
Rating must be 0–5. Full replacement.

### `GET /api/staff/qualifications/suggestions`
```json
{ "fields": ["Mathematics", "Physics"], "institutions": ["KTU", "VU"] }
```

---

## 5. Students Endpoints

### `GET /api/students`
Returns `Student[]` (no nested details).

### `GET /api/students/:id`
Returns `StudentWithDetails` (includes allergies, emergencyContacts, documentChecklist, agreements, authorizedPickup).

> **Missing:** No POST/PUT/DELETE for students yet. CRUD must be added.

---

## 6. Departments Endpoints

### `GET /api/departments`
Returns `Department[]` with `staffCount`.

### `GET /api/departments/:id`

### `POST /api/departments`
**Requires `school_admin` or `super_admin`.**
```json
{ "name": "Mathematics", "description": "..." }
```
- 409 if name already exists in school

### `PUT /api/departments/:id`
Same body as POST.

### `DELETE /api/departments/:id`
- 204 on success
- 409 if department has staff members assigned

---

## 7. Compliance Endpoints

### `GET /api/compliance`
Returns `ComplianceDocumentWithSignatures[]`.

### `GET /api/compliance/:id`
Returns single `ComplianceDocumentWithSignatures`.

> **Missing:** No POST/PUT/DELETE for compliance documents or signature management. Must be added.

---

## 8. Health Check

### `GET /api/health`
**Public.**
```json
{ "status": "ok", "timestamp": "2026-05-11T07:00:00.000Z" }
```

---

## 9. Error Response Shape

All errors follow this exact shape:

```json
{ "error": "Human-readable description" }
```

In development only, 500 errors additionally include:
```json
{ "error": "Internal server error", "message": "Stack trace details..." }
```

---

## 10. Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/login` | Sliding window via Upstash Redis |
| `POST /api/auth/forgot-password` | Sliding window via Upstash Redis |
| All others | No rate limit currently |

> **Rule:** Future auth endpoints MUST apply rate limiting. Consider adding per-IP limits to all mutation endpoints.

---

## 11. Versioning Policy

The API is currently unversioned. All routes are under `/api/`.

**Future rule:** When breaking changes are needed, prefix with `/api/v2/`. The current API is implicitly `v1`. Do not break existing clients without a versioning strategy.
