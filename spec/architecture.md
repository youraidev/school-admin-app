# Architecture Specification

## 1. Architectural Style

**SchoolAdmin** uses a **monorepo, full-stack TypeScript** architecture with a clear separation of concerns across three tiers:

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER (SPA)                         │
│   React 18 · React Router v6 · TanStack Query (future)       │
│   Tailwind CSS · Radix UI primitives · Lucide icons          │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP (proxied in dev, direct in prod)
┌─────────────────────────▼────────────────────────────────────┐
│               API LAYER  (Express + Node.js)                 │
│   Single entry: api/index.ts  (Vercel serverless function)   │
│   Auth: JWT Bearer tokens, bcrypt password hashing           │
│   Rate limiting: Upstash Redis sliding window                │
└─────────────────────────┬────────────────────────────────────┘
                          │ pg (node-postgres) TCP/SSL
┌─────────────────────────▼────────────────────────────────────┐
│                     DATA LAYER                               │
│   PostgreSQL (Neon in prod, Docker localhost:5433 in dev)    │
│   Drizzle ORM · schema-first, multi-tenant by school_id      │
└──────────────────────────────────────────────────────────────┘
```

## 2. Deployment Architecture

### Production (Vercel)
```
GitHub push → Vercel CI
  ├── npm run build
  │     ├── tsc -p tsconfig.server.json  (type-check server)
  │     └── vite build                   (bundle SPA → dist/)
  ├── dist/index.html  served as static CDN asset
  └── api/index.ts     deployed as Node.js serverless function
```

### Local Development (Docker)
```
npm run dev (concurrently)
  ├── vite --port 5174    (frontend, HMR)
  └── tsx watch server/index.ts   (API, :3000)
        └── docker-compose
              ├── postgres:16-alpine  (:5433)
              └── redis:7-alpine      (:6380)
```

## 3. Multi-Tenancy Model

The system is **school-scoped**: every authenticated request carries a `schoolId` (from the JWT). Every query filters by `school_id` as the primary tenant discriminator.

```
JWT payload: { userId, schoolId, role }
                               ↓
Every route handler: req.user!.schoolId
                               ↓
Every query function: WHERE school_id = $schoolId
```

**Rule:** No query function may ever return data without a `schoolId` filter. Cross-tenant data leakage is a critical security failure.

## 4. Code Organisation

```
school-admin-app/
├── api/               Vercel serverless entry (thin adapter)
├── server/            Express application
│   ├── routes/        One file per domain module
│   ├── middleware/    authenticate.ts, rateLimit.ts
│   ├── db/            Drizzle schema, index, utils, seed
│   ├── auth.ts        JWT + bcrypt helpers
│   ├── email.ts       Resend email service
│   ├── queries.ts     ALL database access (single file, current)
│   └── server.ts      Express app factory
├── src/               React SPA
│   ├── components/    Domain components + UI primitives
│   ├── contexts/      AuthContext
│   ├── lib/           api.ts (HTTP client), auth.ts, utils.ts
│   └── pages/         Route-level components
├── shared/
│   └── types/index.ts Shared TypeScript types (both FE + BE)
└── spec/              ← This directory
```

## 5. Desired Future State

### 5.1 Split `queries.ts` into modules
`queries.ts` (23 KB, 600+ lines) is a monolith. It must be split:
```
server/queries/
  ├── auth.ts
  ├── dashboard.ts
  ├── staff.ts
  ├── students.ts
  ├── departments.ts
  └── compliance.ts
```

### 5.2 React Query for data fetching
All data fetching in the frontend currently uses ad-hoc `useEffect` + `useState`. Migrate to **TanStack Query** for:
- Automatic cache invalidation
- Loading/error states
- Refetch on window focus

### 5.3 Zod validation layer
Input validation lives inline in route handlers as manual `if (!field)` checks. Move to **Zod schemas** in a dedicated `server/validators/` directory, shared between frontend and backend where appropriate.

### 5.4 Database migrations
The project uses `drizzle-kit push` (schema push without versioned migrations). For production stability, introduce `drizzle-kit generate` + `migrate` with proper migration history in `drizzle/` directory.

## 6. Rules

- **R-ARCH-01:** The server entry point for Vercel MUST be `api/index.ts` which imports and re-exports the Express app from `server/server.ts`.
- **R-ARCH-02:** The `shared/` directory is the ONLY place where types used by both FE and BE are defined.
- **R-ARCH-03:** All database access MUST go through `server/queries/` (or `queries.ts` until split). Routes must not import `db` directly.
- **R-ARCH-04:** Authentication state is managed exclusively through `AuthContext` on the frontend. Components must not read from `localStorage` directly.
- **R-ARCH-05:** All authenticated API routes MUST pass through the `authenticate` middleware before reaching route handlers.

---

## 7. Stable Decisions — Do Not Change Without Explicit Approval

The following architectural decisions are **locked**. They must not be altered, replaced, or removed without the user explicitly approving the change in advance.

| Decision | What it covers |
|----------|---------------|
| **Folder structure** | `server/`, `src/`, `shared/`, `api/`, `spec/` layout and file placement rules |
| **Domain boundaries** | Staff, Students, Compliance, Departments — one route file, one query section, one component folder each |
| **Naming conventions** | File, function, type, column, and route naming as defined in `naming-conventions.md` |
| **API contract style** | REST patterns, status codes, error shape `{ "error": "..." }`, tenant isolation via JWT |
| **Permission model** | Role-based (`super_admin`, `school_admin`, `staff`); enforced via `requireRole()` middleware; `schoolId` always from JWT |
| **Database driver** | `pg` (node-postgres) Pool + `drizzle-orm/node-postgres` — no switching to edge/serverless drivers without approval |
| **Authentication mechanism** | JWT Bearer tokens, 7-day expiry, bcrypt cost 12 — no switching to sessions or OAuth without approval |
| **Tech stack** | See `spec/tech-stack.md` — no new frameworks or libraries without approval |

> If Antigravity identifies a compelling reason to change any of the above, it must:
> 1. Raise it under **"Suggested Improvements"** in its response
> 2. Explain the benefit and the migration path
> 3. Wait for explicit written approval before touching anything

