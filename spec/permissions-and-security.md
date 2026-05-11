# Permissions and Security Specification

## 1. Authentication Model

The system uses **stateless JWT authentication**:

```
Client                         Server
  │  POST /api/auth/login         │
  │──────────────────────────────►│
  │                               │  verify credentials
  │  { token, user }              │  sign JWT (userId, schoolId, role)
  │◄──────────────────────────────│
  │                               │
  │  GET /api/staff               │
  │  Authorization: Bearer <jwt>  │
  │──────────────────────────────►│
  │                               │  decode JWT → req.user
  │  200 [ staff data ]           │  filter by schoolId
  │◄──────────────────────────────│
```

### JWT Properties
| Property | Value |
|----------|-------|
| Algorithm | HS256 (default jsonwebtoken) |
| Expiry | 7 days |
| Secret | `JWT_SECRET` env var |
| Payload | `{ userId, schoolId, role }` |
| Storage (FE) | `localStorage` (current) |

> ⚠️ **Known risk:** `localStorage` is vulnerable to XSS. Future improvement: move to `httpOnly` cookies.

---

## 2. Role-Based Access Control (RBAC)

### 2.1 Roles

| Role | Description |
|------|-------------|
| `super_admin` | Platform-level administrator (not exposed in UI yet) |
| `school_admin` | Full access within their school |
| `staff` | Read-only access (currently) |

### 2.2 Permission Matrix

| Endpoint | `staff` | `school_admin` | `super_admin` |
|----------|---------|---------------|--------------|
| `GET /api/dashboard/*` | ✅ | ✅ | ✅ |
| `GET /api/staff` | ✅ | ✅ | ✅ |
| `GET /api/staff/:id` | ✅ | ✅ | ✅ |
| `POST /api/staff` | ❌ | ✅ | ✅ |
| `PUT /api/staff/:id` | ❌ | ✅ | ✅ |
| `GET /api/students` | ✅ | ✅ | ✅ |
| `GET /api/students/:id` | ✅ | ✅ | ✅ |
| `POST /api/students` | ❌ | ✅ | ✅ |
| `GET /api/departments` | ✅ | ✅ | ✅ |
| `POST /api/departments` | ❌ | ✅ | ✅ |
| `PUT /api/departments/:id` | ❌ | ✅ | ✅ |
| `DELETE /api/departments/:id` | ❌ | ✅ | ✅ |
| `GET /api/compliance` | ✅ | ✅ | ✅ |

### 2.3 Enforcement

Role enforcement uses the `requireRole()` middleware:

```ts
router.post('/', requireRole('school_admin', 'super_admin'), async (req, res, next) => { ... });
```

**Rule SEC-RBAC-01:** Every mutation endpoint (POST, PUT, DELETE) MUST have `requireRole('school_admin', 'super_admin')` unless explicitly documented as open.

---

## 3. Tenant Isolation

**Multi-tenancy is enforced at the query layer, not the route layer.**

The `authenticate` middleware extracts `schoolId` from the JWT and attaches it to `req.user`. All queries use this `schoolId` to scope data:

```ts
// Every query function signature:
async function getStaffById(schoolId: string, staffId: string)

// Every Drizzle query:
where: and(eq(staff.schoolId, schoolId), eq(staff.id, staffId))
```

**Rule SEC-TENANT-01:** Every query function MUST include a `schoolId` filter. Failure to do so is a critical security vulnerability.

**Rule SEC-TENANT-02:** The `schoolId` used in queries MUST always come from `req.user.schoolId` (JWT), never from request body or query parameters.

**Rule SEC-TENANT-03:** Cross-tenant access must never be possible. If a resource belongs to a different school, the query must return `null` or empty, resulting in a `404` response.

---

## 4. Password Security

| Property | Value |
|----------|-------|
| Hashing algorithm | bcrypt |
| Cost factor | 12 |
| Min length | 8 characters |
| Max length | 72 characters (bcrypt limit) |
| Storage | Hash only — never plain text |

