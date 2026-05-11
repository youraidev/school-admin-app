# Testing Strategy Specification

## 1. Current State

The project has **no automated tests** at this time. This specification defines the testing strategy to be implemented.

---

## 2. Testing Philosophy

- **Test behaviour, not implementation.** Tests should validate what a function does, not how it does it internally.
- **The testing pyramid:** Favour unit tests (fast, isolated) over integration tests, and integration tests over end-to-end tests.
- **Tests must be runnable locally** without external services (mock the DB and external APIs).
- **Every bug fix requires a test** that would have caught the bug.

```
          ┌────────────┐
          │   E2E (5%) │  Playwright — critical user flows
          ├────────────┤
          │ Integration │  Supertest — API route testing
          │   (25%)    │  against a real test DB
          ├────────────┤
          │   Unit     │  Vitest — query logic, validators,
          │   (70%)    │  auth helpers, utility functions
          └────────────┘
```

---

## 3. Tooling

| Layer | Tool | Reason |
|-------|------|--------|
| Unit + integration | **Vitest** | Native ESM, TypeScript, Vite-compatible |
| API integration | **Supertest** | Test Express routes without starting a server |
| Frontend component | **Vitest + @testing-library/react** | React component testing |
| End-to-end | **Playwright** | Headless browser testing for critical flows |
| Test DB | **Docker PostgreSQL (test instance)** | Isolated, real DB, reset per test suite |
| Mocking | **Vitest mock functions** (`vi.fn()`, `vi.mock()`) | |

### Installation (future)
```bash
npm install --save-dev vitest @vitest/ui supertest @testing-library/react \
    @testing-library/jest-dom @testing-library/user-event playwright
```

---

## 4. Unit Tests

### 4.1 What to unit test

| Module | What to test |
|--------|-------------|
| `server/auth.ts` | `hashPassword`, `verifyPassword`, `signToken`, `verifyToken` |
| `server/middleware/authenticate.ts` | Valid token, expired token, missing token, wrong role |
| `shared/types/index.ts` | `RANK_OPTIONS`, `POSITION_OPTIONS`, `DEGREE_WEIGHTS` completeness |
| `src/lib/api.ts` | `calculateTenure()` edge cases |
| Validation logic (future Zod schemas) | All validation rules |

### 4.2 Auth unit tests (priority)

```ts
// server/auth.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from './auth.js';

describe('hashPassword', () => {
    it('returns a bcrypt hash', async () => {
        const hash = await hashPassword('Admin1234!');
        expect(hash).toMatch(/^\$2b\$/);
    });

    it('is async — must be awaited', async () => {
        const result = hashPassword('test'); // not awaited intentionally
        expect(typeof result).toBe('object'); // Promise
        expect(typeof result.then).toBe('function');
    });
});

describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
        const hash = await hashPassword('Admin1234!');
        expect(await verifyPassword('Admin1234!', hash)).toBe(true);
    });

    it('returns false for wrong password', async () => {
        const hash = await hashPassword('Admin1234!');
        expect(await verifyPassword('wrong', hash)).toBe(false);
    });
});
```

### 4.3 Utility unit tests

```ts
// src/lib/api.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTenure } from './api.js';

describe('calculateTenure', () => {
    it('returns months for < 1 year', () => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        expect(calculateTenure(sixMonthsAgo.toISOString())).toMatch(/mos/);
    });

    it('returns years for >= 1 year', () => {
        expect(calculateTenure('2020-01-01')).toMatch(/yr/);
    });
});
```

---

## 5. Integration Tests (API)

Use **Supertest** to test the Express app without starting a real server. Use a dedicated test database.

### 5.1 Test database setup

```ts
// test/setup.ts
import { db } from '../server/db/index.js';
import { sql } from 'drizzle-orm';

export async function resetTestDb() {
    // Truncate all tables in reverse dependency order
    await db.execute(sql`TRUNCATE document_signatures, compliance_documents,
        agreements, document_checklist, authorized_pickup, allergies, students,
        extra_duties, course_evaluations, certificates, staff_qualifications,
        staff, departments, password_reset_tokens, users, schools CASCADE`);
}
```

### 5.2 Auth endpoint tests

