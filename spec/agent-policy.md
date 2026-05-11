# Agent Policy

Operational rules for any AI agent working on this project. These are binding.

---

## 1. Spec First

Before planning or writing any code:
1. Check the relevant `/spec` file(s) for existing rules
2. Follow those rules without deviation
3. Flag any conflict between the spec and the existing codebase

---

## 2. Suggestions Policy

When an improvement opportunity is spotted:
1. **Finish the requested task first**
2. List suggestions at the end under **"Suggested Improvements"** with benefit + trade-offs
3. **Never apply suggestions automatically** — wait for explicit approval

---

## 3. New Libraries

Do not install any new package without approval. **Pre-approved** (no need to ask):
- `@tanstack/react-query`, `zod`
- `vitest`, `supertest`, `@testing-library/react`, `playwright`

For anything else: name it, justify why existing tools can't do it, wait for approval.  
Full pre-approved list: `spec/tech-stack.md`.

---

## 4. Locked Decisions

Do not change these without explicit approval:
- Folder structure · Domain boundaries · Naming conventions
- API contract style · Permission / RBAC model
- Database driver (`pg` + `drizzle-orm/node-postgres`) · Auth (JWT + bcrypt)

Full table: `spec/architecture.md` §7.

---

## 5. Spec Conflicts

If the codebase violates a spec rule:
1. Report it under **"Spec Conflicts Found"**
2. Name the violated rule and propose a fix
3. Wait for approval before changing anything (trivial fixes like missing comments excepted)

---

## 6. Response Structure

For non-trivial tasks:

```
## Plan
(What is being done and why it complies with spec)

## Spec Conflicts Found  ← if applicable
## Suggested Improvements  ← if applicable
```

---

## 7. Git Policy

- `git add` + `git commit` are allowed to checkpoint work
- **`git push` must never run automatically** — only when explicitly instructed
