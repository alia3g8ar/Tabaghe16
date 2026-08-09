<div align="center">

<img src="./frontend/src/assets/logo.png" alt="Tabaghe16 Logo" width="150" />

# TABAGHE16

### A Full-Stack Podcast Platform

**Next.js · React · NestJS · TypeScript · MySQL · Vercel · Aiven **

<br />

A modern full-stack web experience inspired by the Persian podcast **Tabaghe16**.

Built as a **portfolio project** to explore real-world frontend architecture, backend development, authentication, database management, deployment, and production workflows.

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Website-000000?style=for-the-badge\&logo=vercel\&logoColor=white)](https://tabaghe-16.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github)](https://github.com/alia3g8ar/Tabaghe16)

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square\&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-20232A?style=flat-square\&logo=react)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square\&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square\&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square\&logo=mysql\&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Services-black?style=flat-square\&logo=vercel)

</div>

---

> [!IMPORTANT]
>
> ### Portfolio Project — Not the Official Tabaghe16 Website
>
> This repository is an independent **portfolio and educational project** inspired by the Tabaghe16 podcast.
>
> It is **not the official website of the podcast**, is not presented as an official product, and exists primarily to demonstrate full-stack software engineering and product-development skills.

---

## ✦ About the Project

**Tabaghe16** is much more than a static podcast landing page.

The project was built as a complete full-stack application where a public podcast experience, authentication system, administration tools, REST API, relational database, and production deployment all live inside the same codebase.

The idea was simple:

> Build something that feels closer to a real product than a tutorial project.

That means dealing not only with UI development, but also with authentication, API design, database persistence, migrations, environment configuration, deployment, production debugging, Git workflows, and the small problems that appear when all of those systems meet.

```text
                        TABAGHE16
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      Public Experience              Admin Experience
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                   Next.js Frontend
                            │
                            │ REST API
                            ▼
                     NestJS Backend
                            │
                   ┌────────┴────────┐
                   │                 │
                   ▼                 ▼
             Authentication       MySQL
             & Authorization      Database
```

---

# ✨ Features

## 🎙️ Podcast Experience

The public-facing application provides the core experience expected from a modern podcast platform.

* Browse podcast content
* Explore episodes
* Open dedicated podcast and content pages
* Navigate through a responsive public interface
* Consume content through a polished dark-themed experience
* Access the platform across desktop and mobile devices

---

## 🔐 Authentication

Authentication is handled by the backend rather than being simulated only in the UI.

The authentication flow includes:

* Email-based authentication
* OTP email verification
* JWT-based authorization
* Access token handling
* Refresh token flow
* Protected routes
* Authenticated user sessions
* Password hashing with `bcrypt`
* Configurable OTP expiration
* OTP resend cooldown
* Verification attempt limits

A simplified flow looks like this:

```text
Email
  │
  ▼
Request OTP
  │
  ▼
Email Verification
  │
  ▼
Authentication
  │
  ├── Access Token
  │
  └── Refresh Token
  │
  ▼
Authenticated Session
```

---

## 👤 User Experience

Authenticated users have access to functionality beyond the public website, including account-related interfaces and personalized content behavior.

The frontend also includes profile and saved-content experiences designed around authenticated users.

---

## 🛠️ Admin Dashboard

Tabaghe16 includes a separate administration experience for managing application data.

The dashboard architecture is separated from the public-facing interface and is designed for protected management operations such as:

* Podcast management
* Content management
* User management
* Administrator profile management
* Protected dashboard navigation
* Authenticated administrative operations

---

# 🧠 Architecture

The project follows a **monorepo architecture**.

```text
Tabaghe16/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── constants/
│   │   ├── contexts/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   │
│   ├── src/
│   │   ├── common/
│   │   ├── config/
│   │   ├── database/
│   │   ├── modules/
│   │   └── scripts/
│   │
│   ├── test/
│   └── package.json
│
├── DEPLOYMENT.md
├── vercel.json
└── README.md
```

The two applications remain independent while sharing the same repository and release workflow.

---

# ⚡ Tech Stack

## Frontend

| Technology         | Purpose                              |
| ------------------ | ------------------------------------ |
| **Next.js 16**     | Application framework and App Router |
| **React 19**       | Component-based UI                   |
| **TypeScript**     | Static typing                        |
| **Tailwind CSS 4** | Styling and responsive UI            |
| **Redux Toolkit**  | Application state management         |
| **React Redux**    | Redux integration                    |
| **Formik**         | Form management                      |
| **Yup**            | Form validation                      |
| **Lucide React**   | Interface icons                      |
| **Font Awesome**   | Additional iconography               |

---

## Backend

