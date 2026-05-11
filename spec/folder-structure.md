# Folder Structure Specification

## 1. Complete Directory Tree

```
school-admin-app/
│
├── api/                         Vercel serverless entry point
│   ├── index.ts                 Thin adapter — imports and re-exports Express app
│   └── tsconfig.json            Extends tsconfig.server.json for Vercel type-check
│
├── server/                      Express application (backend)
│   ├── server.ts                Express app factory — middleware + route mounting
│   ├── index.ts                 Local dev entry (starts Express on :3000)
│   ├── auth.ts                  JWT + bcrypt helpers
│   ├── email.ts                 Resend email service integration
│   ├── express.d.ts             Module augmentation: req.user typings
│   │
│   ├── db/
│   │   ├── schema.ts            Drizzle table definitions (single source of truth)
│   │   ├── index.ts             Database connection (pg Pool + Drizzle)
│   │   ├── seed.ts              Idempotent demo data seeder
│   │   └── utils.ts             DB utility helpers
│   │
│   ├── middleware/
│   │   ├── authenticate.ts      JWT verification + requireRole guard
│   │   └── rateLimit.ts         Upstash Redis rate limiters
│   │
│   ├── routes/                  One file per domain module
│   │   ├── auth.ts              /api/auth/*
│   │   ├── dashboard.ts         /api/dashboard/*
│   │   ├── staff.ts             /api/staff/*
│   │   ├── students.ts          /api/students/*
│   │   ├── departments.ts       /api/departments/*
│   │   └── compliance.ts        /api/compliance/*
│   │
│   └── queries.ts               ← CURRENT: all DB queries in one file
│       (future: queries/ dir)
│
├── src/                         React SPA (frontend)
│   ├── main.tsx                 React root entry
│   ├── App.tsx                  Router tree + AuthProvider
│   ├── index.css                Global styles + Tailwind base
│   ├── App.css                  App-level styles (minimal)
│   │
│   ├── pages/                   Route-level components (thin orchestrators)
│   │   ├── LoginPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── Index.tsx            Dashboard (redirects to /dashboard)
│   │   ├── StudentsPage.tsx
│   │   ├── StudentDetailPage.tsx
│   │   ├── StaffPage.tsx
│   │   ├── AddStaffPage.tsx
│   │   ├── EditStaffPage.tsx
│   │   ├── StaffDetailPage.tsx
│   │   ├── DepartmentsPage.tsx
│   │   ├── AddDepartmentPage.tsx
│   │   ├── EditDepartmentPage.tsx
│   │   ├── CompliancePage.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/
│   │   ├── ui/                  Radix UI wrappers (design system primitives)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── status-badge.tsx
│   │   │   └── severity-badge.tsx
│   │   │
│   │   ├── layout/              App shell components
│   │   │   └── AppLayout.tsx    Sidebar + main content wrapper
│   │   │
│   │   ├── auth/                Auth-related components
│   │   │   └── RequireAuth.tsx  Route guard wrapper
│   │   │
│   │   ├── dashboard/           Dashboard-specific components
│   │   │
│   │   ├── staff/               Staff domain components
│   │   │   ├── StaffCard.tsx    Detailed staff profile card
│   │   │   ├── StaffList.tsx    Staff list/table view
│   │   │   └── AddStaffDialog.tsx
│   │   │
│   │   ├── students/            Student domain components
│   │   │
│   │   ├── compliance/          Compliance domain components
│   │   │
│   │   ├── QualificationsForm.tsx  Shared qualifications form
│   │   └── ErrorBoundary.tsx    React error boundary
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx      JWT auth state, login/logout
│   │
│   └── lib/
│       ├── api.ts               HTTP client (fetch wrapper + all API functions)
│       ├── auth.ts              Token storage (localStorage)
│       └── utils.ts             cn() classname utility
│
├── shared/
│   └── types/
│       └── index.ts             All TypeScript types shared between FE and BE
│
├── spec/                        ← Specification directory (this)
│   ├── architecture.md
│   ├── domain-model.md
│   ├── api-contracts.md
│   ├── ui-guidelines.md
│   ├── coding-standards.md
│   ├── naming-conventions.md
│   ├── folder-structure.md      (this file)
│   ├── testing-strategy.md
│   └── permissions-and-security.md
│
├── drizzle/                     Generated migration files (future)
├── public/                      Static assets
├── scripts/                     Dev utility scripts
├── dist/                        Production build output (git-ignored)
├── node_modules/                (git-ignored)
│
├── docker-compose.yml           Local dev: postgres + redis
├── vercel.json                  Routing rules for Vercel deployment
├── vite.config.ts               Vite build + dev server config
├── tailwind.config.js           Tailwind theme config
├── drizzle.config.ts            Drizzle ORM / kit config
├── tsconfig.json                Root TS config (references others)
├── tsconfig.app.json            Frontend TS config
├── tsconfig.server.json         Backend TS config
├── tsconfig.node.json           Vite node config
├── package.json
├── DEPLOYMENT.md                Operational deployment guide
├── README.md
└── CLAUDE.md                    AI assistant context file
```

---

## 2. Rules

### FS-01: Domain boundaries
Each domain module (staff, students, compliance, departments) MUST have:
- One route file in `server/routes/`
- One section in `server/queries.ts` (or one file in `server/queries/`)
- One directory in `src/components/<domain>/`
- Corresponding types in `shared/types/index.ts`

### FS-02: No cross-domain imports
`components/staff/` must not import from `components/students/`. Cross-cutting concerns go into `components/ui/` or `src/lib/`.

### FS-03: UI primitives only in `components/ui/`
No business logic in `components/ui/`. These are pure, reusable presentational components only.

### FS-04: Pages are thin
Pages (`src/pages/`) must not contain business logic. They fetch data and pass it to feature components.

### FS-05: Types in `shared/`
Types used in both frontend and backend MUST live in `shared/types/index.ts`. Types used only on the frontend live in the component file or a co-located `types.ts`.

### FS-06: No loose files at root
New source files must go in `server/`, `src/`, or `shared/`. The project root is for config files only.

### FS-07: Future `queries/` split
When `server/queries.ts` is split, the directory structure must be:
```
server/queries/
  auth.ts
  dashboard.ts
  staff.ts
  students.ts
  departments.ts
  compliance.ts
  index.ts    ← re-exports everything for backward compatibility
```
