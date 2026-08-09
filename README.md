<div align="center">

# 🏢 طبقه ۱۶ — Tabaghe16

### A Full-Stack Podcast Platform · Built as a Portfolio Project

یک تجربه‌ی Full-Stack برای نمایش، مدیریت و دنبال‌کردن محتوای پادکست؛
از صفحه‌ی عمومی و اپیزودها تا احراز هویت، پنل مدیریت و API.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232a?logo=react)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479a1?logo=mysql\&logoColor=white)](https://www.mysql.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com/)

<br />

### [🚀 Live Demo](https://tabaghe-16.vercel.app)

</div>

---

> [!IMPORTANT]
> **Tabaghe16 is a portfolio / demo project.**
> این Repository با هدف تمرین و نمایش مهارت‌های طراحی و توسعه‌ی Full-Stack ساخته شده و **وب‌سایت رسمی پادکست «طبقه ۱۶» نیست**.

---

## 🎙️ درباره پروژه

**Tabaghe16** یک پروژه‌ی Full-Stack برای پیاده‌سازی تجربه‌ی یک پلتفرم پادکست فارسی است.

هدف پروژه فقط ساختن یک Landing Page نبوده؛ این Repository تلاش می‌کند بخش‌های مختلف یک محصول واقعی را کنار هم قرار دهد:

* رابط کاربری عمومی
* نمایش و مرور اپیزودها
* صفحه‌ی اختصاصی هر اپیزود
* پخش / مشاهده‌ی محتوای پادکست
* احراز هویت کاربران
* ورود با OTP ایمیلی
* مدیریت Access و Refresh Token
* پنل مدیریت
* مدیریت کاربران و نقش‌ها
* مدیریت محتوای پادکست
* API مستقل
* دیتابیس و Migration
* Deployment چندسرویسی

به زبان ساده:

```text
Podcast UI
    +
Authentication
    +
Admin Dashboard
    +
REST API
    +
Database
    +
Production Deployment
```

همه در یک Monorepo.

---

## ✨ What’s Inside?

### 🌐 Public Experience

بخش عمومی پروژه برای تجربه‌ی مخاطب پادکست طراحی شده:

* صفحه اصلی
* لیست اپیزودها
* مشاهده جزئیات اپیزود
* صفحه Watch
* نمایش فقط محتوای منتشرشده
* طراحی Responsive
* ارتباط مستقیم Frontend با Backend API

### 🔐 Authentication

احراز هویت پروژه فقط یک فرم نمایشی نیست.

Backend شامل جریان Authentication بر پایه‌ی:

```text
Email
  ↓
OTP Verification
  ↓
JWT Access Token
  ↓
Refresh Token
  ↓
Authenticated Session
```

است.

همچنین سطوح دسترسی مختلف برای کاربران در نظر گرفته شده:

```text
user
admin
owner
```

### 🛠️ Admin Dashboard

پنل مدیریت برای کنترل بخش‌های مختلف اپلیکیشن ساخته شده و شامل بخش‌هایی مانند:

* مدیریت Podcastها
* مدیریت کاربران
* پروفایل مدیر
* کنترل دسترسی بر اساس Role
* محافظت از Routeهای خصوصی

است.

---

# 🧠 Architecture

Tabaghe16 به‌صورت **Monorepo** توسعه داده می‌شود:

```text
tabaghe16/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── constants/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── src/
│   │   ├── common/
│   │   ├── config/
│   │   ├── database/
│   │   └── modules/
│   │       ├── app/
│   │       └── auth/
│   │
│   └── package.json
│
├── DEPLOYMENT.md
├── vercel.json
└── README.md
```

و جریان کلی درخواست‌ها تقریباً به این شکل است:

```text
┌─────────────────────┐
│      Browser        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Next.js Frontend    │
│ React + Redux       │
└──────────┬──────────┘
           │
           │ /api/backend/*
           ▼
┌─────────────────────┐
│    NestJS API       │
│ Auth · Users ·      │
│ Podcasts            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ TypeORM + MySQL     │
└─────────────────────┘
```

---

# ⚡ Tech Stack

## Frontend

| Technology               | Usage                           |
| ------------------------ | ------------------------------- |
| **Next.js 16**           | App Router, routing & rendering |
| **React 19**             | UI                              |
| **TypeScript**           | Type safety                     |
| **Tailwind CSS**         | Styling                         |
| **Redux Toolkit**        | Client state management         |
| **Formik + Yup**         | Forms & validation              |
| **Lucide / FontAwesome** | Icons                           |

## Backend

| Technology          | Usage               |
| ------------------- | ------------------- |
| **NestJS 11**       | REST API            |
| **TypeScript**      | Backend development |
| **TypeORM**         | ORM & migrations    |
| **MySQL**           | Relational database |
| **JWT**             | Authentication      |
| **bcrypt**          | Secure hashing      |
| **Nodemailer**      | OTP email delivery  |
| **class-validator** | Request validation  |

## Infrastructure

| Technology          | Usage                               |
| ------------------- | ----------------------------------- |
| **Vercel Services** | Frontend + Backend deployment       |
| **Managed MySQL**   | Production database                 |
| **GitHub**          | Source control & collaboration      |
| **Git**             | `develop` / `main` release workflow |

---

# 🚀 Getting Started

## Requirements

قبل از اجرا مطمئن شوید این موارد را دارید:

```text
Node.js 20+
npm
MySQL
Git
```

Repository را Clone کنید:

```bash
git clone https://github.com/alia3g8ar/Tabaghe16.git

cd Tabaghe16

git switch develop
```

> `develop` شاخه‌ی اصلی توسعه است.
> `main` برای نسخه‌ی پایدار و Production نگه داشته می‌شود.

---

## 🎨 Frontend

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

Frontend به‌صورت پیش‌فرض روی:

```text
http://localhost:3000
```

اجرا می‌شود.

---

## ⚙️ Backend

در Terminal دیگری:

```bash
cd backend

npm install

cp .env.example .env

npm run start:dev
```

Backend به‌صورت پیش‌فرض روی:

```text
http://localhost:3001
```

اجرا می‌شود.

---

# 🔑 Environment Variables

مقادیر واقعی Environment Variableها **نباید** داخل Repository قرار بگیرند.

فقط فایل‌های نمونه:

```text
frontend/.env.example
backend/.env.example
```

در Git نگهداری می‌شوند.

### Frontend

متغیر اصلی:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend

Backend برای بخش‌های زیر Environment Variable دارد:

```text
JWT
Email / OTP
MySQL connection
Database SSL
CORS
OTP expiration
OTP cooldown
OTP attempt limits
```

جزئیات و نام متغیرها در:

```text
backend/.env.example
```

قابل مشاهده است.

> [!CAUTION]
> هیچ‌وقت `.env`، Password، JWT Secret، Database Credential، Token یا Private Key را Commit نکنید.

---

# 🗄️ Database & Migrations

Database schema با **TypeORM migrations** مدیریت می‌شود.

برای مشاهده Migrationهای در انتظار:

```bash
cd backend
npm run migration:show
```

برای اجرای آن‌ها:

```bash
npm run migration:run
```

Migrationها به‌صورت خودکار داخل Request Handler یا هنگام Startup اجرا نمی‌شوند.

---

# 🧪 Development Commands

## Frontend

```bash
cd frontend

npm run dev
npm run lint
npm run build
npm run start
```

## Backend

```bash
cd backend

npm run start:dev
npm run build
npm run migration:show
npm run migration:run
npm run seed:demo
npm test
npm run test:e2e
```

---

# 🌿 Git Workflow

توسعه مستقیماً روی Production انجام نمی‌شود.

Workflow پروژه:

```text
feature / fix
     │
     ▼
  develop
     │
     ▼
 lint / build / test
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

### Development

```bash
git switch develop
git pull origin develop
```

پس از اعمال تغییرات:

```bash
git add .
git commit -m "feat: describe the change"
git push origin develop
```

### Production

بعد از Validation و تست:

```text
develop → Pull Request → main → Vercel
```

`main` همیشه باید نماینده‌ی نسخه‌ی پایدار پروژه باشد.

---

# ☁️ Deployment

پروژه با **Vercel Services** به‌صورت Monorepo Deploy می‌شود.

```text
Repository Root
      │
      ├── frontend ──► Next.js Service
      │
      └── backend  ──► NestJS Service
```

درخواست‌های Backend از مسیر:

```text
/api/backend/*
```

به Service مربوط به NestJS هدایت می‌شوند و سایر Routeها توسط Frontend مدیریت می‌شوند.

تنظیمات اصلی Deployment در:

```text
vercel.json
```

و مستندات Release در:

```text
DEPLOYMENT.md
```

قرار دارند.

---

# ✅ Before Shipping

قبل از Merge به `main`:

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd ../backend
npm run build
```

و سپس:

```text
✓ Check migrations
✓ Review Git diff
✓ Merge develop → main
✓ Verify Vercel deployment
✓ Run smoke tests
```

---

# 🎯 Why This Project?

Tabaghe16 در درجه‌ی اول یک **Portfolio Project** است.

هدف آن نمایش تجربه‌ی عملی در بخش‌هایی فراتر از ساخت UI بوده است؛ از جمله:

```text
Frontend Architecture
Backend Architecture
Authentication
Authorization
Database Design
API Design
Migrations
Environment Management
Git Workflow
Deployment
Production Debugging
```

این پروژه در طول توسعه بارها Refactor، Debug و Deploy شده و بخشی از هدف آن شبیه‌سازی چالش‌هایی است که در توسعه‌ی یک محصول Full-Stack واقعی اتفاق می‌افتد.

---

# 🗺️ Project Status

```text
✅ Monorepo architecture
✅ Public podcast experience
✅ Admin dashboard
✅ Authentication & authorization
✅ Email OTP flow
✅ Podcast API
✅ User management
✅ MySQL integration
✅ Database migrations
✅ Vercel Services deployment
✅ develop / main Git workflow

🚧 Automated test coverage
🚧 CI/CD improvements
🚧 Monitoring & observability
🚧 Further security hardening
```

Tabaghe16 هنوز فضای زیادی برای بهترشدن دارد — و بخشی از ارزش این Repository دقیقاً همین مسیر توسعه و تکامل آن است.

---

# 👨‍💻 Authors

Built with ☕, debugging sessions and probably too many terminal tabs by:

### [Aliasghar Aryayimehr](https://www.linkedin.com/in/aliasghar-aryayimehr)

and

### MMDB

---

<div align="center">

### طبقه ۱۶

**Not the official website. Just a project we enjoyed building. 🖤**

`Next.js` · `NestJS` · `TypeScript` · `MySQL` · `Vercel`

</div>
