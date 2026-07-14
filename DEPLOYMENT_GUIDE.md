# 🚀 Production Deployment Guide

**Playwright Automation Dashboard — Monorepo Deployment**

Deploy the React frontend to **Vercel** and the Express backend to **Render** from a single GitHub repository.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step 1: Frontend Deployment (Vercel)](#step-1-frontend-deployment-vercel)
- [Step 2: Backend Deployment (Render)](#step-2-backend-deployment-render)
- [Step 3: Connect Frontend ↔ Backend](#step-3-connect-frontend--backend)
- [Step 4: Verify Deployment](#step-4-verify-deployment)
- [How Monorepo Deployment Works](#how-monorepo-deployment-works)
- [Environment Variables Reference](#environment-variables-reference)
- [Production Checklist](#production-checklist)
- [Socket.IO Production Configuration](#socketio-production-configuration)
- [CI/CD Recommendations](#cicd-recommendations)
- [Troubleshooting](#troubleshooting)
- [Folder Structure Reference](#folder-structure-reference)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                           │
│                     (Playwright.CS)                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  frontend/   │  │  backend/    │  │  automation/       │    │
│  │  React+Vite  │  │  Express+    │  │  Playwright tests  │    │
│  │  TanStack    │  │  Socket.IO   │  │  (NOT deployed)    │    │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────┘    │
│         │                 │                                      │
└─────────┼─────────────────┼──────────────────────────────────────┘
          │                 │
          ▼                 ▼
   ┌─────────────┐  ┌─────────────┐
   │   Vercel    │  │   Render    │
   │  (Frontend) │  │  (Backend)  │
   │             │  │             │
   │  HTTPS://   │  │  HTTPS://   │
   │  app.       │  │  api.       │
   │  vercel.app │  │  onrender.  │
   │             │  │  com        │
   └──────┬──────┘  └──────┬──────┘
          │                 │
          │   REST + WS     │
          └────────────────→┘
```

**Key Points:**
- Both services deploy from the **same GitHub repository**
- Each platform only builds its own **root directory** (`frontend/` or `backend/`)
- The `automation/` directory is **never deployed** — it's only used locally or in CI
- Frontend communicates with backend via `VITE_API_URL` environment variable
- Backend allows frontend via `CORS_ORIGIN` environment variable

---

## Prerequisites

- [ ] GitHub repository pushed and accessible
- [ ] [Vercel account](https://vercel.com/signup) (free tier works)
- [ ] [Render account](https://render.com/register) (free tier works)
- [ ] Node.js ≥ 18 installed locally

---

## Step 1: Frontend Deployment (Vercel)

### 1.1 Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `Playwright.CS` repository
4. Vercel will detect the monorepo

### 1.2 Configure Project Settings

| Setting | Value |
|---|---|
| **Framework Preset** | Other |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Install Command** | `npm install` |
| **Output Directory** | `.output/public` |

> **Important:** Set the Root Directory to `frontend`. This tells Vercel to only install dependencies and build from the `frontend/` subdirectory, ignoring `backend/` and `automation/`.

### 1.3 Set Environment Variables

In the Vercel project settings → **Environment Variables**:

| Variable | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Production |
| `VITE_API_URL` | `http://localhost:4000` | Preview / Development |

> **Note:** You'll get the actual Render URL after completing Step 2. You can add it later and trigger a redeploy.

### 1.4 Deploy

Click **"Deploy"**. Vercel will:
1. Clone the repo
2. Navigate to `frontend/`
3. Run `npm install`
4. Run `npm run build`
5. Deploy the output to its global CDN

### 1.5 Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your custom domain (e.g., `dashboard.yourdomain.com`)
3. Update DNS records as instructed by Vercel
4. Vercel automatically provisions SSL certificates

---

## Step 2: Backend Deployment (Render)

### 2.1 Create Render Web Service

**Option A: Using the Blueprint (Recommended)**

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New" → "Blueprint"**
3. Connect your GitHub repository
4. Render auto-detects `render.yaml` and creates the service
5. Review and confirm

**Option B: Manual Setup**

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New" → "Web Service"**
3. Connect your GitHub repository

### 2.2 Configure Service Settings

| Setting | Value |
|---|---|
| **Name** | `playwright-backend` |
| **Region** | Oregon (or closest to your users) |
| **Branch** | `master` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 2.3 Set Environment Variables

In the Render service settings → **Environment**:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `HOST` | `0.0.0.0` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` |
| `LOG_LEVEL` | `info` |
| `UPLOADS_DIR` | `uploads` |
| `PLAYWRIGHT_PROJECT_PATH` | `../automation` |

### 2.4 Configure Health Check

| Setting | Value |
|---|---|
| **Health Check Path** | `/health` |

Render will poll this endpoint to verify the service is healthy.

### 2.5 Deploy

Click **"Create Web Service"**. Render will:
1. Clone the repo
2. Navigate to `backend/`
3. Run `npm install`
4. Run `npm start` (which runs `node src/server.js`)
5. Verify health check at `/health`

### 2.6 Note Your Backend URL

After deployment, Render assigns a URL like:
```
https://playwright-backend-xxxx.onrender.com
```

**Copy this URL** — you'll need it for Step 3.

---

## Step 3: Connect Frontend ↔ Backend

Now that both services are deployed, connect them:

### 3.1 Update Vercel Environment Variable

1. Go to your **Vercel project** → Settings → Environment Variables
2. Set `VITE_API_URL` to your Render backend URL:
   ```
   https://playwright-backend-xxxx.onrender.com
   ```
3. **Redeploy** the frontend (Deployments → most recent → Redeploy)

### 3.2 Update Render CORS Origin

1. Go to your **Render service** → Environment
2. Set `CORS_ORIGIN` to your Vercel frontend URL:
   ```
   https://your-app.vercel.app
   ```
   For multiple origins (e.g., custom domain + Vercel domain):
   ```
   https://your-app.vercel.app,https://dashboard.yourdomain.com
   ```
3. Render will auto-redeploy with the new env vars

### 3.3 Verify Connection

1. Open your Vercel frontend URL in a browser
2. Open DevTools → Network tab
3. Check that API requests go to your Render backend URL
4. Verify no CORS errors in the console

---

## Step 4: Verify Deployment

### Backend Health Check

```bash
curl https://playwright-backend-xxxx.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 42.123,
  "timestamp": "2026-07-14T15:00:00.000Z"
}
```

### Frontend

1. Open `https://your-app.vercel.app`
2. Navigate through the dashboard
3. Verify the Settings page shows the correct API base URL
4. Test running an execution (if Playwright is accessible from the backend)

### Socket.IO

1. Open DevTools → Network tab → WS filter
2. Verify WebSocket connection establishes to the backend
3. Start a test execution and verify real-time progress updates

---

## How Monorepo Deployment Works

### How Vercel Deploys Only the Frontend

1. You set **Root Directory = `frontend`** in Vercel project settings
2. On every push to `master`, Vercel:
   - Clones the **entire repository**
   - Changes into `frontend/`
   - Runs `npm install` (only `frontend/package.json` dependencies)
   - Runs `npm run build` (only frontend build)
   - Deploys the build output
3. Vercel **ignores** `backend/` and `automation/` entirely

### How Render Deploys Only the Backend

1. You set **Root Directory = `backend`** in Render service settings (or via `render.yaml`)
2. On every push to `master`, Render:
   - Clones the **entire repository**
   - Changes into `backend/`
   - Runs `npm install` (only `backend/package.json` dependencies)
   - Runs `npm start`
3. Render **ignores** `frontend/` and `automation/` entirely

### Same Repository, Independent Deployments

```
  Push to master
       │
       ├───────────────────────────────────┐
       │                                   │
       ▼                                   ▼
   ┌─────────┐                       ┌──────────┐
   │  Vercel  │                       │  Render  │
   │          │                       │          │
   │ Root:    │                       │ Root:    │
   │ frontend/│                       │ backend/ │
   │          │                       │          │
   │ npm i    │                       │ npm i    │
   │ npm build│                       │ npm start│
   └─────────┘                       └──────────┘
```

- **Both platforms** trigger on the same `git push`
- **Each platform** only processes its own root directory
- **No interference** between frontend and backend builds
- **Auto-deploy** is enabled by default on both platforms

---

## Environment Variables Reference

### Frontend (Vite)

| Variable | Dev Value | Prod Value | Where Set |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | `https://backend.onrender.com` | `.env` / `.env.production` / Vercel dashboard |

### Backend (Express)

| Variable | Dev Value | Prod Value | Where Set |
|---|---|---|---|
| `NODE_ENV` | `development` | `production` | `.env` / Render dashboard |
| `PORT` | `4000` | `10000` | `.env` / Render dashboard |
| `HOST` | `0.0.0.0` | `0.0.0.0` | `.env` / Render dashboard |
| `CORS_ORIGIN` | `http://localhost:8080,http://localhost:5173` | `https://your-app.vercel.app` | `.env` / Render dashboard |
| `LOG_LEVEL` | `debug` | `info` | `.env` / Render dashboard |
| `UPLOADS_DIR` | `uploads` | `uploads` | `.env` / Render dashboard |
| `PLAYWRIGHT_PROJECT_PATH` | `../automation` | `../automation` | `.env` / Render dashboard |

---

## Production Checklist

### ✅ Security

- [x] **HTTPS** — Enforced by both Vercel and Render (automatic SSL certificates)
- [x] **Helmet** — Security headers configured in `backend/src/middleware/security.js`
  - `crossOriginResourcePolicy: cross-origin` (for artifact serving)
  - `contentSecurityPolicy: false` (API-only backend)
- [x] **CORS** — Origin whitelist via `CORS_ORIGIN` environment variable
  - Supports multiple origins (comma-separated)
  - Credentials enabled for authenticated requests
- [x] **HSTS** — Strict-Transport-Security header in `vercel.json` (2-year max-age)
- [x] **X-Frame-Options** — `DENY` prevents clickjacking
- [x] **X-Content-Type-Options** — `nosniff` prevents MIME-type sniffing
- [x] **Referrer-Policy** — `strict-origin-when-cross-origin`
- [x] **Permissions-Policy** — Camera, microphone, geolocation disabled

### ✅ Performance

- [x] **Compression** — gzip via `compression` middleware in Express
- [x] **Static asset caching** — Immutable 1-year cache for hashed assets (`/assets/*`, `.js`, `.css`)
- [x] **Vite build optimization** — Code splitting, tree shaking, minification (built-in)
- [x] **Production logging** — Morgan `combined` format (no dev noise)

### ✅ Reliability

- [x] **Health endpoint** — `GET /health` returns uptime + timestamp
- [x] **Graceful shutdown** — Handles `SIGINT` + `SIGTERM` with 10s timeout
- [x] **Uncaught exception handler** — Logs + graceful shutdown on fatal errors
- [x] **Unhandled rejection handler** — Logs promise rejections
- [x] **Global error handler** — Consistent JSON error responses
- [x] **404 handler** — Clean "not found" responses for unknown routes

### ✅ Socket.IO

- [x] **CORS configured** — Same origins as Express CORS
- [x] **Transports** — WebSocket primary, polling fallback
- [x] **Credentials** — Enabled for authenticated connections
- [x] **Room support** — Per-execution rooms for scoped event broadcasting

### ✅ Environment & Configuration

- [x] **Centralized config** — `backend/src/config/index.js` (frozen, no direct `process.env` reads)
- [x] **Environment-aware logging** — Debug in dev, combined in prod, silent in test
- [x] **Error stack traces** — Only exposed in development mode
- [x] **dotenv** — Loads `.env` automatically in development

### ✅ Build & Deploy

- [x] **Node.js engine** — `>= 18.0.0` specified in `backend/package.json`
- [x] **Auto-deploy** — Both Vercel and Render trigger on push to `master`
- [x] **Monorepo isolation** — Each platform uses its own root directory
- [x] **No `automation/` deployment** — Only `frontend/` and `backend/` are deployed

---

## Socket.IO Production Configuration

Your Socket.IO setup in `backend/src/socket/index.js` is already production-ready:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,       // Reads from CORS_ORIGIN env var
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],  // WS first, polling fallback
});
```

### Production Considerations

| Concern | Status | Notes |
|---|---|---|
| CORS | ✅ Configured | Uses same origin list as Express CORS |
| Transports | ✅ Configured | WebSocket primary, long-polling fallback |
| Reconnection | ✅ Default | Socket.IO client auto-reconnects |
| Rooms | ✅ Implemented | `join-execution` / `leave-execution` events |
| Scaling | ⚠️ Single-instance | For multi-instance, add `@socket.io/redis-adapter` |

> **Scaling Note:** If you scale to multiple Render instances, you'll need a Redis adapter for Socket.IO. For a single instance (free tier), the current setup is sufficient.

---

## CI/CD Recommendations

### Current Setup (Sufficient for Most Teams)

Both Vercel and Render provide built-in CI/CD:
- **Auto-deploy on push to `master`** — no additional pipeline needed
- **Preview deployments** — Vercel creates preview URLs for pull requests
- **Rollback** — Both platforms support instant rollback to previous deployments

### Optional Enhancements

#### GitHub Actions — Pre-deploy Checks

Create `.github/workflows/ci.yml` to run checks before deployment:

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  lint-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd frontend && npm ci && npm run lint

  lint-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd backend && npm ci

  # Optional: run Playwright tests in CI
  # test-e2e:
  #   runs-on: ubuntu-latest
  #   steps:
  #     - uses: actions/checkout@v4
  #     - uses: actions/setup-node@v4
  #     - run: cd automation && npm ci
  #     - run: npx playwright install --with-deps
  #     - run: npx playwright test
```

### Branch Strategy

| Branch | Vercel | Render |
|---|---|---|
| `master` | Production deploy | Production deploy |
| Pull Requests | Preview URL (auto) | No preview (manual) |
| Feature branches | Preview URL (auto) | No auto-deploy |

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors in Browser Console

**Symptom:** `Access-Control-Allow-Origin` error when frontend calls backend.

**Fix:**
1. Check `CORS_ORIGIN` on Render matches your Vercel URL **exactly** (including `https://`)
2. No trailing slash in the origin URL
3. Redeploy the backend after changing env vars
4. Check both Express CORS and Socket.IO CORS use the same origins

```
# ✅ Correct
CORS_ORIGIN=https://your-app.vercel.app

# ❌ Wrong — trailing slash
CORS_ORIGIN=https://your-app.vercel.app/

# ❌ Wrong — HTTP instead of HTTPS
CORS_ORIGIN=http://your-app.vercel.app
```

#### 2. Frontend Shows Loading but No Data

**Symptom:** The dashboard loads but shows no executions or artifacts.

**Fix:**
1. Open DevTools → Network tab and check API requests
2. Verify `VITE_API_URL` is set correctly in Vercel
3. Visit the backend health endpoint directly: `https://your-backend.onrender.com/health`
4. **Important:** Render free tier spins down after 15 minutes of inactivity. The first request may take 30-60 seconds.

#### 3. Render Build Fails

**Symptom:** Build fails with `npm ERR! missing script: build`

**Fix:** This is expected — the backend has no build step. The Build Command should be `npm install` (not `npm run build`).

#### 4. Socket.IO Connection Fails

**Symptom:** WebSocket connection error or falling back to long-polling.

**Fix:**
1. Verify the backend URL in the frontend Socket.IO client config
2. Ensure Render is not blocking WebSocket connections (it doesn't by default)
3. Check CORS origins include the frontend URL
4. If behind a CDN/proxy, ensure WebSocket upgrade headers are forwarded

#### 5. 404 on Page Refresh (Frontend)

**Symptom:** Refreshing a non-root URL (e.g., `/settings`) returns a 404.

**Fix:** The `vercel.json` includes a catch-all rewrite rule (`"source": "/(.*)"` → `"destination": "/"`). If you're still seeing 404s, verify the `vercel.json` is in the `frontend/` directory (the Vercel root).

#### 6. Environment Variables Not Working

**Symptom:** `VITE_API_URL` is `undefined` in the deployed frontend.

**Fix:**
1. Vite only exposes variables prefixed with `VITE_`
2. Variables are **baked in at build time** — you must **redeploy** after changing them
3. Check Vercel → Settings → Environment Variables → the variable is set for the correct environment (Production vs Preview)

#### 7. Render Free Tier Cold Starts

**Symptom:** First request after inactivity takes 30-60 seconds.

**Fix:**
- Upgrade to Render's paid tier for always-on instances
- Or set up a cron job to ping the health endpoint every 14 minutes:
  ```bash
  # Using UptimeRobot, cron-job.org, or GitHub Actions
  curl https://your-backend.onrender.com/health
  ```

---

## Folder Structure Reference

After applying this deployment setup, your repository will look like this:

```
Playwright.CS/
├── render.yaml                        # Render IaC blueprint (backend)
├── DEPLOYMENT_GUIDE.md                # This guide
├── package.json                       # Root workspace (dev deps only)
│
├── frontend/                          # ──── Vercel ────
│   ├── vercel.json                    # Vercel config (headers, rewrites, caching)
│   ├── .env                           # Dev: VITE_API_URL=http://localhost:4000
│   ├── .env.production                # Prod: VITE_API_URL=https://backend.onrender.com
│   ├── package.json                   # React + Vite + TanStack Start deps
│   ├── vite.config.ts                 # Vite configuration
│   └── src/
│       ├── lib/
│       │   └── api.ts                 # API client (reads VITE_API_URL)
│       └── ...
│
├── backend/                           # ──── Render ────
│   ├── .env                           # Dev environment variables
│   ├── .env.example                   # Template with production reference
│   ├── package.json                   # Express + Socket.IO deps
│   └── src/
│       ├── server.js                  # HTTP server + graceful shutdown
│       ├── app.js                     # Express app (Helmet, CORS, compression)
│       ├── config/index.js            # Centralized config (reads env vars)
│       ├── socket/index.js            # Socket.IO setup
│       ├── middleware/
│       │   ├── security.js            # Helmet configuration
│       │   ├── requestLogger.js       # Morgan logging
│       │   ├── errorHandler.js        # Global error handler
│       │   └── ...
│       └── ...
│
└── automation/                        # ──── NOT DEPLOYED ────
    ├── playwright.config.js
    └── tests/
        └── ...
```

---

## Quick Reference Card

| | Frontend (Vercel) | Backend (Render) |
|---|---|---|
| **Platform** | Vercel | Render |
| **Root Directory** | `frontend` | `backend` |
| **Install Command** | `npm install` | `npm install` |
| **Build Command** | `npm run build` | _(none — install only)_ |
| **Start Command** | _(managed by Vercel)_ | `npm start` |
| **Output Directory** | `.output/public` | _(not applicable)_ |
| **Key Env Var** | `VITE_API_URL` | `CORS_ORIGIN` |
| **Health Check** | _(not applicable)_ | `/health` |
| **Auto-Deploy** | On push to `master` | On push to `master` |
| **Preview Deploys** | ✅ On PRs | ❌ Manual only |
| **SSL/HTTPS** | ✅ Automatic | ✅ Automatic |
| **WebSockets** | _(client-side)_ | ✅ Supported |
