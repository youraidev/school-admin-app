# Deployment Guide

Full instructions for deploying **SchoolAdmin** from scratch to production on Vercel with Neon PostgreSQL and Upstash Redis.

---

## Architecture Overview

```
Browser
  └── Vercel (CDN + Serverless Functions)
        ├── /                  → dist/index.html  (Vite SPA)
        └── /api/*             → api/index.ts     (Express serverless)
              └── Neon PostgreSQL  (production database)
              └── Upstash Redis    (rate limiting)
```

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + Vite | Built to `dist/`, served as static files |
| Backend | Express.js | Runs as a single Vercel serverless function via `api/index.ts` |
| Database | Neon PostgreSQL | Serverless Postgres; connection via WebSocket Pool |
| Cache / Rate-limit | Upstash Redis | Sliding-window rate limiting on auth endpoints |
| ORM | Drizzle ORM | Schema defined in `server/db/schema.ts` |
| Auth | JWT (jsonwebtoken) | 7-day tokens; secret set via `JWT_SECRET` env var |

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free Hobby plan is enough)
- A [Neon](https://neon.tech) account (free tier is enough)
- A [Upstash](https://upstash.com) account (free tier is enough)

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/youraidev/school-admin-app.git
cd school-admin-app
npm install
```

---

## Step 2 — Create the Neon Database

1. Go to [console.neon.tech](https://console.neon.tech) → **New Project**
2. Choose a region (e.g. `AWS us-east-1` for lowest Vercel latency)
3. Project name: `school-admin-app` (or anything)
4. Once created, open the project → **Connection Details**
5. Select the **Pooled connection** tab
6. Copy the connection string — it looks like:
   ```
   postgresql://neondb_owner:<password>@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
   > ⚠️ Always use the **pooled** URL (contains `-pooler` in the hostname). It supports WebSocket connections required by `@neondatabase/serverless`.

---

## Step 3 — Environment Variables

Create a `.env` file in the project root (never commit this file):

```bash
cp .env.example .env
```

Then fill in the values:

```env
# PostgreSQL — Neon pooled connection string
DATABASE_URL=postgresql://neondb_owner:<password>@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# JWT signing secret — generate with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-64-char-hex-secret-here

# Set to 'development' locally, 'production' in Vercel
NODE_ENV=development

# Your production Vercel URL — used for CORS
FRONTEND_URL=https://school-app-two-chi.vercel.app

# Upstash Redis — leave empty locally if you don't need rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Generate `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4 — Push Database Schema

This creates all tables in your Neon database using Drizzle:

```bash
npm run db:push
```

When prompted about adding constraints to existing tables, choose **"No, add the constraint without truncating the table"**.

> If the interactive prompt gets stuck, apply constraints manually:
> ```bash
> node --env-file=.env -e "
> const { neon } = require('@neondatabase/serverless');
> const sql = neon(process.env.DATABASE_URL);
> sql\`ALTER TABLE staff ADD CONSTRAINT staff_school_email_unique UNIQUE (school_id, email)\`
>   .then(() => console.log('done')).catch(e => console.log(e.message));
> "
> ```

---

## Step 5 — Seed Demo Data (Optional)

Populates the database with a demo school, 5 staff, 4 students, compliance documents, etc.:

```bash
npm run db:seed
```

Demo login credentials after seeding:
- **Email:** `admin@school.edu`
- **Password:** `Admin1234!`

---

## Step 6 — Run Locally

```bash
npm run dev
```

This starts:
- Vite dev server at `http://localhost:5173` (frontend)
- Express server at `http://localhost:3000` (API)

---

## Step 7 — GitHub Repository

```bash
git init   # (skip if already a git repo)
git remote add origin https://github.com/<your-username>/school-admin-app.git
git add -A
git commit -m "Initial commit"
git push -u origin main
```

> ⚠️ Make sure `.env` is in `.gitignore` **before** pushing. It already is in this project, but double-check with `git status`.

---

## Step 8 — Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework Preset:** select **Other** (not Vite — the API needs a custom build)
4. **Build & Output Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Click **Deploy** (it will fail the first time — that's fine, we add env vars next)

---

## Step 9 — Add Environment Variables to Vercel

Go to your Vercel project → **Settings → Environment Variables** and add:

| Key | Value | Environments |
|-----|-------|-------------|
| `DATABASE_URL` | Your Neon pooled connection string | Production, Preview |
| `JWT_SECRET` | Your generated hex secret | Production, Preview |
| `NODE_ENV` | `production` | Production |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Production, Preview |
| `UPSTASH_REDIS_REST_URL` | From Upstash (Step 10) | Production, Preview |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash (Step 10) | Production, Preview |

> 💡 Find your Vercel app URL at: Project → Overview → Domains section.

After adding env vars, Vercel shows a **"Redeploy"** toast — click it to apply.

---

## Step 10 — Create Upstash Redis (Rate Limiting)

1. Go to [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Settings:
   - **Type:** Regional
   - **Region:** `us-east-1` (or nearest to your Vercel region)
   - **Name:** `school-app-redis`
   - **Plan:** Free
3. After creation, scroll to the **REST API** section
4. Copy:
   - `UPSTASH_REDIS_REST_URL` (starts with `https://`)
   - `UPSTASH_REDIS_REST_TOKEN` (long string)
5. Add both to Vercel env vars (as shown in Step 9)

> **Alternatively:** Use the Vercel ↔ Upstash integration (Vercel → Storage → Create → Upstash for Redis) which auto-creates the database and injects env vars. Just make sure the injected variable names match exactly (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`) — Vercel's integration may use different names like `KV_URL`. If so, add the correctly named vars manually pointing to the same values.

---

## Step 11 — Redeploy

After all env vars are set, trigger a fresh deployment:

```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

Or use the Vercel dashboard → **Deployments → Redeploy**.

---

## Build System

### How the build works

```
npm run build
  ├── tsc -p tsconfig.server.json   → compiles server TypeScript to dist-server/
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

- `/api/*` requests → `api/index.ts` (Express serverless function)
- All other requests → `dist/index.html` (SPA client-side routing)

---

## Database Driver Notes

The project uses `drizzle-orm/neon-serverless` with `Pool` (WebSocket mode):

```ts
// server/db/index.ts
import ws from 'ws';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

neonConfig.webSocketConstructor = ws; // required for Node.js (Vercel serverless)

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

**Why WebSocket mode?** The `neon-http` driver (HTTP mode) does **not** support `db.transaction()`. The WebSocket mode (`neon-serverless` + `Pool`) supports full PostgreSQL transactions.

**Why `ws` package?** Vercel serverless runs on Node.js, which doesn't have a native browser `WebSocket` global. The `ws` package fills that gap. If you migrate to **Vercel Edge Runtime**, remove `neonConfig.webSocketConstructor = ws` since Edge has native WebSockets.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server (Vite + Express) |
| `npm run build` | Build for production (tsc + vite) |
| `npm run db:push` | Push schema changes to database (interactive) |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:seed` | Seed demo data into the database |
| `npm run lint` | Run ESLint |

---

## TypeScript Configuration

The project has separate TypeScript configs for frontend and backend:

| File | Purpose |
|------|---------|
| `tsconfig.json` | Root config — references app + node + server configs |
| `tsconfig.app.json` | Frontend (React) — targets `src/` |
| `tsconfig.node.json` | Vite config file |
| `tsconfig.server.json` | Backend — targets `server/` + `api/` |
| `api/tsconfig.json` | Extends `tsconfig.server.json` — tells Vercel's type checker to use server types |

The `api/tsconfig.json` is critical: without it, Vercel's isolated type-check of `api/index.ts` won't see `server/express.d.ts` and will error on `req.user`.

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon pooled PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (min 32 chars) |
| `NODE_ENV` | ✅ | `production` on Vercel, `development` locally |
| `FRONTEND_URL` | ✅ | CORS origin (your Vercel app URL) |
| `UPSTASH_REDIS_REST_URL` | ⚠️ optional | Upstash Redis REST URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ optional | Upstash Redis REST token for rate limiting |

> If `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are not set, the rate-limit middleware falls back to `express-rate-limit` (in-memory). This is fine for a single serverless instance but won't share state across instances.

---

## Common Issues & Fixes

### `No transactions support in neon-http driver`
**Cause:** Using `drizzle-orm/neon-http` with `db.transaction()`.  
**Fix:** Switch to `drizzle-orm/neon-serverless` with `Pool` (see Database Driver Notes above).

### `Property 'user' does not exist on type 'Request'`
**Cause:** Vercel type-checks `api/index.ts` without seeing `server/express.d.ts`.  
**Fix:** `api/tsconfig.json` extending `tsconfig.server.json` is already in place.

### `Internal server error` on register/login
**Cause:** Tables don't exist yet. Run `npm run db:push` first.  
**Fix:** `npm run db:push`

### CORS errors in production
**Cause:** `FRONTEND_URL` env var not set or incorrect.  
**Fix:** Set `FRONTEND_URL=https://your-app.vercel.app` in Vercel env vars.

### Build fails with TypeScript errors
**Cause:** Frontend has strict `noUnusedLocals`/`noUnusedParameters` rules.  
**Fix:** The Vercel build only runs `vite build` (frontend) — server TS errors won't block it. Check `tsconfig.server.json` for server-only strictness.

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
