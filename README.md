<div align="center">

<img src="./frontend/src/assets/logo.png" alt="Tabaghe16 Logo" width="150" />

# TABAGHE16

### TABAGHE16 — Full-Stack Podcast Platform

**A production-oriented full-stack portfolio project built with Next.js, NestJS, MySQL, Aiven and Vercel.**

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Tabageh16-000000?style=for-the-badge\&logo=vercel\&logoColor=white)](https://tabaghe-16.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/alia3g8ar/Tabaghe16)

<br />

![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?style=flat-square\&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.0-20232A?style=flat-square\&logo=react)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square\&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square\&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.4.8-4479A1?style=flat-square\&logo=mysql\&logoColor=white)
![Aiven](https://img.shields.io/badge/Aiven-Managed_MySQL-FF3554?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Services-black?style=flat-square\&logo=vercel)

</div>

---

> [!IMPORTANT]
>
> ## Portfolio Project — Not the Official Tabaghe16 Website
>
> **Tabaghe16 is an independent portfolio and educational project inspired by the Persian podcast “Tabaghe16”.**
>
> This repository is **not the official website of the podcast** and is not presented as an official product or service.
>
> The project was created to demonstrate practical full-stack software engineering skills through a real-world product-style architecture.

---

# ✦ About

**Tabaghe16** is a full-stack podcast platform built as a software engineering portfolio project.

Instead of creating only a static landing page, the project explores how the different parts of a modern web application work together:

* Public podcast experience
* Podcast and episode APIs
* Authentication
* Email OTP verification
* JWT access and refresh tokens
* Role-based authorization
* User profiles
* Admin dashboard
* Podcast management
* User management
* MySQL persistence
* Database migrations
* Secure production database connectivity
* Multi-service deployment
* Production-oriented Git workflow

The main goal is simple:

> **Build something closer to a real product than a tutorial project.**

---

# ✨ Features

## 🎙️ Podcast Experience

The public side of Tabaghe16 provides a modern podcast browsing experience.

It includes:

* Home page
* Podcast listing
* Podcast detail experience
* Watch / media pages
* Published-content filtering
* Featured content sections
* Responsive navigation
* Mobile-friendly interface
* Dark visual design
* API-driven podcast data
* External media playback integration

---

## 🔐 Authentication

Authentication is implemented in the backend rather than simulated only in the frontend.

The authentication system includes:

* Email-based sign-in
* OTP verification
* JWT authentication
* Access tokens
* Refresh tokens
* Protected API endpoints
* Authenticated sessions
* Password hashing with `bcrypt`
* OTP expiration
* OTP resend cooldown
* Verification attempt limits

A simplified authentication flow:

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

## 🛡️ Authorization

The application supports multiple access levels:

```text
user
admin
owner
```

Role-based authorization is enforced by the backend for protected operations.

This allows public users, administrators and owners to have different levels of access to application functionality.

---

## 👤 User Experience

Authenticated users have access to account-related functionality including:

* User profile
* Account information
* Avatar support
* Authenticated navigation
* Saved-content experience
* Protected user actions

---

## 🛠️ Admin Dashboard

Tabaghe16 contains a dedicated administration experience separated from the public website.

The dashboard includes areas for:

* Podcast management
* User management
* Administrator profile management
* Protected dashboard routes
* Role-aware navigation
* Administrative API operations

The goal is to demonstrate both the public product experience and the internal tools required to manage it.

---

# 🧠 Architecture

Tabaghe16 is organized as a **monorepo** containing an independent frontend and backend.

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
├── .gitignore
└── README.md
```

The repository contains only one Git history shared by both services.

---

# ⚡ Tech Stack

## Frontend

| Technology          | Purpose                           |
| ------------------- | --------------------------------- |
| **Next.js 16.2.12** | Frontend framework and App Router |
| **React 19.2**      | User interface                    |
| **TypeScript**      | Static typing                     |
| **Tailwind CSS 4**  | Styling and responsive layout     |
| **Redux Toolkit**   | Application state management      |
| **React Redux**     | Redux integration                 |
| **Formik**          | Form management                   |
| **Yup**             | Form validation                   |
| **Lucide React**    | UI icons                          |
| **Font Awesome**    | Additional iconography            |

---

## Backend

| Technology            | Purpose                           |
| --------------------- | --------------------------------- |
| **NestJS 11**         | REST API and backend architecture |
| **TypeScript**        | Backend type safety               |
| **TypeORM 0.3.27**    | ORM and database migrations       |
| **mysql2 3.22.4**     | MySQL database driver             |
| **JWT**               | Authentication and authorization  |
| **bcrypt**            | Secure credential hashing         |
| **Nodemailer**        | Email and OTP delivery            |
| **class-validator**   | Request validation                |
| **class-transformer** | DTO transformation                |
| **Jest**              | Testing infrastructure            |
| **Supertest**         | HTTP / E2E testing infrastructure |

---

## Database & Infrastructure

| Technology          | Purpose                                     |
| ------------------- | ------------------------------------------- |
| **MySQL 8.4.8**     | Production relational database              |
| **Aiven for MySQL** | Managed production database service         |
| **TLS**             | Encrypted backend-to-database communication |
| **Vercel Services** | Frontend and backend deployment             |
| **GitHub**          | Repository and collaboration                |
| **Git**             | Development and release workflow            |

---

# 🌐 Production Architecture

The production infrastructure intentionally separates the **application layer** from the **persistence layer**.

```text
                           User
                            │
                            ▼
                  ┌───────────────────┐
                  │      Vercel       │
                  └─────────┬─────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼

         Next.js Frontend         NestJS Backend
            Service                  Service
                │                       │
                │                       │
                │                 TypeORM + mysql2
                │                       │
                │                       │ TLS
                │                       ▼
                │              ┌──────────────────┐
                │              │      Aiven       │
                │              │                  │
                │              │ Managed MySQL    │
                │              │      8.4.8       │
                │              └──────────────────┘
                │
                └────────── Application ──────────
```

In short:

```text
Frontend  → Next.js → Vercel
Backend   → NestJS  → Vercel
Database  → MySQL   → Aiven
ORM       → TypeORM
Driver    → mysql2
Security  → TLS
```

---

# ☁️ Vercel Services

Tabaghe16 is deployed from the repository root using **Vercel Services**.

The project contains two application services:

```text
frontend/
└── Next.js

backend/
└── NestJS
```

The repository-level `vercel.json` defines the service roots and routing behavior.

Requests are routed approximately like this:

```text
/
├── frontend routes
│
└── /api/backend/*
    └── NestJS backend
```

The public backend prefix is:

```text
/api/backend
```

All remaining application routes are handled by the frontend service.

---

# 🗄️ Aiven & MySQL

Production persistence is handled by **Aiven for MySQL**.

The current production database stack is:

```text
Provider    Aiven
Engine      MySQL
Version     8.4.8
ORM         TypeORM 0.3.27
Driver      mysql2 3.22.4
Security    TLS
```

Aiven provides the persistent database infrastructure independently from Vercel application deployments.

That separation gives the project a more realistic production architecture:

```text
Application Runtime
        │
        ▼
      Vercel

Persistent Data
        │
        ▼
      Aiven
```

Redeploying the frontend or backend therefore does not recreate the production database.

---

# 🔒 Database Security

The production NestJS backend connects to Aiven using an encrypted **TLS connection**.

Database TLS support is configured using environment variables such as:

```env
DB_SSL_ENABLED=true
DB_SSL_CA_BASE64=<base64-encoded-ca-certificate>
```

The CA certificate and all database credentials are stored outside the repository.

They must never be committed to Git.

---

# 🚀 Live Demo

The current primary deployment is available at:

### https://tabaghe-16.vercel.app/

The production application uses:

```text
Frontend       Vercel / Next.js
Backend        Vercel / NestJS
API Prefix     /api/backend
Database       Aiven for MySQL
Connection     TLS
```

> The deployed application is a portfolio implementation and should not be confused with the official Tabaghe16 podcast website.

---

# 🏁 Getting Started

## Requirements

You will need:

* Node.js
* npm
* Git
* MySQL for local database development

Clone the repository:

```bash
git clone https://github.com/alia3g8ar/Tabaghe16.git
cd Tabaghe16
```

Development work should start from:

```bash
git switch develop
```

Then synchronize it:

```bash
git pull origin develop
```

---

# 🎨 Frontend Setup

Enter the frontend service:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start development mode:

```bash
npm run dev
```

The frontend runs locally at:

```text
http://localhost:3000
```

---

# ⚙️ Backend Setup

Open another terminal:

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

Configure your local MySQL credentials and start NestJS:

```bash
npm run start:dev
```

The backend runs locally at:

```text
http://localhost:3001
```

---

# 🔑 Environment Variables

Real credentials must never be committed to the repository.

Only `.env.example` templates belong in Git.

---

## Frontend

The frontend uses:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

This determines which backend service the frontend communicates with.

---

## Backend

### Authentication

```text
JWT_SECRET
```

### Email & OTP

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

### Aiven / TLS

```text
DB_SSL_ENABLED
DB_SSL_CA_BASE64
```

### CORS

```text
FRONTEND_URL
```

---

> [!CAUTION]
> Never commit:
>
> * `.env`
> * `.env.local`
> * Production database credentials
> * Aiven connection strings
> * Aiven passwords
> * TLS certificates
> * JWT secrets
> * Gmail app passwords
> * Access tokens
> * Refresh tokens
> * GitHub tokens
> * Vercel tokens
> * Private keys

If a secret is accidentally committed, removing the file from the latest commit is **not enough**. The secret should be rotated and the Git history reviewed.

---

# 🗄️ Database Migrations

Database schema changes are managed through **TypeORM migrations**.

Check migration state:

```bash
cd backend
npm run migration:show
```

Run pending migrations:

```bash
npm run migration:run
```

Check again:

```bash
npm run migration:show
```

Production schema synchronization should remain disabled:

```env
SYNCHRONIZE=false
```

The project uses migrations rather than relying on unsafe automatic schema synchronization in production.

For deployment-specific migration behavior, see:

```text
DEPLOYMENT.md
```

---

# 📦 Demo & Legacy Data

The backend includes tooling for populating and importing podcast data.

Available commands include:

```bash
npm run seed:demo
```

and:

```bash
npm run import:legacy-podcasts
```

The production setup has been used with imported legacy podcast records rather than relying only on static frontend data.

---

# 🧪 Development Commands

## Frontend

```bash
cd frontend
```

| Command         | Description               |
| --------------- | ------------------------- |
| `npm run dev`   | Start development mode    |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build  |
| `npm run lint`  | Run ESLint                |

---

## Backend

```bash
cd backend
```

| Command                          | Description                     |
| -------------------------------- | ------------------------------- |
| `npm run start:dev`              | Start NestJS in watch mode      |
| `npm run build`                  | Compile the backend             |
| `npm run start:prod`             | Run the compiled backend        |
| `npm run lint`                   | Run backend ESLint              |
| `npm test`                       | Run configured Jest tests       |
| `npm run test:e2e`               | Run configured E2E test command |
| `npm run test:cov`               | Generate test coverage          |
| `npm run migration:show`         | Show migration status           |
| `npm run migration:run`          | Apply migrations                |
| `npm run seed:demo`              | Seed demo data                  |
| `npm run import:legacy-podcasts` | Import legacy podcast content   |

> Automated test coverage is still an area of active improvement in the project.

---

# 🌿 Git Workflow

Tabaghe16 follows a two-branch development and release workflow.

```text
feature / fix
     │
     ▼
  develop
     │
     ▼
lint / build / smoke test
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

---

## `develop`

The active development branch.

Start new development work with:

```bash
git switch develop
git pull origin develop
```

After making changes:

```bash
git status
git add .
git status
git commit -m "feat: describe the change"
git push origin develop
```

---

## `main`

The stable production branch.

Changes should move to `main` only after validation on `develop`.

Preferred release flow:

```text
develop
   ↓
testing
   ↓
Pull Request
   ↓
main
   ↓
Vercel Production
```

Direct feature development on `main` should be avoided.

---

# ✅ Release Checklist

Before promoting changes to production:

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
```

Check migration state when database changes are involved:

```bash
npm run migration:show
```

Then verify:

```text
✓ Working tree is clean
✓ No .env files are staged
✓ No credentials are exposed
✓ Frontend lint passes
✓ Frontend build passes
✓ Backend build passes
✓ Required database migrations are understood
✓ Public pages load correctly
✓ Authentication still works
✓ Admin routes remain protected
✓ API requests resolve correctly
✓ No unexpected CORS errors appear
✓ Production environment variables are configured
✓ Vercel deployment completes successfully
```

Then:

```text
develop
   ↓
main
   ↓
Production
```

---

# 🔄 Production Request Flow

A typical request travels through the system like this:

```text
User
 │
 ▼
Vercel
 │
 ├───────────────────────────────┐
 │                               │
 ▼                               ▼
Next.js                        NestJS
Frontend                      Backend
                                 │
                                 ▼
                              TypeORM
                                 │
                                 ▼
                              mysql2
                                 │
                                 │ TLS
                                 ▼
                         Aiven for MySQL
```

This architecture allows application deployment and database persistence to evolve independently.

---

# 🎯 Why This Project Exists

Tabaghe16 exists primarily as a **software engineering portfolio project**.

The objective was never just:

```text
"Build a nice website."
```

The project is intended to demonstrate experience across a much broader stack:

```text
Frontend Engineering
        +
Component Architecture
        +
Responsive UI
        +
State Management
        +
Backend Engineering
        +
REST API Design
        +
Authentication
        +
Authorization
        +
JWT
        +
OTP
        +
Database Design
        +
TypeORM
        +
MySQL
        +
Aiven
        +
TLS
        +
Database Migrations
        +
Environment Management
        +
Vercel Services
        +
Git Workflow
        +
Production Deployment
        +
Debugging
```

In other words:

> **The interesting part is not just making the page work.
> The interesting part is making the entire system work together.**

---

# 🧩 Engineering Principles

Some of the ideas behind the project:

* Keep frontend and backend responsibilities separate
* Keep persistent data outside the application runtime
* Keep production secrets outside source control
* Use migrations for database schema changes
* Avoid production schema synchronization
* Protect administrative operations server-side
* Treat authentication as a backend responsibility
* Use role-based authorization
* Develop on `develop`
* Release stable code through `main`
* Validate builds before deployment
* Keep production database connections encrypted
* Separate Vercel compute from Aiven persistence
* Prefer maintainable solutions over temporary production hacks

---

# 📍 Current Platform Capabilities

```text
✅ Monorepo architecture

Frontend
✅ Next.js 16
✅ React 19
✅ TypeScript
✅ Tailwind CSS
✅ Redux Toolkit
✅ Responsive public interface
✅ Podcast browsing
✅ Watch experience
✅ Authentication UI
✅ User profile experience
✅ Admin dashboard

Backend
✅ NestJS
✅ REST API
✅ Email OTP
✅ JWT access tokens
✅ Refresh tokens
✅ Role-based authorization
✅ User management
✅ Podcast management
✅ DTO validation

Database
✅ TypeORM
✅ mysql2
✅ MySQL 8.4.8
✅ Aiven managed database
✅ TLS-secured production connection
✅ Database migrations
✅ Legacy podcast import tooling

Infrastructure
✅ Vercel Services
✅ Next.js frontend service
✅ NestJS backend service
✅ Aiven persistence layer
✅ develop → main release workflow
```

---

# 🚧 Continuing Improvements

The repository is actively evolving.

Areas that can still be improved include:

* Automated unit test coverage
* Integration testing
* End-to-end testing
* GitHub Actions CI
* OTP rate limiting
* Additional abuse protection
* Monitoring
* Centralized logging
* Error tracking
* Backend and database health checks
* Aiven backup and restore procedures
* Migration rollback documentation
* Deployment rollback documentation
* Accessibility improvements
* Performance optimization
* Dependency security review
* Additional production hardening
* Continued UI/UX refinement

Software is rarely finished.

Neither is Floor 16.

---

# 🔐 Security Notes

Several security rules are intentionally part of the development workflow:

```text
Never expose secrets.
Never commit real .env files.
Never store production credentials in source code.
Never enable production schema synchronization.
Never bypass backend authorization with frontend-only checks.
Never push unreviewed development directly to production.
```

Aiven credentials and TLS configuration belong only in secure environment-variable storage.

---

# 🤝 Contributing

Development work should normally start from `develop`.

```bash
git switch develop
git pull origin develop
```

Create your changes, validate them, and commit with a meaningful message:

```bash
git add .
git status
git commit -m "feat: describe your change"
git push origin develop
```

Examples:

```bash
git commit -m "feat: add podcast management"
git commit -m "fix: resolve authentication error"
git commit -m "refactor: simplify user service"
git commit -m "chore: update deployment configuration"
git commit -m "docs: improve project documentation"
```

Production releases should follow:

```text
develop → review → main → Vercel
```

---

# 👨‍💻 Authors

Built by

### [Aliasghar Aryayimehr](https://www.linkedin.com/in/aliasghar-aryayimehr)

and

### MMDB

with a healthy amount of:

```text
code
coffee
commits
debugging
merge conflicts
database migrations
Vercel deployments
Aiven connections
and too many terminal tabs
```

---

<div align="center">

<img src="./frontend/src/assets/logo.png" alt="Tabaghe16 Logo" width="90" />

## TABAGHE16

### From `localhost` to production.

**Next.js · React · NestJS · TypeScript · MySQL · Aiven · Vercel**

<br />

**A portfolio project inspired by a podcast.**

**Not the official Tabaghe16 website.**

</div>
