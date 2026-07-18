# Playwright Automation Platform Architecture

## Project Overview

**Purpose**: The Playwright Automation Platform is an enterprise application providing a centralized interface to execute, manage, and report on automated Playwright tests.
**Technology Stack**:
- **Frontend**: React (TanStack Start, Vite, Tailwind CSS, shadcn-ui)
- **Backend**: Express (Node.js)
- **Framework**: Playwright
- **Database**: MongoDB (Mongoose)
- **Realtime**: Socket.IO
- **Deployment**: Docker, Render, Vercel

**Deployment Architecture**:
- Frontend is deployed on Vercel.
- Backend, Playwright execution engine, and Socket.IO server are containerized with Docker and deployed on Render.
- MongoDB is used for persistent storage.

## Folder Structure

```
c:\CS\Playwright.CS
├── automation/      # Playwright test scripts, config, and framework wrappers
├── backend/         # Express.js REST API, Socket.IO server, DB models
└── frontend/        # React SPA (TanStack Start) serving the dashboard
```

## Architecture Diagrams

```mermaid
flowchart TD
    User([User]) --> |Interacts via Browser| Frontend[React Frontend (Vercel)]
    Frontend -->|REST API & Socket.IO| Backend[Express Backend (Render)]
    
    Backend -->|Spawns Child Process| Execution[Playwright Runner]
    Backend -->|Reads/Writes Data| MongoDB[(MongoDB)]
    
    Execution -->|Runs Tests| Automation[Playwright Framework]
    Automation -->|Outputs| Artifacts[Reports, Videos, Traces, Screenshots]
    
    Backend -->|Serves Static Files| Artifacts
    Backend -->|Emits Events| SocketIO[Socket.IO]
    SocketIO -->|Real-time Updates| Frontend
```

## Component Responsibilities

### Frontend Architecture
- **Pages**: Top-level UI routes representing dashboard views (e.g., Executions, Settings, Artifacts).
- **Components**: Reusable UI elements (mostly shadcn-ui).
- **Hooks/Lib**: Data fetching (React Query) and utility functions.
- **Routing**: TanStack Router handles client-side routing.

### Backend Architecture
- **Controllers**: Handle HTTP requests/responses, validate input, call services.
- **Services**: Business logic (e.g., ExecutionStore, HistoryService, PlaywrightRunner).
- **Models**: Mongoose schemas defining MongoDB collections (Execution, ExecutionHistory, Artifact).
- **Socket**: Real-time event emitters for execution progress and logs.

### Playwright Framework
- **Tests**: Contains `.spec.js` files grouped by project (e.g., `cipherschools`, `codefri`).
- **Config**: `playwright.config.js` defines browsers, retries, and reporters.

## Execution Flow

1. **Trigger**: User initiates a test suite execution via the Frontend.
2. **API Request**: Backend `/api/executions/start` receives the request.
3. **Record Creation**: A new `Execution` document is created in MongoDB with status `running`.
4. **Process Spawn**: `PlaywrightRunner` spawns a Node child process running `npx playwright test`.
5. **Real-time Updates**: 
   - stdout/stderr from the child process is captured.
   - `SocketService` broadcasts `progress` and `log` events to the Frontend.
6. **Completion**: 
   - Playwright finishes and generates HTML reports, traces, and videos.
   - Backend reads results, moves the `Execution` record to `ExecutionHistory`.
   - `ArtifactScanner` detects new files in the `uploads/` directory and saves `Artifact` records to MongoDB.

## Data & Artifact Flow
- **Artifact Storage**: Tests output to `automation/playwright-report` or similar directories, which the Backend maps or copies to a static `uploads/` directory.
- **Report Generation**: Playwright HTML reporter generates static assets.
- **Serving**: Express serves `/uploads` statically so the Frontend can render them via `<iframe>` or direct links.

## Configuration & Environments
- Handled via `.env` files in each sub-project.
- `backend/src/config/index.js` acts as the central source of truth for backend settings.
- The Playwright config reads environment variables to determine target URLs and credentials.

## Important Entry Points
- Frontend: `src/main.tsx` or `src/server.ts` (TanStack Start entry)
- Backend: `src/server.js` (Express + Socket.IO bootstrap)
- Automation: `playwright.config.js`

## Deployment & Docker
- **Docker**: The `Dockerfile` at the root builds the backend and automation environment (pulling Microsoft's Playwright image to get browser binaries).
- **Render**: Hosts the Docker container.
- **Vercel**: Builds and hosts the TanStack frontend.

## Error Handling & Recovery
- Node.js backend handles `uncaughtException` and `unhandledRejection` gracefully, closing DB connections.
- Playwright Runner catches child process failures and marks the execution as `failed`.

---

# Architecture Change Log

## 2026-07-18

### Updated By
Antigravity (AI Assistant)

### Module
Frontend, Backend, Automation, Documentation

### Files Changed
- Deleted 31 unused shadcn-ui components in `frontend/src/components/ui/`
- Deleted leftover `backend/test-phase2.js` script
- Removed unused frontend dependencies (27 Radix/UI packages)
- Removed `multer` from backend
- Removed `@types/node` from automation devDependencies
- Created this `PROJECT_ARCHITECTURE.md`

### Reason
Initial Codebase Cleanup and Audit to prepare the platform for production. Removing dead code and unused dependencies reduces bundle sizes, attack surfaces, and developer confusion.

### Previous Behavior
The codebase had leftover files from initial prototyping (e.g. `test-phase2.js`), unused UI components generated by shadcn, and unused packages like `multer`.

### New Behavior
The project is leaner, with unused code strictly removed. An auto-documentation rule has been established for all future architectural changes.

### Impact
- **Frontend**: Faster build times, leaner `package.json`.
- **Backend**: Cleaned up test scripts and dependencies.
- **Documentation**: Established this file as the single source of truth.
- **Breaking Changes**: None.
