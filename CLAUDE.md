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

## Architecture

Full-stack TypeScript school administration app:

- **Frontend**: React 18 + Vite, React Router v6, React Query v5, Tailwind CSS, Radix UI components
- **Backend**: Express v5, better-sqlite3 (WAL mode), tsx for dev
- **Shared types**: `shared/types/index.ts` is the single source of truth for data models — update this first when adding/changing entities

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

SQLite database at `db/school.db` (auto-created on first server start). Schema is in `db/schema.sql`, sample data in `db/seed.sql`. No migration system — schema changes require manual SQL or re-seeding.
