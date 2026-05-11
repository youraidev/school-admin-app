# Coding Standards Specification

## 1. Language & Runtime

| Setting | Value |
|---------|-------|
| Language | TypeScript (strict) |
| Runtime | Node.js ≥ 18 |
| Module system | ESM (`"type": "module"` in package.json) |
| Target | ES2022 |

---

## 2. TypeScript Rules

### 2.1 Compiler settings (enforced)

**Frontend (`tsconfig.app.json`):**
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

**Server (`tsconfig.server.json`):**
- `strict: true`
- `module: NodeNext`
- `moduleResolution: NodeNext`

### 2.2 Rules

- **CS-TS-01:** Never use `any`. Use `unknown` with type narrowing if necessary.
- **CS-TS-02:** All function parameters and return types must be explicitly typed (no implicit any).
- **CS-TS-03:** Use `type` for union/primitive aliases; use `interface` for object shapes.
- **CS-TS-04:** Shared types MUST live in `shared/types/index.ts`. Never duplicate type definitions.
- **CS-TS-05:** Use `as` type assertions only when interfacing with untyped external APIs (e.g. `jwt.verify`). Document the reason.
- **CS-TS-06:** Enums are not used — use `type` union literals or `const` arrays instead.

---

## 3. Import Rules

- **CS-IMP-01:** Server-side files use `.js` extension in imports (ESM requirement), even when importing `.ts` source files.
- **CS-IMP-02:** Relative imports for project files; package imports for node_modules.
- **CS-IMP-03:** `shared/` types are imported via the path alias `../../shared/types/index.js` from frontend code.
- **CS-IMP-04:** Group imports: 1) Node builtins, 2) third-party packages, 3) internal imports.

```ts
// Good
import { Router } from 'express';
import * as queries from '../queries.js';
import type { Staff } from '../../shared/types/index.js';
```

---

## 4. Async / Error Handling

- **CS-ASYNC-01:** All async operations MUST be awaited. Never use `.then()` in server route handlers.
- **CS-ASYNC-02:** Route handlers MUST pass errors to `next(error)` — never swallow errors silently.
- **CS-ASYNC-03:** All `async` functions that call external services must be wrapped in `try/catch`.
- **CS-ASYNC-04:** Never use `new Promise()` wrapping around an already-promisified API.

```ts
// Good
router.get('/:id', async (req, res, next) => {
    try {
        const staff = await queries.getStaffById(req.user!.schoolId, req.params.id);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });
        res.json(staff);
    } catch (error) { next(error); }
});
```

---

## 5. Database Access Rules

- **CS-DB-01:** All DB access goes through `server/queries.ts` (or `server/queries/` when split). Routes must NOT import `db` directly.
- **CS-DB-02:** Every query function MUST accept `schoolId: string` as its first parameter.
- **CS-DB-03:** Multi-step mutations MUST use `db.transaction()`.
- **CS-DB-04:** Never use raw SQL string concatenation for user input. Use parameterised queries via Drizzle's `sql` tagged template or ORM methods.
- **CS-DB-05:** Query functions must not leak cross-tenant data. Every `WHERE` clause on entity tables must include `school_id = schoolId`.

```ts
// Good
export async function getStaffById(schoolId: string, staffId: string) {
    return db.query.staff.findFirst({
        where: and(eq(staff.schoolId, schoolId), eq(staff.id, staffId)),
    });
}
```

---

## 6. Validation Rules

- **CS-VAL-01:** Input validation happens in route handlers before calling query functions.
- **CS-VAL-02:** Strings from user input are always `.trim()`-ed before storage.
- **CS-VAL-03:** Emails are always `.toLowerCase().trim()`-ed before lookup or storage.
- **CS-VAL-04:** Missing required fields → `400 Bad Request`.
- **CS-VAL-05:** Conflicting unique values → `409 Conflict`.
- **CS-VAL-06:** Not found → `404 Not Found`.

---

## 7. Authentication Rules

- **CS-AUTH-01:** JWT tokens expire in 7 days.
- **CS-AUTH-02:** JWT secret MUST be provided via `JWT_SECRET` env var in production (throws on startup if missing).
- **CS-AUTH-03:** Passwords must be hashed with bcrypt, cost factor ≥ 12.
- **CS-AUTH-04:** Passwords must be 8–72 characters (72 is bcrypt's input limit).
- **CS-AUTH-05:** The `authenticate` middleware attaches `req.user: JwtPayload` to the request. All downstream code reads from `req.user`.
- **CS-AUTH-06:** `req.user!.schoolId` is the canonical source of truth for tenant isolation. It must never be overridden by query parameters or request body.

---

## 8. Environment Variables

- **CS-ENV-01:** All env vars must be documented in `.env.example`.
- **CS-ENV-02:** `.env` and `.env.local` are git-ignored.
- **CS-ENV-03:** Production env vars are set in Vercel dashboard only — never in code.
- **CS-ENV-04:** Access env vars as `process.env.VAR_NAME` — never use dotenv in production code (Vercel injects them natively).
- **CS-ENV-05:** Throw a startup error if a required production env var is missing.

---

## 9. Code Style

- **CS-STYLE-01:** Use 4-space indentation throughout (server + shared). Frontend uses 2-space (Vite default).
- **CS-STYLE-02:** Single quotes for strings in TypeScript.
- **CS-STYLE-03:** Trailing commas in multi-line arrays and objects.
- **CS-STYLE-04:** No semicolons are optional — they are required.
- **CS-STYLE-05:** Arrow functions for callbacks; `function` declarations for top-level functions.
- **CS-STYLE-06:** Destructure parameters when ≥2 fields are used from an object.

---

## 10. Comments

- **CS-COM-01:** Route files use inline comments: `// GET /api/staff/:id`
- **CS-COM-02:** Complex business logic must have a comment explaining _why_, not _what_.
- **CS-COM-03:** Workarounds or technical debt must be marked with `// TODO:` and a brief explanation.
- **CS-COM-04:** Do not leave commented-out code in production — delete it.
