# Playwright Automation Dashboard — Docker Migration Plan

This document outlines the professional engineering strategy for migrating the backend of the Playwright Automation Dashboard from a standard Node.js cloud service to a robust, Dockerized container deployment with persistent storage. 

---

## Part 1: Production Dockerfile

Create a file named `Dockerfile` in the **root** of the repository (at the same level as `render.yaml`).

```dockerfile
# 1. Base Image: Use the official Microsoft Playwright image.
# This image contains Node.js 20, Chromium, Firefox, WebKit, and all required OS-level
# dependencies (fonts, graphics libraries) necessary for headless browser execution.
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Set the environment to production
ENV NODE_ENV=production

# 4. Copy package files first to leverage Docker Layer Caching.
# By copying only package files before running npm install, Docker will cache the
# installed modules unless dependencies change, speeding up subsequent builds.
COPY backend/package*.json ./backend/
COPY automation/package*.json ./automation/

# 5. Install Backend Dependencies
# Using `npm ci` ensures a clean install based strictly on the package-lock.json.
# We skip devDependencies to keep the image size minimal.
RUN cd backend && npm ci --omit=dev

# 6. Install Automation Dependencies
# Playwright and types are usually devDependencies in test frameworks, 
# so we install everything (or ensure Playwright is moved to dependencies).
RUN cd automation && npm ci

# 7. Copy Source Code
# Explicitly copy only backend and automation, keeping the frontend completely
# excluded from this container (since Vercel handles it).
COPY backend/ ./backend/
COPY automation/ ./automation/

# 8. Create Upload Directories
# Ensure the uploads directory exists within the container so artifacts 
# can be saved immediately by the artifactScanner.js
RUN mkdir -p /app/backend/uploads/reports \
             /app/backend/uploads/screenshots \
             /app/backend/uploads/videos \
             /app/backend/uploads/traces

# 9. Set Permissions
# The Playwright base image provides a non-root user named 'pwuser'. 
# We grant this user ownership of the uploads folder so it can write artifacts.
RUN chown -R pwuser:pwuser /app/backend/uploads

# 10. Security: Switch to non-root user
USER pwuser

# 11. Expose the Express API port
EXPOSE 4000

# 12. Set working directory to backend where the start script lives
WORKDIR /app/backend

# 13. Start the Express backend
CMD ["npm", "start"]
```

---

## Part 2: .dockerignore

Create a file named `.dockerignore` in the **root** of the repository.

```text
# Exclude Node Modules
# Let Docker install them cleanly within the Linux container OS to avoid binary mismatches
node_modules
frontend/node_modules
backend/node_modules
automation/node_modules

# Exclude Git History
# Massively bloats the Docker image size and serves no purpose at runtime
.git
.gitignore

# Exclude Frontend Code completely
# Vercel handles the frontend. Including it in the backend image is a waste of space
frontend

# Exclude Artifacts & Reports
# We want a clean slate on deployment; persistent storage will handle history at runtime
backend/uploads
automation/playwright-report
automation/test-results
reports
screenshots
videos
traces

# Exclude Logs and Caches
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
coverage
tmp
cache
dist
.output

# Exclude IDE/Editor files
.vscode
.idea
.DS_Store
```

---

## Part 3: render.yaml Rewrite

Update the existing `render.yaml` in the root of the repository.

