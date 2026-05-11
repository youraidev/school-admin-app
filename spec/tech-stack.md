# Tech Stack Declaration

This document is the authoritative record of every technology in use.  
**Do not introduce new frameworks, libraries, or infrastructure without explicit approval.**

---

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI rendering |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| React Router | v6 | Client-side routing |
| Tailwind CSS | 3.x | Utility-first styling |
| Radix UI | Latest | Accessible UI primitives (Dialog, Select, Tabs, …) |
| Lucide React | Latest | Icon set |
| `clsx` / `tailwind-merge` | Latest | Conditional class name utility |

---

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| TypeScript | 5.x | Type safety |
| Express | 4.x | HTTP framework |
| `tsx` | Latest | TypeScript execution (dev only) |
| `pg` (node-postgres) | 8.x | Database driver |
| Drizzle ORM | Latest | ORM + schema management |
| `bcryptjs` | Latest | Password hashing |
| `jsonwebtoken` | Latest | JWT signing / verification |
| `@upstash/ratelimit` + `@upstash/redis` | Latest | Sliding-window rate limiting |
| `nodemailer` / Resend | Latest | Transactional email |
| `cors` | Latest | CORS middleware |
| `concurrently` | Latest | Run frontend + backend in parallel (dev) |
| `dotenv` | Latest | `.env` loading (dev only) |

---

## Database & Infrastructure

| Technology | Version / Tier | Purpose |
|-----------|---------------|---------|
| PostgreSQL | 16 | Primary database |
| Neon | Free / Pro | Managed Postgres (production) |
| Docker (`postgres:16-alpine`) | — | Local development database |
| Upstash Redis | Free | Rate limiting store (production) |
| Docker (`redis:7-alpine`) | — | Local Redis (development) |
| Vercel | Hobby / Pro | Hosting (CDN + serverless functions) |
| GitHub | Free | Source control + CI trigger |
| Resend | Free | Email delivery |

---

## Development Tooling

| Tool | Purpose |
|------|---------|
| ESLint | Linting |
| `drizzle-kit` | Schema push + migration generation |
| Docker Compose | Local service orchestration |
| `tsx watch` | Hot-reload Express server |

---

## Rules

- **TS-01:** Do not add a new npm package without first checking if the functionality can be achieved with existing dependencies or plain TypeScript.
- **TS-02:** UI components must use **Radix UI** primitives. Do not add a second component library (e.g. shadcn, MUI, Chakra).
- **TS-03:** Do not switch the CSS framework. Tailwind CSS is locked; do not mix in CSS Modules, Styled Components, or Emotion.
- **TS-04:** Do not switch the ORM. Drizzle ORM is locked; do not introduce Prisma, TypeORM, or Sequelize.
- **TS-05:** Do not switch the HTTP framework. Express is locked; do not introduce Fastify, Hono, or tRPC without explicit approval.
- **TS-06:** Do not introduce a state management library (Redux, Zustand, Jotai) without approval. React Context is sufficient for current needs.
- **TS-07:** TanStack Query is **pre-approved** as the next data-fetching upgrade — no additional approval needed when the refactor is ready.
- **TS-08:** Zod is **pre-approved** for input validation — no additional approval needed when the validation layer is introduced.

---

## Pre-Approved Future Additions

The following libraries have already been discussed and approved for introduction when the relevant refactor is undertaken:

| Library | Purpose | Spec reference |
|---------|---------|---------------|
| TanStack Query (`@tanstack/react-query`) | Data fetching, caching, invalidation | `architecture.md` §5.2 |
| Zod | Runtime validation schemas | `architecture.md` §5.3 |
| Vitest | Unit + integration testing | `testing-strategy.md` §3 |
| Supertest | API integration testing | `testing-strategy.md` §3 |
| `@testing-library/react` | Component testing | `testing-strategy.md` §3 |
| Playwright | End-to-end testing | `testing-strategy.md` §3 |
