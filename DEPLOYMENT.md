# Deployment Guide for Tabaghe16

## Project Structure
- Frontend: Next.js 16.0.3 (in `/frontend`)
- Backend: NestJS (in `/backend`)

## Changes Made for Linux/Vercel Compatibility

### 1. Fixed Hydration Mismatch Issues
- Converted all backend TypeScript files from CRLF to LF line endings
- Created `.editorconfig` to enforce consistent line endings
- Fixed image extensions in EpisodesStar component (`.jfif` → `.jpg`)

### 2. Fixed Image 404 Errors
- Updated `EpisodesStar.tsx` to reference correct image extensions
- Images now correctly reference `/images/img_4.jpg` instead of `/images/img_4.jfif`

### 3. Removed Hardcoded Localhost References
- Updated `api.ts` to use `NEXT_PUBLIC_API_URL` environment variable
- Added proper fallback and error handling for API URL
- Created `.env.example` for frontend with proper configuration

### 4. Fixed Build Errors
- Updated `watch/page.tsx` to use `next/navigation` instead of `next/router`
- Added `"use client"` directive to client components
- Wrapped `useSearchParams()` in Suspense boundary

### 5. Added CORS Configuration
- Backend now has proper CORS configuration with environment variable support
- CORS origin configurable via `FRONTEND_URL` environment variable

### 6. Environment Configuration

#### Frontend (Vercel)
Required environment variables in Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

#### Backend (Production Server)
Required environment variables:
```
JWT_SECRET=your-jwt-secret-key-here
EMAIL=your-email@gmail.com
PASSWORD_EMAIL=your-email-app-password
TYPE_DB=mysql
HOST_DB=your-database-host
PORT_DB=3306
USERNAME_DB=your-database-user
PASSWORD_DB=your-database-password
DATABASE_DB=tabaghe16
AUTOLOADENTITIES=true
SYNCHRONIZE=false  # Set to false in production!
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=3001
```

## Deployment Instructions

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set Root Directory to `frontend`
3. Configure environment variables as shown above
4. Build Command: `npm run build`
5. Output Directory: `.next` (default)
6. Install Command: `npm install`

### Backend (Production Server)
1. Deploy to a Node.js hosting service (AWS EC2, DigitalOcean, Railway, etc.)
2. Set up MySQL database
3. Configure environment variables
4. Build with: `npm run build`
5. Start with: `npm run start:prod`

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
- [ ] Fonts load from `/fonts/` path
- [ ] API calls use environment variables, not hardcoded localhost
- [ ] CORS configured for production domains