| Technology            | Purpose                          |
| --------------------- | -------------------------------- |
| **NestJS 11**         | Backend framework                |
| **TypeScript**        | Backend type safety              |
| **TypeORM**           | ORM and database migrations      |
| **MySQL**             | Relational database              |
| **JWT**               | Authentication and authorization |
| **bcrypt**            | Password hashing                 |
| **Nodemailer**        | OTP email delivery               |
| **class-validator**   | Request validation               |
| **class-transformer** | DTO transformation               |
| **Jest**              | Testing                          |
| **Supertest**         | End-to-end HTTP testing          |

---

## Infrastructure

| Technology          | Purpose                          |
| ------------------- | -------------------------------- |
| **Vercel Services** | Frontend and backend deployment  |
| **Managed MySQL**   | Production database              |
| **GitHub**          | Source control and collaboration |
| **Git**             | Development and release workflow |

---

# 🔄 How Everything Connects

In production, Tabaghe16 runs as multiple services behind the same Vercel project.

```text
                     ┌──────────────────┐
                     │      Client      │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │      Vercel      │
                     └────────┬─────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼

            /(frontend)              /api/backend/*
                │                           │
                ▼                           ▼
       ┌────────────────┐          ┌────────────────┐
       │    Next.js     │          │     NestJS     │
       │    Frontend    │          │    Backend     │
       └────────────────┘          └───────┬────────┘
                                          │
                                          ▼
                                 ┌──────────────────┐
                                 │      MySQL       │
                                 └──────────────────┘
```

Requests matching:

```text
/api/backend/*
```

are routed to the NestJS service.

Everything else is served by the Next.js frontend.

---

# 🚀 Live Demo

The project is deployed on Vercel.

### Production

**https://tabaghe-16.vercel.app/**

> Remember: the deployed application is a portfolio/demo implementation and should not be confused with an official Tabaghe16 podcast website.

---

# 🏁 Getting Started

## Prerequisites

Make sure the following tools are available on your machine:

* Node.js 20+
* npm
* Git
* MySQL

Clone the repository:

```bash
git clone https://github.com/alia3g8ar/Tabaghe16.git
cd Tabaghe16
```

For development work, switch to the development branch:

```bash
git switch develop
```

---

# 🎨 Frontend Setup

Move into the frontend service:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The frontend runs locally at:

```text
http://localhost:3000
```

---

# ⚙️ Backend Setup

Open another terminal and move into the backend service:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Start NestJS in development mode:

```bash
npm run start:dev
```

The API runs locally at:

```text
http://localhost:3001
```

---

# 🔑 Environment Configuration

Real environment files are intentionally excluded from Git.

Never commit:

```text
.env
.env.local
.env.production
database credentials
JWT secrets
email passwords
tokens
private keys
```

Only template files such as `.env.example` should be committed.

---

## Frontend

The primary frontend environment variable is:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

It determines which backend the frontend communicates with.

---

## Backend

The backend uses environment configuration for several areas:

### Authentication

```text
JWT_SECRET
```

### Email / OTP

```text
EMAIL
PASSWORD_EMAIL
OTP_TTL_SECONDS
OTP_COOLDOWN_SECONDS
OTP_MAX_ATTEMPTS
```

### Database

```text
TYPE_DB
HOST_DB
PORT_DB
USERNAME_DB
PASSWORD_DB
DATABASE_DB
AUTOLOADENTITIES
SYNCHRONIZE
```

### Database SSL

```text
DB_SSL_ENABLED
DB_SSL_CA_BASE64
```

### CORS

```text
FRONTEND_URL
```

> [!CAUTION]
> Production secrets belong in the deployment platform's environment configuration — never inside the Git repository.

---

# 🗄️ Database & Migrations

Database persistence is handled using **MySQL + TypeORM**.

The backend provides dedicated migration commands.

Check migration status:

```bash
cd backend
npm run migration:show
```

Run migrations:

```bash
npm run migration:run
```

Check the state again:

```bash
npm run migration:show
```

Production database changes should be reviewed carefully before deployment.

For complete deployment and migration details, see:

```text
DEPLOYMENT.md
```

---

# 🧪 Available Commands

## Frontend

```bash
cd frontend
```

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js development server |
| `npm run build` | Create a production build            |
| `npm run start` | Start the production build           |
| `npm run lint`  | Run ESLint                           |

---

## Backend

```bash
cd backend
```

| Command                          | Description                             |
| -------------------------------- | --------------------------------------- |
| `npm run start:dev`              | Start NestJS in watch mode              |
| `npm run build`                  | Compile the backend                     |
| `npm run start:prod`             | Run the compiled production application |
| `npm run lint`                   | Run backend linting                     |
| `npm test`                       | Run unit tests                          |
| `npm run test:e2e`               | Run end-to-end tests                    |
| `npm run test:cov`               | Generate test coverage                  |
| `npm run migration:show`         | Inspect database migrations             |
| `npm run migration:run`          | Apply database migrations               |
| `npm run seed:demo`              | Seed demo data                          |
| `npm run import:legacy-podcasts` | Import legacy podcast data              |

