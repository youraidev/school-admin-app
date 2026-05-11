# Domain Model Specification

## 1. Overview

The domain is divided into four modules. All entities are scoped to a `school_id` (multi-tenant).

```
┌─────────────────────────────────────────────────┐
│                   TENANT                        │
│  schools ──< users                              │
└─────────────────────┬───────────────────────────┘
                      │ school_id FK
       ┌──────────────┼──────────────┬─────────────────┐
       ▼              ▼              ▼                  ▼
  ┌─────────┐   ┌──────────┐  ┌──────────┐   ┌──────────────┐
  │  STAFF  │   │ STUDENTS │  │COMPLIANCE│   │  DASHBOARD   │
  │ MODULE  │   │  MODULE  │  │  MODULE  │   │  (read-only) │
  └─────────┘   └──────────┘  └──────────┘   └──────────────┘
```

---

## 2. Entity Definitions

### 2.1 Tenant

#### `schools`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, defaultRandom | |
| `name` | text | NOT NULL | Display name |
| `slug` | text | NOT NULL, UNIQUE | URL-safe identifier |
| `plan` | text | NOT NULL, default `trial` | `trial \| starter \| pro \| enterprise` |
| `created_at` | timestamp | defaultNow | |

#### `users`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `school_id` | uuid | FK → schools, CASCADE | Tenant key |
| `email` | text | NOT NULL, UNIQUE (global) | Login email |
| `password_hash` | text | NOT NULL | bcrypt, cost 12 |
| `role` | text | NOT NULL, default `staff` | `super_admin \| school_admin \| staff` |
| `created_at` | timestamp | defaultNow | |

> ⚠️ `email` is globally unique — one login per email across all schools.

---

### 2.2 Staff Module

#### `departments`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `school_id` | uuid | FK → schools, CASCADE |
| `name` | text | NOT NULL |
| `description` | text | nullable |
| `created_at` | timestamp | defaultNow |

**Unique constraint:** `(school_id, name)` — no duplicate dept names per school.

#### `staff`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `school_id` | uuid | FK → schools, CASCADE | |
| `first_name` | text | NOT NULL | |
| `last_name` | text | NOT NULL | |
| `position` | text | NOT NULL | Enum: see `POSITION_OPTIONS` |
| `legacy_name` | text | nullable | Historical name field |
| `role` | text | NOT NULL | Job role string |
| `department` | uuid | FK → departments | |
| `photo_url` | text | nullable | |
| `email` | text | NOT NULL | |
| `phone` | text | nullable | |
| `salary` | float | nullable | |
| `salary_coefficient` | float | nullable | |
| `start_date` | text | NOT NULL | ISO date string |
| `qualification` | text | nullable | Summary text |
| `rank` | text | nullable | Enum: see `RANK_OPTIONS` |
| `created_at` | timestamp | defaultNow | |
| `updated_at` | timestamp | defaultNow | |

**Unique constraint:** `(school_id, email)` — no duplicate emails within a school.

#### `staff_qualifications`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `staff_id` | uuid | FK → staff, CASCADE |
| `degree_type` | text | NOT NULL — enum: `DegreeType` |
| `field_of_study` | text | NOT NULL |
| `institution` | text | NOT NULL |
| `year` | integer | nullable |

#### `certificates`
One-to-many: staff → certificates. Stores professional certifications.

#### `course_evaluations`
One-to-many: staff → evaluations. Rating 0–5, associated with a course name and date.

#### `extra_duties`
One-to-many: staff → extra duties. Simple name string, no metadata.

---

### 2.3 Student Module

#### `students`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `school_id` | uuid | FK → schools |
| `name` | text | Full name (single field) |
| `class_name` | text | e.g. "Grade 5A" |
| `birth_date` | text | ISO date string |
| `photo_url` | text | nullable |
| `special_education_needs` | text | nullable |
| `health_status` | text | default `Good` |
| `medical_support` | text | nullable |
| `contract_status` | text | `active \| pending \| terminated \| expired` |
| `contract_start_date` | text | nullable |
| `contract_end_date` | text | nullable |
| `is_paid` | boolean | default `true` |

#### `allergies`
| Column | Type | Notes |
|--------|------|-------|
| `severity` | text | `low \| medium \| life-threatening` |

#### `emergency_contacts`
Polymorphic: belongs to either a `student_id` OR a `staff_id` (both nullable, one must be set).

#### `document_checklist`
Per-student document completion tracking. Boolean `is_complete` + optional `due_date`.

#### `agreements`
| Type | Values |
|------|--------|
| `type` | `photography \| travel \| other` |
| `status` | `allowed \| internal-only \| forbidden` |

#### `authorized_pickup`
List of people authorised to collect the student. Name + phone + relation.

---

### 2.4 Compliance Module

#### `compliance_documents`
| Column | Notes |
|--------|-------|
| `target_audience` | `all \| department \| individual` |
| `target_departments` | comma-delimited department IDs (denormalised) |
| `target_individuals` | comma-delimited staff IDs (denormalised) |

> ⚠️ **Improvement needed:** `target_departments` and `target_individuals` are stored as comma-delimited strings. These should be normalised to junction tables.

#### `document_signatures`
Join between `compliance_documents` and `staff`. Status: `signed \| pending`.
Redundantly denormalises `staff_name` for historical accuracy.

#### `password_reset_tokens`
Single-use tokens with `expires_at`, `used_at`. `token_hash` prevents plain-text storage.

---

## 3. Relationship Diagram

```
schools 1──< users
schools 1──< departments
schools 1──< staff ──< staff_qualifications
                   ──< certificates
                   ──< course_evaluations
                   ──< extra_duties
                   ──< emergency_contacts (staffId)
                   ──< document_signatures

schools 1──< students ──< allergies
                      ──< emergency_contacts (studentId)
                      ──< document_checklist
                      ──< agreements
                      ──< authorized_pickup

schools 1──< compliance_documents ──< document_signatures
```

---

## 4. Domain Invariants

| Rule | Description |
|------|-------------|
| **DM-01** | Every entity MUST have a `school_id` column |
| **DM-02** | `staff.email` must be unique per school |
| **DM-03** | `departments.name` must be unique per school |
| **DM-04** | `users.email` must be globally unique |
| **DM-05** | Passwords MUST be hashed with bcrypt cost ≥ 12 |
| **DM-06** | Dates stored as ISO 8601 text strings (`YYYY-MM-DD`) |
| **DM-07** | All PKs are UUIDs (except `staff_qualifications.id` which is serial) |
| **DM-08** | All tables cascade-delete from `schools` |
| **DM-09** | `emergency_contacts` is polymorphic — exactly one of `student_id` or `staff_id` must be non-null |

## 5. Improvements Required

| ID | Issue | Resolution |
|----|-------|-----------|
| **DM-IMP-01** | `target_departments` / `target_individuals` stored as comma strings | Create `compliance_document_departments` and `compliance_document_individuals` junction tables |
| **DM-IMP-02** | `student.name` is a single string | Split into `first_name` / `last_name` for proper sorting |
| **DM-IMP-03** | `emergency_contacts` polymorphic nullable FKs | Consider separate `student_emergency_contacts` and `staff_emergency_contacts` tables |
| **DM-IMP-04** | Missing `updated_at` on several tables | Add `updated_at` to all tables that support mutations |
