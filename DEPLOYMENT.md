# Deployment Guide for Tabaghe16

## Architecture

The project is deployed as **Vercel Services** from the repository root.

- Project root: repository root
- Production branch: `main`
- Development branch: `develop`
- Frontend service: `frontend` (Next.js)
- Backend service: `backend` (NestJS)
- Public backend prefix: `/api/backend`

`vercel.json` at the repository root defines the two services and rewrites
`/api/backend/*` to the backend service; all other paths are served by the
frontend service. There is no separate AWS, DigitalOcean, or Railway server —
the NestJS backend runs as a Vercel service like the frontend.

## Environment Variables

Configure environment variables in the Vercel dashboard for each service.
Never commit real `.env` files; only `.env.example` templates are committed.

### Frontend service

| Variable | Example |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-service-url.example` |

`NEXT_PUBLIC_API_URL` must point at the deployed backend service so the
frontend reaches API routes such as `/api/backend/podcasts`. In local
development it defaults to `http://localhost:3001`.

### Backend service

| Variable | Example |
| --- | --- |
| `JWT_SECRET` | `your-jwt-secret-key-here` |
| `EMAIL` | `your-email@gmail.com` |
| `PASSWORD_EMAIL` | `your-email-app-password` |
| `TYPE_DB` | `mysql` |
| `HOST_DB` | `your-database-host` |
| `PORT_DB` | `3306` |
| `USERNAME_DB` | `your-database-user` |
| `PASSWORD_DB` | `your-database-password` |
| `DATABASE_DB` | `tabaghe16` |
| `AUTOLOADENTITIES` | `true` |
| `SYNCHRONIZE` | `false` |
| `FRONTEND_URL` | `https://your-frontend-service-url.example` |
| `DB_SSL_ENABLED` | `false` |
| `DB_SSL_CA_BASE64` | `your-base64-encoded-ca-certificate` (only when `DB_SSL_ENABLED=true`) |
| `OTP_TTL_SECONDS` | `120` |
| `OTP_COOLDOWN_SECONDS` | `60` |
| `OTP_MAX_ATTEMPTS` | `5` |

Notes:

- `SYNCHRONIZE` must be `false` in Production. TypeORM schema sync is only
  allowed in local development.
- `DB_SSL_CA_BASE64` is required only when `DB_SSL_ENABLED=true`; it must be a
  valid Base64-encoded PEM CA certificate.
- `OTP_TTL_SECONDS`, `OTP_COOLDOWN_SECONDS`, and `OTP_MAX_ATTEMPTS` are
  optional and fall back to safe defaults when missing or invalid.

## Database Migrations

Migrations are managed manually — they are **never executed inside a request
handler** and are **not run automatically on application startup** (`migrationsRun`
is `false`).

```bash
cd backend
npm run migration:show
npm run migration:run
npm run migration:show
```

- The first `migration:show` lists pending migrations against the target
  database.
- `migration:run` applies them.
- The second `migration:show` confirms the applied state.

## Production Release Order

1. Validate `develop`: lint, tests, and builds must pass locally and in CI.
2. Run `npm run migration:show` against the Production database.
3. Run pending **additive** migrations **before** deploying code that requires
   them.
4. Create a pull request from `develop` to `main`.
5. Merge only after all checks pass.
6. Verify the Vercel Services deployment for both services.
7. Run Production smoke tests (public pages, public API, authentication,
   admin read-only checks).
8. Retain the previous Vercel deployment as the rollback target.

## Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run start:dev
```

## Verification Checklist

- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend builds successfully: `npm run build`
- [ ] No hydration errors in browser console
- [ ] Images load correctly (no 404 errors)
- [ ] API calls use `NEXT_PUBLIC_API_URL`, not hardcoded localhost
- [ ] CORS configured for production domains (`FRONTEND_URL`)
- [ ] `SYNCHRONIZE=false` in Production
- [ ] No real `.env` files committed