```yaml
services:
  # The frontend is deployed via Vercel and is intentionally excluded from Render

  - type: web
    name: playwright-dashboard-backend
    
    # CHANGE 1: Use 'docker' runtime instead of 'node'
    env: docker
    
    # CHANGE 2: Set root directory to '.' so Render finds the Dockerfile
    rootDir: .
    region: ohio
    
    # CHANGE 3: Compute recommendations
    # Free tier does NOT have enough memory to run Chromium.
    # Minimum requirement for headless browsers is Starter (512MB RAM - risky) 
    # Standard (2GB RAM - recommended) is best for parallel workers.
    plan: standard 
    
    # CHANGE 4: Health check ensures Render routes traffic only when Express is ready
    healthCheckPath: /api/settings

    # CHANGE 5: Persistent Disk (Crucial)
    # Standard Docker containers are ephemeral. Without this disk, all reports,
    # traces, and historical executions are permanently deleted on every deploy.
    disk:
      name: artifact-storage
      mountPath: /app/backend/uploads
      sizeGB: 10 # Adjust based on how many videos/traces you plan to retain
      
    envVars:
      - key: PORT
        value: 4000
      - key: NODE_ENV
        value: production
      - key: CORS_ORIGIN
        value: https://your-vercel-frontend.vercel.app # UPDATE WITH VERCEL URL
      - key: PLAYWRIGHT_PROJECT_PATH
        value: ../automation # Maps perfectly within the /app directory in Docker

    # CHANGE 6: Auto Deploy on git push
    autoDeploy: true
```

---

## Part 4: Changes inside backend/package.json

No massive changes are needed, but ensure your `scripts` block in `backend/package.json` relies on standard `node` execution rather than `nodemon` or development tools in production:

```json
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "start:prod": "NODE_ENV=production node src/server.js"
  }
```

*Note on Playwright:* Playwright should remain in `automation/package.json`. The Dockerfile runs `npm ci` in the automation folder, so the backend runner can successfully execute `npx playwright test`.

---

## Part 5: Changes inside backend/src/config/index.js

No code changes are required here. The Dockerfile sets the working directory to `/app/backend`, and the `render.yaml` sets `PLAYWRIGHT_PROJECT_PATH` to `../automation`.

Because the code uses `path.resolve(__dirname, '../../', process.env.PLAYWRIGHT_PROJECT_PATH)`, it will perfectly resolve to `/app/automation` inside the container. 

The `UPLOADS_DIR` defaults to `uploads`, which resolves to `/app/backend/uploads`—exactly where the Render Persistent Disk is mounted.

---

## Part 6: Changes inside server.js

Ensure the Express app binds to `0.0.0.0` instead of `localhost` or `127.0.0.1`. Docker containers must bind to `0.0.0.0` to receive external traffic.

If your `server.js` looks like this:
```javascript
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```
It is already fine (Express defaults to `0.0.0.0` if a host is omitted). 

If a host is hardcoded as `localhost`, change it:
```javascript
// DO NOT do this: server.listen(PORT, 'localhost');
// DO this:
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});
```

---

## Part 7: Updated Deployment Architecture Diagram

```mermaid
flowchart TD
    subgraph GitHub
        Code[Monorepo Repository]
    end

    subgraph Vercel [Vercel (Frontend)]
        React[React / TanStack Start UI]
    end

    subgraph Render [Render (Backend)]
        subgraph Container [Playwright Docker Container]
            Express[Express API]
            WS[Socket.IO Server]
            Runner[Playwright Runner]
            Browser((Chromium/Firefox))
            Automations[Tests Code]
            
            Express --> Runner
            Runner -- spawns --> Browser
            Browser --> Automations
        end
        
        Disk[(Persistent Disk /app/backend/uploads)]
    end
    
    User((User)) -->|HTTPS| React
    Code -- Auto Deploys --> Vercel
    Code -- Auto Deploys --> Render
    
    React -- HTTP REST --> Express
    React -- WebSockets --> WS
    
    Runner -- Updates --> WS
    Runner -- Generates Artifacts --> Disk
    Express -- Serves Artifacts --> Disk
```

---

## Part 8: Why Docker is Required for Playwright

You cannot deploy this backend as a "Normal Node Service" on Render, Vercel, or Heroku. Here is exactly why, compared across platforms:

