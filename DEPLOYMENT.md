# Deployment Guide

Full instructions for **SchoolAdmin** — local Docker development and production deployment on Vercel + Neon PostgreSQL + Upstash Redis.

---

## Architecture Overview

```
┌─────────────────────────── LOCAL DEV ──────────────────────────────┐
│  Browser → http://localhost:5173  (Vite dev server)                │
│         → http://localhost:3000   (Express API, tsx watch)         │
│                └── Docker: PostgreSQL :5433 · Redis :6380          │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────── PRODUCTION ─────────────────────────────┐
│  Browser → Vercel CDN                                              │
│         ├── /          → dist/index.html   (Vite SPA, static)     │
│         └── /api/*     → api/index.ts      (Express serverless)   │
│                └── Neon PostgreSQL  (production DB)                │
│                └── Upstash Redis    (rate limiting)                │
└────────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + Vite | Built to `dist/`, served as static files |
| Backend | Express.js | Single Vercel serverless function via `api/index.ts` |
| Database | PostgreSQL | Local: Docker · Production: Neon |
| DB driver | `pg` (node-postgres) | Standard TCP; works with Docker and Neon equally |
| ORM | Drizzle ORM | Schema in `server/db/schema.ts` |
| Cache / Rate-limit | Upstash Redis | Sliding-window on auth endpoints; in-memory fallback locally |
| Auth | JWT (jsonwebtoken) | 7-day tokens, secret via `JWT_SECRET` env var |

---

## Prerequisites

- **Docker** (for local dev)
- Node.js ≥ 18, npm ≥ 9
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free Hobby plan)
- A [Neon](https://neon.tech) account (free tier)
- A [Upstash](https://upstash.com) account (free tier)

---

## Part A — Local Development

### A1 — Clone & Install

```bash
git clone https://github.com/youraidev/school-admin-app.git
cd school-admin-app
npm install
```

### A2 — Set Up Local Environment

```bash
cp .env.local .env
```

`.env.local` is pre-configured for Docker and is already in the repo (git-ignored). Its contents:

```env
DATABASE_URL=postgresql://school:school@localhost:5433/schooldb
JWT_SECRET=local-dev-secret-do-not-use-in-production-abc123xyz
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> ⚠️ `.env` is git-ignored. Never commit it. Only `.env.local` (the template) and `.env.example` (production template) live in the repo.

### A3 — Start Docker Containers

```bash
npm run docker:up
```

This starts two containers:

| Container | Image | Host Port | Purpose |
|-----------|-------|-----------|---------|
| `school-app-postgres` | `postgres:16-alpine` | `5433` | Primary database |
| `school-app-redis` | `redis:7-alpine` | `6380` | Rate-limit store |

> Ports `5433` and `6380` are used because `5432` and `6379` may already be occupied by other local services (e.g. other Docker projects).

### A4 — Push Schema & Seed Data

On first run only:

```bash
npm run db:push    # creates all tables in the local Docker database
npm run db:seed    # loads demo school, staff, students, compliance docs
```

Demo login after seeding:
- **Email:** `admin@school.edu`
- **Password:** `Admin1234!`

### A5 — Start Dev Server

```bash
npm run dev
```

Starts both concurrently:
- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`

Hot-reloading is active for both frontend (Vite HMR) and backend (`tsx watch`).

### A6 — Daily Workflow

```bash
npm run docker:up   # ensure containers are running (safe to run repeatedly)
npm run dev         # start frontend + backend
```

### A7 — Docker Commands Reference

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start containers in background |
| `npm run docker:down` | Stop containers (data persisted in Docker volume) |
| `npm run docker:reset` | Wipe database volume and start fresh |

After `docker:reset`, re-run `db:push` and `db:seed`.

---

## Part B — Production Deployment (Vercel + Neon)

### B1 — Create the Neon Database

1. Go to [console.neon.tech](https://console.neon.tech) → **New Project**
2. Choose a region (e.g. `AWS us-east-1` for lowest Vercel latency)
3. Once created, open the project → **Connection Details**
4. Copy the **pooled** connection string (contains `-pooler` in the hostname):
   ```
   postgresql://neondb_owner:<password>@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
   > The plain `pg` driver connects to Neon via standard TCP+SSL — no special WebSocket driver needed.