---

# 🌿 Git Workflow

The repository follows a simple two-branch release strategy.

```text
              Development
                   │
                   ▼
               develop
                   │
          Build / Test / Review
                   │
                   ▼
             Pull Request
                   │
                   ▼
                 main
                   │
                   ▼
              Production
```

## `develop`

Used for active development and integration.

```bash
git switch develop
git pull origin develop
```

New work should normally land here first.

---

## `main`

Represents the stable production version.

Changes should reach `main` only after they have been validated on `develop`.

A normal release looks like:

```text
feature / fix
     ↓
develop
     ↓
validation
     ↓
main
     ↓
Vercel Production
```

---

# ✅ Before a Release

A basic local verification can be performed with:

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
cd ../backend
npm run build
npm test
```

Also verify:

```text
✓ No real environment files are staged
✓ Database changes are understood
✓ Required migrations are ready
✓ Frontend build succeeds
✓ Backend build succeeds
✓ Authentication still works
✓ Public pages load correctly
✓ API requests resolve correctly
✓ Production environment variables are configured
```

Then merge the validated changes from:

```text
develop → main
```

---

# ☁️ Deployment

Tabaghe16 is deployed from the repository root using **Vercel Services**.

The project contains two services:

```text
frontend
└── Next.js

backend
└── NestJS
```

The repository-level `vercel.json` defines service roots and routing behavior.

```text
Repository
    │
    ├── frontend/
    │      └── Next.js Service
    │
    └── backend/
           └── NestJS Service
```

Production branch:

```text
main
```

Development branch:

```text
develop
```

For the complete production checklist and environment setup, read:

```text
DEPLOYMENT.md
```

---

# 🎯 Why We Built It

Tabaghe16 exists primarily as a **software engineering portfolio project**.

The goal is not simply to show that we can create a web page.

The goal is to demonstrate experience with the pieces that turn a web page into an application:

```text
UI Engineering
       +
Frontend Architecture
       +
State Management
       +
Authentication
       +
Authorization
       +
REST API Design
       +
Database Design
       +
Migrations
       +
Environment Management
       +
Deployment
       +
Git Workflow
       +
Production Debugging
```

The project has been continuously developed, refactored, debugged, migrated, deployed, and improved as new challenges appeared.

That evolution is part of the project.

---

# 🧩 Engineering Goals

Some of the principles behind the project are:

* Keep frontend and backend responsibilities clearly separated
* Keep sensitive configuration outside source control
* Use migrations instead of unsafe production schema synchronization
* Keep development work away from the production branch
* Validate changes before releasing
* Maintain a production-like deployment architecture
* Build reusable frontend components
* Keep API concerns inside the backend
* Treat authentication as a real backend responsibility
* Prefer maintainable architecture over quick one-off fixes

---

# 🗺️ Project Status

### Implemented

* ✅ Monorepo architecture
* ✅ Next.js frontend
* ✅ NestJS backend
* ✅ Responsive public interface
* ✅ Podcast content experience
* ✅ Authentication system
* ✅ Email OTP verification
* ✅ JWT authentication
* ✅ User account experience
* ✅ Admin dashboard
* ✅ MySQL database
* ✅ TypeORM integration
* ✅ Database migrations
* ✅ Demo data tooling
* ✅ Vercel Services deployment
* ✅ Development / production Git workflow

### Continuing Improvements

* 🚧 Broader automated test coverage
* 🚧 CI/CD improvements
* 🚧 Monitoring and observability
* 🚧 Performance improvements
* 🚧 Accessibility improvements
* 🚧 Additional security hardening
* 🚧 Continued UI/UX refinement

Software is never really finished.

Neither is Floor 16.

---

# 🤝 Development

For development:

```bash
git switch develop
```

Before starting:

```bash
git pull origin develop
```

After making changes:

```bash
git status
git add .
git commit -m "feat: describe your change"
git push origin develop
```

Do **not** commit secrets or real `.env` files.

Production changes should be released through the project's normal:

```text
develop → main
```

workflow.

---

# 👨‍💻 Authors

Built by

### [Aliasghar Aryayimehr](https://www.linkedin.com/in/aliasghar-aryayimehr)

and

### MMDB

with a lot of:

```text
code
coffee
commits
merge conflicts
production debugging
and way too many terminal tabs
```

---

<div align="center">

<img src="./frontend/src/assets/logo.png" alt="Tabaghe16 Logo" width="90" />

### TABAGHE16

**A portfolio project inspired by a podcast.
Not the official website.**

Built with `Next.js` · `NestJS` · `TypeScript` · `MySQL` · `Vercel`

<br />

**From `localhost` to production.**

</div>