| Platform / Runtime | Why it succeeds or fails for this specific project | Verdict |
|---|---|---|
| **Render Node Runtime** | Fails. It only installs Node.js. When `child_process.spawn` attempts to launch Chromium, Linux will throw `error while loading shared libraries: libnss3.so: cannot open shared object file`. | ❌ Fails |
| **Render Docker (Chosen)** | Succeeds. By using `mcr.microsoft.com/playwright`, the OS is pre-loaded with all graphic libraries and fonts required by headless browsers. Render also supports Persistent Disks to save the generated videos/traces. | ✅ Ideal |
| **Vercel** | Fails. Vercel Serverless functions have a 50MB size limit and a 10-60 second execution timeout. Browsers are hundreds of MBs and suites take minutes. | ❌ Fails |
| **Railway** | Succeeds. Identical to Render Docker. Railway supports Dockerfiles and Persistent Volumes. | ✅ Viable |
| **AWS EC2 / DigitalOcean**| Succeeds. You can SSH into a raw Linux VM, install Node, install Playwright dependencies (`npx playwright install-deps`), and run it directly without Docker. | ✅ Viable but high maintenance |
| **Azure Container Apps** | Succeeds. Excellent support for Docker and WebSocket scaling, but higher learning curve than Render. | ✅ Viable |

**Advantages of this Docker Approach:**
- **Zero OS Configuration:** You don't have to manually `apt-get install` 30 different Linux graphics libraries.
- **Identical Environments:** Tests run in the exact same environment locally (if using Docker locally) and in production.
- **Portability:** If Render becomes too expensive, you can deploy this exact `Dockerfile` to AWS Fargate, Google Cloud Run, or Railway with zero code changes.

---

## Part 9: Migration Checklist

Follow this checklist to safely migrate your backend deployment:

### 1. File Creation & Modification
- [ ] Create `Dockerfile` in the repository root.
- [ ] Create `.dockerignore` in the repository root.
- [ ] Update `render.yaml` with `env: docker`, `plan: standard`, and the `disk` configuration.
- [ ] Verify `server.js` binds to `0.0.0.0` or omits the host parameter.

### 2. Local Verification (Optional but Recommended)
- [ ] Run `docker build -t playwright-dashboard .` to ensure the image builds without syntax errors.
- [ ] Run `docker run -p 4000:4000 playwright-dashboard` and verify the API boots up.

### 3. Git Commits
- [ ] `git add Dockerfile .dockerignore render.yaml backend/src/server.js`
- [ ] `git commit -m "chore: migrate backend to Playwright Docker environment with persistent storage"`
- [ ] `git push origin master`

### 4. Deployment Steps
- [ ] Go to the Render Dashboard.
- [ ] If you already have the Node web service running, it is recommended to **Suspend** or **Delete** the old "Node" web service.
- [ ] Create a **New Web Service**, connect your GitHub repo, and Render will automatically detect the `render.yaml` (Blueprint) and provision the Docker container and the Persistent Disk.
- [ ] Update the `CORS_ORIGIN` environment variable in the Render dashboard to exactly match your Vercel URL.
- [ ] Update the Vercel Frontend environment variable (`VITE_API_URL`) to point to the new Render URL (if it changed).

### 5. Verification
- [ ] Load the Vercel frontend.
- [ ] Click "Run Test" on a known suite.
- [ ] Verify Socket.IO connects (terminal output should stream).
- [ ] Verify the execution completes.
- [ ] Verify you can view a Trace or Video (proves the Docker volume is working and the Express static file server can read it).

### 6. Troubleshooting
- **"Execution starts but immediately fails with code 1":** Ensure Playwright is actually installed in the automation folder (`RUN cd automation && npm ci`). Check the Render logs for the `npx playwright` stderr output.
- **"Cannot view Reports/Traces 404":** The persistent disk mount path `/app/backend/uploads` might not match the `UPLOADS_DIR` relative path. Ensure they align.
- **"Socket.IO not connecting":** Ensure Render is forwarding WebSockets properly and that `CORS_ORIGIN` matches the Vercel origin perfectly (no trailing slash).