**Rule SEC-PASS-01:** `hashPassword()` is async. It MUST be awaited. Failure to await results in storing a Promise object as the hash (silent auth failure).

**Rule SEC-PASS-02:** `verifyPassword()` must use constant-time comparison (`bcrypt.compare`). Never compare hashes with `===`.

---

## 5. Password Reset Security

```
1. User requests reset → server creates random token (crypto.randomBytes)
2. Token is hashed (SHA-256) before storage → token_hash stored, not token
3. Raw token sent to user's email as URL parameter
4. On reset: user's raw token is hashed → compared against stored hash
5. Token is single-use: marked with used_at timestamp
6. Token expires: expires_at checked before use
```

**Rule SEC-RESET-01:** Password reset responses always return the same message regardless of whether the email exists. This prevents email enumeration attacks.

**Rule SEC-RESET-02:** Reset tokens expire after 1 hour (or as configured). Expired tokens must be rejected.

**Rule SEC-RESET-03:** Reset tokens are single-use. After use, `used_at` is set and the token is rejected on subsequent attempts.

---

## 6. Rate Limiting

| Endpoint | Limiter | Fallback |
|----------|---------|---------|
| `POST /api/auth/login` | Upstash Redis sliding window | express-rate-limit (in-memory) |
| `POST /api/auth/forgot-password` | Upstash Redis sliding window | express-rate-limit (in-memory) |

**Rule SEC-RATE-01:** Authentication endpoints MUST be rate-limited in production.

**Rule SEC-RATE-02:** The in-memory fallback (`express-rate-limit`) is not shared across serverless instances. Do not rely on it for production rate limiting.

---

## 7. CORS

```ts
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : ['http://localhost:5174'];

app.use(cors({ origin: allowedOrigins }));
```

**Rule SEC-CORS-01:** `FRONTEND_URL` MUST be set in production. CORS must not be `*` (wildcard).

**Rule SEC-CORS-02:** Multiple origins can be specified in `FRONTEND_URL` as a comma-delimited list (e.g. for preview deployments).

---

## 8. Input Sanitisation

- All user-supplied strings are `.trim()`-ed before storage
- Email addresses are `.toLowerCase().trim()`-ed before lookup and storage
- SQL injection is prevented by Drizzle ORM's parameterised queries
- No raw string interpolation into SQL

**Rule SEC-INPUT-01:** Never construct SQL strings via string concatenation with user input.

**Rule SEC-INPUT-02:** Validate data types before passing to queries. Drizzle does not automatically coerce types.

---

## 9. Secrets Management

| Secret | Where stored |
|--------|-------------|
| `DATABASE_URL` | Vercel env vars / `.env` (local) |
| `JWT_SECRET` | Vercel env vars / `.env` (local) |
| `UPSTASH_REDIS_REST_URL` | Vercel env vars |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel env vars |

**Rule SEC-SECRETS-01:** Secrets MUST NOT be committed to the repository. `.env` and `.env.local` are git-ignored.

**Rule SEC-SECRETS-02:** `JWT_SECRET` in development defaults to `'dev-secret-change-in-production'` with a startup warning if not explicitly set. In production, the app throws if `JWT_SECRET` is absent.

---

## 10. Known Risks & Future Improvements

| Risk | Severity | Mitigation |
|------|----------|-----------|
| JWT in `localStorage` (XSS risk) | Medium | Migrate to `httpOnly` cookie strategy |
| No request body size limit | Low | Add `express.json({ limit: '1mb' })` |
| `target_departments` stored as comma string | Low | Normalise to junction table |
| No audit log for mutations | Medium | Add `audit_log` table for sensitive actions |
| No email verification on registration | Low | Add email verification flow |
| `super_admin` role not enforced in UI | Low | Add super-admin dashboard for platform management |
