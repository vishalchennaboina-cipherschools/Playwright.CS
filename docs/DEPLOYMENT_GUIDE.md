# Deployment Guide — QA Automation Console

> Version: v1.1.0

---

## Overview

The platform uses a split deployment model:

| Service | Platform | Purpose |
|---|---|---|
| Frontend | Vercel | React / TanStack Start SSR |
| Backend | Render (Docker) | Express API + Playwright runner |
| Database | MongoDB Atlas | Persistent storage |

---

## Prerequisites

- Node.js 22+ (local development)
- Docker (local multi-service setup)
- MongoDB Atlas account and cluster
- Render account
- Vercel account
- GitHub repository

---

## Local Development

### 1. Clone and Install

```bash
git clone <repo-url>
cd Playwright.CS

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install automation dependencies
cd ../automation
npm install
```

### 2. Configure Environment

**Backend** — create `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
CORS_ORIGIN=http://localhost:5173
PLAYWRIGHT_PROJECT_PATH=../automation
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password
LOG_LEVEL=info
PLAYWRIGHT_HEADED=false
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
```

### 3. Start Services

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:4000

### 4. Docker Compose (Alternative)

```bash
docker-compose up --build
```

This spins up the backend with Playwright browsers pre-installed. Frontend still runs via `npm run dev`.

---

## MongoDB Atlas Setup

1. Create a free M0 cluster on MongoDB Atlas
2. Create a database user with `readWrite` permissions
3. Whitelist your IP or set `0.0.0.0/0` for cloud access
4. Copy the connection string into `MONGODB_URI`
5. The platform creates all collections automatically (no migrations needed)

---

## Render Deployment (Backend)

### 1. Create a New Web Service

- Connect your GitHub repository
- Set **Environment:** Docker
- Set **Dockerfile path:** `./Dockerfile`

### 2. Environment Variables

Set these in Render dashboard → Environment:

| Variable | Value |
|---|---|
| `PORT` | `4000` |
| `MONGODB_URI` | Your Atlas connection string |
| `CORS_ORIGIN` | Your Vercel URL (e.g., `https://your-app.vercel.app`) |
| `TEST_EMAIL` | Fallback test email |
| `TEST_PASSWORD` | Fallback test password |
| `LOG_LEVEL` | `info` |
| `NODE_ENV` | `production` |

### 3. Deploy

Push to your `main` branch — Render auto-deploys on every push.

### 4. Health Check

Render will hit `GET /health`. Expected response: `{ "status": "healthy" }`

---

## Vercel Deployment (Frontend)

### 1. Import Project

- Connect GitHub repository in Vercel dashboard
- Set **Root Directory:** `frontend`
- Set **Framework Preset:** Vite

### 2. Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Render backend URL (e.g., `https://your-api.onrender.com`) |

### 3. Deploy

Push to `main` — Vercel auto-deploys. SSR functions will be deployed as Vercel serverless functions.

---

## Dockerfile Reference

The `Dockerfile` builds a combined image containing:
1. Node.js 22 on Debian
2. Playwright and all browser binaries (`--with-deps`)
3. The Express backend server

```dockerfile
# Key stages:
FROM node:22-slim
# Install Playwright system dependencies
RUN npx playwright install --with-deps chromium firefox msedge
# Copy and install backend
COPY backend/ ./backend
RUN cd backend && npm ci --production
# Copy automation framework
COPY automation/ ./automation
RUN cd automation && npm ci
CMD ["node", "backend/src/server.js"]
```

---

## render.yaml Reference

```yaml
services:
  - type: web
    name: playwright-backend
    env: docker
    dockerfilePath: ./Dockerfile
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: CORS_ORIGIN
        sync: false
```

---

## Updating Playwright Browsers

When upgrading Playwright version in `automation/package.json`:

1. Update version: `npm install @playwright/test@latest`
2. The Docker build will install the updated browsers automatically
3. Push to trigger Render redeploy

---

## Production Checklist

Before going live:

- [ ] `CORS_ORIGIN` set to exact Vercel URL (no trailing slash)
- [ ] `NODE_ENV=production` set on Render
- [ ] `LOG_LEVEL=info` (not `debug`) in production
- [ ] MongoDB Atlas IP allowlist configured
- [ ] Test email/password fallbacks set on Render
- [ ] Health check passing on Render dashboard
- [ ] Frontend `VITE_API_URL` pointing to production Render URL
- [ ] HTTPS enforced on both Vercel and Render

---

## Rollback Procedure

### Backend (Render)

Render keeps a deployment history. To rollback:
1. Go to Render dashboard → Your service → Deploys
2. Select the previous successful deploy
3. Click "Redeploy"

### Frontend (Vercel)

1. Go to Vercel dashboard → Your project → Deployments
2. Find the last working deployment
3. Click the three-dot menu → "Promote to Production"

---

## Secrets Management

- Never commit `.env` files to Git — both `.gitignore` files exclude them
- Use Render Environment Variables for all production secrets
- Use Vercel Environment Variables for frontend configuration
- Rotate `TEST_PASSWORD` periodically; it can be updated in Render without redeploying

---

## Scaling Notes

- Render's free tier spins down after inactivity — upgrade to a paid plan for production QA
- MongoDB Atlas M0 (free) is limited to 512MB — upgrade to M10+ for production
- Playwright is CPU and memory intensive — ensure Render instance has at least 1GB RAM
