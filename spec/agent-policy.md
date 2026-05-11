# Agent Policy

This document defines how AI agent must behave when working on this project.  
These rules are binding and take precedence over general assistant behaviour.

---

## 1. Spec as Source of Truth

The `/spec` directory is the **authoritative source of truth** for all project decisions.

Before planning or writing any code, AI agent must:
1. Check the relevant spec file(s) for existing rules
2. Follow those rules without deviation
3. Flag any conflict between the spec and the existing codebase

---

## 2. Refactor Suggestions Policy

If AI agent identifies an opportunity to improve, refactor, simplify, or modernise the project, it **must**:

1. Complete the primary task as requested first
2. List any suggestions at the end of its response under a section titled **"Suggested Improvements"**
3. For each suggestion, explain:
   - What the improvement is
   - Why it is beneficial
   - What the migration path or risk would be
4. **Wait for explicit written approval** before applying any suggested change

AI agent must **never** apply a structural improvement automatically, even if it is confident the change is correct.

---

## 3. New Libraries and Dependencies

AI agent must **not** introduce any new npm package or library without approval.

Exceptions — these are **pre-approved** and may be added without asking:
- `@tanstack/react-query` (data fetching refactor)
- `zod` (validation layer)
- `vitest`, `supertest`, `@testing-library/react`, `playwright` (testing stack)

For any other package, AI agent must:
1. Name the package
2. Explain why an existing tool cannot fulfil the need
3. Wait for approval before installing

See `spec/tech-stack.md` for the full pre-approved list.

---

## 4. Locked Architectural Decisions

The following must **not** change without explicit user approval:

- Folder structure (`spec/folder-structure.md`)
- Domain boundaries (Staff / Students / Compliance / Departments)
- Naming conventions (`spec/naming-conventions.md`)
- API contract style (`spec/api-contracts.md`)
- Permission and RBAC model (`spec/permissions-and-security.md`)
- Database driver: `pg` + `drizzle-orm/node-postgres`
- Authentication: JWT Bearer tokens, bcrypt

See `spec/architecture.md` §7 for the full locked-decisions table.

---

## 5. Spec Conflicts

If AI agent discovers that the existing codebase **violates** a spec rule, it must:

1. Point out the conflict clearly under a **"Spec Conflicts Found"** section
2. Describe which spec rule is being violated
3. Propose a resolution
4. Wait for approval before fixing — unless the fix is trivially safe (e.g. adding a missing comment)

---

## 6. Response Structure for Complex Tasks

When responding to a non-trivial task, AI agent should use this structure:

```
## Plan
(Spec-compliant changes being made)

## Spec Conflicts Found  ← only if applicable
(What conflicts with the spec and proposed resolution)

## Suggested Improvements  ← only if applicable
(Optional improvements — not applied, awaiting approval)
```

---

## 7. No Silent Deviations

AI agent must never silently deviate from the spec. If a task requirement conflicts with a spec rule, it must surface the conflict and ask for clarification rather than picking one silently.
