# طبقه ۱۶ — Tabaghe16

پروژه «طبقه ۱۶» — پادکستی درباره‌ی زندگی، کار و انتخاب‌های روزمره. مخاطب‌ها می‌تونن اپیزودها رو گوش بدن، تو پلتفرم‌های محبوب دنبالش کنن و با سازنده‌ها در ارتباط باشن.

The official website for the Persian podcast *Tabaghe16 (Floor 16)* — a show about life, work, and everyday choices. Listeners can browse episodes, follow the podcast on their favorite platforms, and reach out to the team.

## Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | Next.js (App Router), React, Tailwind CSS, Redux Toolkit          |
| Backend    | NestJS, TypeORM, MySQL, JWT auth, OTP email verification          |
| Deployment | Vercel (Services: `frontend` + `backend`), MySQL managed database |

## Project Structure

```text
tabaghe16/
├── frontend/   # Next.js application (public site + admin dashboard)
└── backend/    # NestJS API (podcasts, episodes, auth, users)
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A MySQL database (local or managed)

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`. In development, the API defaults to `http://localhost:3001`.

### 2. Backend

```bash
cd backend
npm install
npm run start:dev
```

The API runs on `http://localhost:3001`.

> Copy `.env.example` to `.env` in each service and fill in the values before
> starting (see [Environment Variables](#environment-variables)).

## Environment Variables

### Frontend (`frontend/.env`)

| Variable              | Example                                        |
| --------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` (or the deployed API)  |

### Backend (`backend/.env`)

| Variable              | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `JWT_SECRET`          | Secret used to sign authentication tokens              |
| `EMAIL`               | Gmail address used to send OTP emails                  |
| `PASSWORD_EMAIL`      | Gmail app password for sending emails                  |
| `TYPE_DB`             | Database type, e.g. `mysql`                            |
| `HOST_DB`             | Database host                                          |
| `PORT_DB`             | Database port, e.g. `3306`                             |
| `USERNAME_DB`         | Database user                                          |
| `PASSWORD_DB`         | Database password                                      |
| `DATABASE_DB`         | Database name, e.g. `tabaghe16`                        |
| `AUTOLOADENTITIES`    | `true` in development                                  |
| `SYNCHRONIZE`         | `false` in production (schema sync is dev-only)        |
| `FRONTEND_URL`        | Deployed frontend URL (CORS origin)                    |
| `DB_SSL_ENABLED`      | `true` when the database requires an SSL connection    |
| `DB_SSL_CA_BASE64`    | Base64-encoded PEM CA certificate (when SSL is enabled) |
| `OTP_TTL_SECONDS`     | OTP validity window (default `120`)                    |
| `OTP_COOLDOWN_SECONDS`| Resend cooldown (default `60`)                         |
| `OTP_MAX_ATTEMPTS`    | Max verification attempts (default `5`)                |

Never commit real `.env` files — only `.env.example` templates are committed.

## Available Scripts

### Frontend

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the development server    |
| `npm run build` | Build for production            |
| `npm run start` | Start the production build      |
| `npm run lint`  | Run ESLint                      |

### Backend

| Command                      | Description                        |
| ---------------------------- | ---------------------------------- |
| `npm run start:dev`          | Start the dev server (watch mode)  |
| `npm run build`              | Compile the NestJS application     |
| `npm run migration:show`     | List pending database migrations   |
| `npm run migration:run`      | Apply pending migrations           |
| `npm run seed:demo`          | Seed demo data                     |
| `npm test`                   | Run unit tests                     |
| `npm run test:e2e`           | Run end-to-end tests               |

## Database Migrations

Migrations are managed manually and are never executed inside request
handlers or on application startup.

```bash
cd backend
npm run migration:show   # inspect pending migrations
npm run migration:run    # apply them
```

## Deployment

The project is deployed as **Vercel Services** from the repository root:

- **Production branch:** `main`
- **Development branch:** `develop`

`vercel.json` at the repository root defines the two services and rewrites
`/api/backend/*` to the backend service; all other paths are served by the
frontend. See `DEPLOYMENT.md` for the full release checklist.

### Release flow

1. Validate `develop` (lint, tests, build).
2. Run pending additive migrations before deploying code that needs them.
3. Merge `develop` into `main` (via pull request).
4. Verify the Vercel deployment and run smoke tests.

## Credits

Developed by [arya](https://www.linkedin.com/in/aliasghar-aryayimehr) and mmdb.