### B2 — Push Schema to Production

Switch `.env` to point at Neon, then run:

```bash
npm run db:push
```

When prompted about adding a unique constraint to an existing table, choose  
**"No, add the constraint without truncating the table"**.

> If the interactive prompt gets stuck, apply the constraint directly via SQL:
> ```bash
> node --env-file=.env -e "
> const { Pool } = require('pg');
> const pool = new Pool({ connectionString: process.env.DATABASE_URL });
> pool.query('ALTER TABLE staff ADD CONSTRAINT staff_school_email_unique UNIQUE (school_id, email)')
>   .then(() => { console.log('done'); pool.end(); })
>   .catch(e => { console.log(e.message); pool.end(); });
> "
> ```

### B3 — GitHub Repository

```bash
git init   # skip if already a repo
git remote add origin https://github.com/<your-username>/school-admin-app.git
git add -A
git commit -m "Initial commit"
git push -u origin main
```

### B4 — Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework Preset:** select **Other** (not Vite)
4. **Build & Output Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Click **Deploy** (first deploy may fail — env vars come next)

### B5 — Add Environment Variables to Vercel

Go to **Settings → Environment Variables** and add:

| Key | Value | Environments |
|-----|-------|-------------|
| `DATABASE_URL` | Neon pooled connection string | Production, Preview |
| `JWT_SECRET` | 64-char hex secret (see below) | Production, Preview |
| `NODE_ENV` | `production` | Production only |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Production, Preview |
| `UPSTASH_REDIS_REST_URL` | From Upstash (Step B6) | Production, Preview |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash (Step B6) | Production, Preview |

Generate `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> 💡 Find your Vercel URL at: Project → Overview → Domains section.

### B6 — Create Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Settings: **Regional**, region `us-east-1`, name `school-app-redis`, **Free** plan
3. After creation, scroll to **REST API** and copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Add both to Vercel env vars (step B5)

> **Shortcut:** Use the Vercel ↔ Upstash integration (Vercel → Integrations → Upstash) which auto-creates the DB and injects env vars. If the injected names differ (e.g. `KV_URL`), add the correctly named vars (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) manually with the same values.

### B7 — Redeploy

Vercel auto-deploys on every `git push`. To trigger manually:

```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

Or: Vercel dashboard → **Deployments → Redeploy**.

---

## Build System

```
npm run build
  ├── tsc -p tsconfig.server.json   → type-checks server TypeScript
  └── vite build                    → bundles React SPA to dist/
```

