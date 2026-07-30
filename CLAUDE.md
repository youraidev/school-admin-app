# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start both server (port 3000) and client (Vite) concurrently
npm run dev:server   # Server only (tsx watch, hot-reload)
npm run dev:client   # Client only (Vite HMR)
npm run build        # Compile TypeScript server + Vite client build
npm run lint         # ESLint check
npm start            # Run compiled production server
```

Vite proxies all `/api/*` requests to `http://localhost:3000`, so the frontend and backend can be developed together with `npm run dev`.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `JWT_SECRET` | Production only | `dev-secret-change-in-production` | Signs JWTs — must be set in production |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | — | Set to `production` to serve static files |

## Architecture

Multi-tenant SaaS school administration app:

- **Frontend**: React 18 + Vite, React Router v6, React Query v5, Tailwind CSS, Radix UI components
- **Backend**: Express v5, better-sqlite3 (WAL mode), tsx for dev
- **Auth**: JWT (`jsonwebtoken`) + bcrypt. Token is stored in `localStorage`, sent as `Authorization: Bearer <token>` on every API call. The `authenticate` middleware in `server/middleware/authenticate.ts` injects `req.user = { userId, schoolId, role }`.
- **Multi-tenancy**: Row-level isolation — every entity table has `school_id`. All queries in `server/queries.ts` accept `schoolId` as the first argument and filter/insert by it. Routes extract `schoolId` from `req.user`.
- **Shared types**: `shared/types/index.ts` is the single source of truth for data models — update this first when adding/changing entities. `School`, `User`, and `AuthUser` types live here.

### API Routes

| Route | File |
|---|---|
| `/api/dashboard` | `server/routes/dashboard.ts` |
| `/api/students` | `server/routes/students.ts` |
| `/api/staff` | `server/routes/staff.ts` |
| `/api/departments` | `server/routes/departments.ts` |
| `/api/compliance` | `server/routes/compliance.ts` |

All routes are mounted in `server/server.ts`. Database queries live in `server/queries.ts`; low-level SQLite setup is in `server/database.ts`.

### Frontend Structure

- `src/App.tsx` — React Router configuration with all 12 routes
- `src/lib/api.ts` — typed API client (all fetch calls go here)
- `src/components/ui/` — Radix UI wrappers shared across the app
- `src/components/layout/` — `AppLayout` wraps every page with nav/shell
- Page components in `src/pages/` compose domain components from `src/components/{domain}/`

### Database

SQLite database at `db/school.db` (auto-created on first server start). Schema is in `db/schema.sql`, sample data in `db/seed.sql`.

**Migration system**: `db/migrations/` holds numbered `.sql` files (`001_...`, `002_...`). `server/database.ts` runs pending migrations on every startup against existing databases; fresh installs apply `schema.sql` directly and mark all migration files as applied. Add new migrations as numbered files — never edit existing ones.

The seed data belongs to school `00000000-0000-0000-0000-000000000001` ("Default School"). Register a new school via `POST /api/auth/register` to get a JWT for the default school's admin, or create a new school entirely.

### Internationalization (i18n)

The UI supports **English (`en`)** and **Lithuanian (`lt`)** via `react-i18next`.

- **Translations** live in `src/locales/{en,lt}/*.json`, one namespace per domain: `common`, `auth`, `dashboard`, `students`, `staff`, `departments`, `compliance`, `notifications`, `errors`. Add every new user-facing string to BOTH languages — keys are typed (`src/i18n/i18next.d.ts`), so a missing key in the `en` files is a compile error.
- **Rules**: semantic keys (`students.actions.add`), interpolation over concatenation (`"Showing {{count}}"`), plurals via i18next suffixes — Lithuanian needs `_one`, `_few`, `_many`, `_other`.
- **Helpers** in `src/i18n/`: `formatDate()`/`formatTenure()` (locale-aware, use instead of raw date-fns `format`), `useLabels()` (translates DB enum values like ranks/positions/degrees/statuses — DB stores canonical English), `useErrorMessage()` + `getErrorCode()` (see below).
- **API errors are stable CODES**, not sentences: server returns `{ error: 'INVALID_CREDENTIALS' }`; the client stores the code in state and renders `errorMessage(code)`. New server errors need a code entry in `src/locales/{en,lt}/errors.json`. `queries.ts` throws `Error('SOME_CODE')`; routes map codes to HTTP statuses.
- **Language selection**: detected from browser, persisted in `localStorage` (`language` key). Signed-in users' choice is also stored in `users.preferred_language` (via `PATCH /api/auth/language`, and on login/register) so server-sent emails (`server/email.ts`) use the right language.
- **User data is NOT translated** (names, department names, agreement titles, free-text notes) — only UI chrome and enum-like values.

### Auth flow

1. `POST /api/auth/register` — creates a `schools` row + `school_admin` user, returns `{ token, user }`
2. `POST /api/auth/login` — returns `{ token, user }`
3. All `/api/*` routes (except `/api/auth/*`) require `Authorization: Bearer <token>`
4. Write operations (POST/PUT/DELETE on staff, departments) require `role = school_admin | super_admin`