```ts
// test/routes/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../../server/server.js';
import { resetTestDb } from '../setup.js';

const req = supertest(app);

describe('POST /api/auth/register', () => {
    beforeEach(() => resetTestDb());

    it('creates a school and admin user', async () => {
        const res = await req.post('/api/auth/register').send({
            schoolName: 'Test School',
            email: 'admin@test.edu',
            password: 'TestPass1!',
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.role).toBe('school_admin');
    });

    it('rejects duplicate email with 409', async () => {
        await req.post('/api/auth/register').send({
            schoolName: 'School A', email: 'dup@test.edu', password: 'TestPass1!',
        });
        const res = await req.post('/api/auth/register').send({
            schoolName: 'School B', email: 'dup@test.edu', password: 'TestPass1!',
        });
        expect(res.status).toBe(409);
    });

    it('rejects password shorter than 8 characters', async () => {
        const res = await req.post('/api/auth/register').send({
            schoolName: 'School', email: 'a@b.com', password: 'short',
        });
        expect(res.status).toBe(400);
    });
});

describe('POST /api/auth/login', () => {
    it('returns 401 for wrong password', async () => {
        const res = await req.post('/api/auth/login').send({
            email: 'admin@test.edu', password: 'WrongPass!',
        });
        expect(res.status).toBe(401);
    });
});
```

### 5.3 Tenant isolation tests

```ts
describe('Tenant isolation', () => {
    it('cannot read another school\'s staff', async () => {
        // Register two schools
        const schoolA = await req.post('/api/auth/register').send({ ... });
        const schoolB = await req.post('/api/auth/register').send({ ... });

        // Add staff to school A
        await req.post('/api/staff')
            .set('Authorization', `Bearer ${schoolA.body.token}`)
            .send({ ... });

        // School B cannot see school A's staff
        const res = await req.get('/api/staff')
            .set('Authorization', `Bearer ${schoolB.body.token}`);
        expect(res.body).toHaveLength(0);
    });
});
```

---

## 6. Frontend Component Tests

Use `@testing-library/react` for component tests:

```tsx
// src/components/ui/status-badge.test.tsx
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge.js';

it('displays "Active" for active contract', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
});
```

---

## 7. End-to-End Tests

Use **Playwright** for critical user flows only:

| Flow | Priority |
|------|----------|
| Register a school + login | High |
| Login with valid credentials | High |
| Forgot password flow | Medium |
| Add a staff member | High |
| View staff detail page | Medium |
| View compliance documents | Medium |

```ts
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('login with demo credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[id="email"]', 'admin@school.edu');
    await page.fill('[id="password"]', 'Admin1234!');
    await page.click('[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible();
});
```

---

## 8. Test File Naming & Location

| Type | Location | Naming |
|------|----------|--------|
| Unit (server) | Co-located or `server/__tests__/` | `auth.test.ts` |
| Unit (frontend) | Co-located | `StatusBadge.test.tsx` |
| Integration (API) | `test/routes/` | `auth.test.ts`, `staff.test.ts` |
| E2E | `e2e/` | `auth.spec.ts`, `staff.spec.ts` |
| Test utilities | `test/` | `setup.ts`, `factories.ts` |

---

## 9. Test Data Factories

Create factory functions for test data:

```ts
// test/factories.ts
export function makeSchool(overrides = {}) {
    return { name: 'Test School', slug: 'test-school', plan: 'trial', ...overrides };
}

export function makeStaff(schoolId: string, overrides = {}) {
    return {
        firstName: 'Jonas', lastName: 'Petrauskas',
        email: `staff+${Date.now()}@test.edu`,
        role: 'Math Teacher', position: 'Math Teacher',
        department: '...', startDate: '2020-01-01',
        schoolId,
        ...overrides,
    };
}
```

---

## 10. Coverage Goals

| Layer | Target |
|-------|--------|
| Auth logic (`server/auth.ts`) | 100% |
| Query functions (`server/queries.ts`) | 80% |
| API route handlers | 70% |
| React components | 60% |
| E2E flows | Critical paths only |

---

## 11. CI Integration (Future)

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: npm test

- name: Run E2E
  run: npx playwright test
```

Tests must pass before merging any pull request.