### Vercel routing (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index" },
    { "source": "/(.*)",       "destination": "/index.html" }
  ]
}
```

- `/api/*` → `api/index.ts` (Express serverless function)
- Everything else → `dist/index.html` (SPA client-side routing)

---

## Database Driver

The project uses the standard `pg` (node-postgres) driver:

```ts
// server/db/index.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

**Why plain `pg` and not `@neondatabase/serverless`?**

| Driver | Transactions | Local Docker | Neon | Edge Runtime |
|--------|-------------|-------------|------|-------------|
| `neon-http` | ❌ | ❌ | ✅ | ✅ |
| `neon-serverless` + `ws` | ✅ | ❌ | ✅ | ✅ |
| **`pg` (this project)** | ✅ | ✅ | ✅ | ❌ |

Vercel runs on **Node.js runtime** (not Edge Runtime), so standard TCP connections work fine with both Docker and Neon. The `pg` driver is the simplest choice that supports all environments.

> If you ever migrate to **Vercel Edge Runtime**, switch to `drizzle-orm/neon-serverless` + `@neondatabase/serverless` Pool.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev (Vite HMR + Express tsx watch) |
| `npm run build` | Production build (tsc + vite) |
| `npm run db:push` | Push schema to whichever DB is in `.env` |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:seed` | Seed demo data into the current DB |
| `npm run docker:up` | Start local Docker containers |
| `npm run docker:down` | Stop local Docker containers |
| `npm run docker:reset` | Wipe DB volume and restart fresh |
| `npm run lint` | Run ESLint |

---

## TypeScript Configuration

| File | Purpose |
|------|---------|
| `tsconfig.json` | Root — references app, node, and server configs |
| `tsconfig.app.json` | Frontend (React) — targets `src/` |
| `tsconfig.node.json` | Vite config file |
| `tsconfig.server.json` | Backend — targets `server/` + `api/` |
| `api/tsconfig.json` | Extends `tsconfig.server.json` — critical for Vercel's isolated type-check |

> `api/tsconfig.json` is essential: without it, Vercel's type-check of `api/index.ts` won't see `server/express.d.ts` and will error on `req.user`.

---

## Environment Variable Reference

| Variable | Local | Production | Description |
|----------|-------|-----------|-------------|
| `DATABASE_URL` | `postgresql://school:school@localhost:5433/schooldb` | Neon pooled URL | PostgreSQL connection string |
| `JWT_SECRET` | any string | 64-char hex secret | JWT signing secret |
| `NODE_ENV` | `development` | `production` | Runtime mode |
| `FRONTEND_URL` | `http://localhost:5173` | `https://your-app.vercel.app` | CORS allowed origin |
| `UPSTASH_REDIS_REST_URL` | *(empty)* | Upstash REST URL | Rate-limit store |
| `UPSTASH_REDIS_REST_TOKEN` | *(empty)* | Upstash REST token | Rate-limit store |

> When `UPSTASH_REDIS_REST_URL` is empty, rate limiting falls back to in-memory (`express-rate-limit`). Suitable for local dev; not shared across serverless instances in production.

---

## Common Issues & Fixes

### `password authentication failed` connecting to local Docker DB
**Cause:** Port mismatch or stale `.env` still pointing at Neon.  
**Fix:** Ensure `.env` has `DATABASE_URL=postgresql://school:school@localhost:5433/schooldb` (copy from `.env.local`).

### `No transactions support in neon-http driver`
**Cause:** Using `drizzle-orm/neon-http` with `db.transaction()`.  
**Fix:** Already resolved — project uses `pg` + `drizzle-orm/node-postgres`.

### `Property 'user' does not exist on type 'Request'`
**Cause:** Vercel type-checks `api/index.ts` without seeing `server/express.d.ts`.  
**Fix:** `api/tsconfig.json` extending `tsconfig.server.json` is already in place.

### `Internal server error` on register/login (production)
**Cause:** Tables don't exist in the Neon database yet.  
**Fix:** Point `.env` at Neon and run `npm run db:push`.

### CORS errors in production
**Cause:** `FRONTEND_URL` env var not set or incorrect.  
**Fix:** Set `FRONTEND_URL=https://your-app.vercel.app` in Vercel env vars.

### Build fails with TypeScript errors
**Cause:** `tsconfig.app.json` has strict `noUnusedLocals`/`noUnusedParameters`.  
**Fix:** The Vercel build only type-checks the server (`tsc -p tsconfig.server.json`); frontend errors don't block Vercel's `vite build`. Fix unused imports in `src/` to keep the codebase clean.

---

## Security Checklist

- [x] `.env` in `.gitignore` — secrets never committed to git
- [x] `JWT_SECRET` is cryptographically random (32+ bytes)
- [x] CORS restricted to `FRONTEND_URL` only
- [x] Rate limiting on `/api/auth/login` and `/api/auth/register`
- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] Password max-length validation (72 chars — bcrypt limit)
- [x] Email format validated with regex
- [x] All queries scoped by `school_id` (tenant isolation)
- [x] `staff(school_id, email)` unique constraint prevents duplicates
