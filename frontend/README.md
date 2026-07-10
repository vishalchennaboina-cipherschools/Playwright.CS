# Playwright Automation Dashboard — Developer Guide

> Enterprise-grade TanStack Start dashboard that controls an existing JavaScript Playwright framework through an Express backend.

This project is the **frontend UI only**. It is wired to a conventional REST API whose base URL is configurable in **Settings** (defaults to `http://localhost:4000`). The backend is expected to run Playwright, stream execution progress, and serve artifacts such as screenshots, videos, traces, and HTML reports.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Tech stack](#tech-stack)
3. [Project layout](#project-layout)
4. [Frontend file map](#frontend-file-map)
5. [Expected backend contract](#expected-backend-contract)
6. [How to build the Express backend](#how-to-build-the-express-backend)
7. [How to wire your Playwright framework](#how-to-wire-your-playwright-framework)
8. [Environment variables](#environment-variables)
9. [Common tasks](#common-tasks)

---

## Quick start

```bash
# Install dependencies
bun install

# Run the dev server (preview available at http://localhost:8080)
bun run dev

# Production build
bun run build
```

Before the dashboard can do anything real, point it at your backend in **Settings → API base URL** or set the `VITE_API_BASE_URL` environment variable.

---


## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Styling | Tailwind CSS v4 + `oklch` semantic tokens |
| UI components | shadcn/ui + Radix primitives |
| Icons | `lucide-react` |
| Charts | `recharts` |
| Date formatting | `date-fns` |
| Forms | `react-hook-form` + `zod` |
| HTTP client | Native `fetch` via `src/lib/api.ts` |

The project is currently TypeScript, but the UI components and API client are pure frontend logic — they can be replicated in JavaScript if you later migrate the codebase.

---

## Project layout

```
.
├── src/
│   ├── components/          # Shared UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Data, API, and global state
│   ├── routes/              # TanStack file-based routes
│   ├── router.tsx           # Router factory
│   ├── server.ts            # SSR server entry
│   ├── start.ts             # TanStack start middleware
│   └── styles.css           # Theme tokens + Tailwind imports
├── package.json
├── vite.config.ts
└── README.md                # This file
```

---

## Frontend file map

### Entry & bootstrap

| File | Purpose | What you may change |
| --- | --- | --- |
| `src/router.tsx` | Creates the TanStack router with a per-request `QueryClient`. | Add global loaders, scroll behavior, or default meta. |
| `src/server.ts` | SSR worker entry. Catches catastrophic errors and renders the error page. | Usually no changes needed. |
| `src/start.ts` | TanStack `createStart` middleware that wraps every request with the custom error renderer. | Add server-side auth or logging middleware here. |
| `src/styles.css` | Global CSS, Tailwind v4 imports, semantic `oklch` color tokens, glassmorphism, animations. | Extend theme colors or add custom utilities. |

### Layout & shell

| File | Purpose | What you may change |
| --- | --- | --- |
| `src/routes/__root.tsx` | Root route. Renders `<html>`, `<head>`, SEO meta, global providers, `AppShell`, and the `Outlet`. | Update default meta, fonts, or analytics scripts. |
| `src/components/app-shell.tsx` | Sidebar + topbar layout. Subscribes to `ExecutionContext` to show the live runner status in the footer. | Add navigation items, user avatar, or notifications. |
| `src/components/dashboard-ui.tsx` | Reusable dashboard primitives: `PageHeader`, `StatCard`, `StatusPill`, `EmptyState`, `formatDuration`. | Add new card variants or status pills. |

### Global state

| File | Purpose | What you may change |
| --- | --- | --- |
| `src/lib/execution-store.tsx` | **Main execution context.** Starts/stops runs, polls execution state, keeps live logs, and exposes `history` to the rest of the app. | Swap polling for Socket.IO when you add real-time events. |
| `src/lib/execution-store.ts` | Re-export barrel file. | No changes needed. |
| `src/lib/api.ts` | **REST client.** Handles `fetch`, base URL resolution, token header, and all endpoint wrappers. | Add new endpoints, change payload shapes, or add retries. |
| `src/lib/mock-data.ts` | Mock executions, trends, screenshots, videos, traces, and suites. | Delete or replace with real backend data once the backend is ready. |
| `src/lib/utils.ts` | `cn()` helper for Tailwind class merging. | No changes needed. |

### Route pages

| File | Route | Purpose | Backend dependencies |
| --- | --- | --- | --- |
| `src/routes/index.tsx` | `/` | Dashboard overview with stats, charts, recent activity. | Currently uses `MOCK_HISTORY` / `MOCK_TRENDS`; update to `GET /api/executions` + trends endpoint. |
| `src/routes/run.tsx` | `/run` | Test runner config panel + live console. | `POST /api/executions`, `POST /api/executions/:id/stop`, `GET /api/executions/:id`. |
| `src/routes/history.tsx` | `/history` | Filterable execution history table. | `GET /api/executions`, `DELETE /api/executions/:id`. |
| `src/routes/reports.tsx` | `/reports` | HTML report gallery with preview/download. | `GET /api/reports`. |
| `src/routes/screenshots.tsx` | `/screenshots` | Screenshot gallery with lightbox preview. | `GET /api/screenshots`. |
| `src/routes/videos.tsx` | `/videos` | Video gallery with inline player. | `GET /api/videos`. |
| `src/routes/traces.tsx` | `/traces` | Trace ZIP gallery with Playwright trace viewer link. | `GET /api/traces`. |
| `src/routes/logs.tsx` | `/logs` | Execution log viewer. | `GET /api/executions/:id/logs` or `GET /api/logs`. |
| `src/routes/settings.tsx` | `/settings` | Backend URL, auth token, notification toggles. | Persists to `localStorage`. |

### Reusable components

| File | Purpose | What you may change |
| --- | --- | --- |
| `src/components/media-preview.tsx` | Modal for previewing screenshots (zoomable), videos (inline `<video>`), reports (iframe), and generic files. | Add new preview types (e.g. PDF). |
| `src/components/ui/*` | shadcn/ui primitives: button, dialog, input, select, sidebar, sonner, table, etc. | Regenerate via `npx shadcn add <component>`. |

### Error & monitoring

| File | Purpose | What you may change |
| --- | --- | --- |
| `src/lib/error-capture.ts` | Captures the last thrown error for SSR diagnostics. | Usually no changes. |
| `src/lib/error-page.ts` | Renders a standalone HTML error page for catastrophic failures. | Customize branding. |
| `src/lib/lovable-error-reporting.ts` | Reports runtime errors to the Lovable platform. | Usually no changes. |

---

## Expected backend contract

The dashboard assumes a conventional REST API. All calls are relative to the configured API base URL.

### Base URL configuration

- Default: `http://localhost:4000`
- User-configurable in **Settings → Backend connection**
- Persisted in `localStorage` under `pw:apiBaseUrl`
- Optional bearer token persisted under `pw:apiToken`

### Executions

| Method | Endpoint | Request | Response | Used by |
| --- | --- | --- | --- | --- |
| `POST` | `/api/executions` | `{ suite, environment, browser, mode, workers, specFile? }` | `ExecutionDetail` | Run Tests page |
| `GET` | `/api/executions` | — | `Execution[]` | History + Dashboard |
| `GET` | `/api/executions/:id` | — | `ExecutionDetail` | Live polling |
| `POST` | `/api/executions/:id/stop` | — | `{ ok: true, status }` | Stop button |
| `DELETE` | `/api/executions/:id` | — | `{ ok: true }` | History delete |

### Artifacts

| Method | Endpoint | Response | Used by |
| --- | --- | --- | --- |
| `GET` | `/api/screenshots` | `{ id, execId, test, url, takenAt }[]` | Screenshots page |
| `GET` | `/api/videos` | `{ id, execId, test, url, duration?, takenAt }[]` | Videos page |
| `GET` | `/api/traces` | `{ id, execId, test, url, size?, takenAt }[]` | Traces page |
| `GET` | `/api/reports` | `{ id, execId, suite, environment, status, url, generatedAt, sizeMB? }[]` | Reports page |

### Type definitions

```ts
// Execution (history row)
interface Execution {
  id: string;
  suite: string;
  environment: "QA" | "Production";
  browser: "Chrome" | "Firefox" | "Edge";
  mode: "Headless" | "Headed";
  workers: number;
  status: "passed" | "failed" | "running" | "skipped" | "aborted";
  startedAt: string; // ISO 8601
  duration: number;  // seconds
  passed: number;
  failed: number;
  skipped: number;
  triggeredBy: string;
}

// Execution detail (live polling response)
interface ExecutionDetail extends Execution {
  logs?: LogLine[];
  progress?: number;        // 0–100
  currentFile?: string;
  currentTest?: string;
  currentStep?: string;
  totalPlanned?: number;
}

interface LogLine {
  ts: number;               // epoch ms
  level: "info" | "pass" | "fail" | "warn";
  text: string;
}
```

### Artifact URL rules

- The `url` field may be **absolute** (`https://...`) or **relative** (`/uploads/...`).
- Relative URLs are resolved against the configured API base URL.
- Screenshots are previewed in a zoomable lightbox.
- Videos are rendered in an inline `<video controls>` element.
- Traces are opened at `https://trace.playwright.dev/?trace=<url>`.
- Reports are rendered in a full-screen iframe.

---

## How to build the Express backend

The backend is intentionally not part of this repo. Create a separate Node.js/Express project (or any HTTP server) that implements the contract above.

### Recommended Express structure

```
playwright-backend/
├── src/
│   ├── index.ts              # Express app bootstrap
│   ├── routes/
│   │   ├── executions.ts     # CRUD + start/stop/poll
│   │   ├── screenshots.ts    # List + serve screenshot files
│   │   ├── videos.ts         # List + serve video files
│   │   ├── traces.ts         # List + serve trace ZIPs
│   │   └── reports.ts        # List + serve HTML reports
│   ├── services/
│   │   ├── runner.ts         # Spawns Playwright child process
│   │   └── store.ts          # In-memory or DB execution store
│   ├── lib/
│   │   └── playwright.ts     # Your existing Playwright framework
│   └── uploads/              # Generated artifacts
├── package.json
└── playwright.config.js
```

### Minimal start endpoint

```js
// POST /api/executions
app.post('/api/executions', async (req, res) => {
  const { suite, environment, browser, mode, workers, specFile } = req.body;

  const id = `exec_${nanoid(6)}`;
  const execution = {
    id,
    suite,
    environment,
    browser,
    mode,
    workers,
    status: 'running',
    startedAt: new Date().toISOString(),
    duration: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    triggeredBy: req.user?.email || 'dashboard',
    logs: [],
    progress: 0,
    currentTest: '',
    currentStep: '',
    currentFile: '',
    totalPlanned: 0,
  };

  store.set(id, execution);

  // Spawn Playwright in a non-blocking worker
  runner.spawn(execution, { specFile });

  res.status(201).json(execution);
});
```

### Polling / live updates

For now the dashboard polls `GET /api/executions/:id` every 1.2 seconds. Your backend should return the latest execution state, including `logs`, `progress`, `passed`, `failed`, `skipped`, and `currentTest`.

When you are ready to move to real-time updates, keep the REST endpoints and add Socket.IO events such as:

- `execution:update`
- `execution:log`
- `execution:finished`

Then replace the polling interval in `src/lib/execution-store.tsx` with Socket.IO listeners.

### CORS

The frontend dev server runs on `http://localhost:8080`. Allow CORS from that origin during development:

```js
app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
```

---

## How to wire your Playwright framework

### 1. Keep your existing Playwright project intact

Do not move the framework into this frontend repo. The dashboard only needs to know how to **start it**, **poll its progress**, and **read its artifacts**.

### 2. Runner service responsibilities

The backend runner should:

1. Accept a configuration object from `POST /api/executions`.
2. Map the requested `suite` to one or more Playwright spec files.
3. Build the `npx playwright test` command (or invoke the Playwright API programmatically).
4. Capture stdout/stderr and convert each line into a `LogLine`.
5. Track `passed`, `failed`, `skipped`, `currentTest`, and `progress`.
6. On completion, update `status` to `passed` or `failed` and compute `duration`.
7. Move generated artifacts into the `/uploads` folder and expose them via the artifact endpoints.

### 3. Example command mapping

```js
function buildCommand({ suite, browser, mode, workers, specFile }) {
  const project = browser.toLowerCase(); // chrome, firefox, edge
  const headless = mode === 'Headless' ? 'true' : 'false';
  const grep = suite === 'Smoke' ? '--grep @smoke' : '';
  const files = specFile ? `tests/${specFile}` : 'tests';

  return `npx playwright test ${files} --project=${project} --workers=${workers} --headless=${headless} ${grep}`;
}
```

### 4. Artifact publishing

Configure Playwright to output to a per-execution folder:

```js
// playwright.config.js
export default {
  outputDir: `test-results/exec-${process.env.EXEC_ID || 'default'}`,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['html', { outputFolder: `playwright-report/exec-${process.env.EXEC_ID || 'default'}` }],
    ['json', { outputFile: `results/exec-${process.env.EXEC_ID || 'default'}.json` }],
  ],
};
```

After the run, the backend copies the contents of that folder into the public uploads directory and returns the URLs in the artifact list endpoints.

### 5. Trace viewer

Trace files must be served with the correct `Content-Type` and CORS headers so `trace.playwright.dev` can fetch them. For a `.zip` trace file:

```js
res.set('Content-Type', 'application/zip');
res.set('Access-Control-Allow-Origin', '*');
res.sendFile(tracePath);
```

---

## Environment variables

The frontend uses `import.meta.env.VITE_*` for build-time public variables and `localStorage` for runtime user settings.

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Optional build-time default for the backend base URL. | `http://localhost:4000` |
| `pw:apiBaseUrl` | `localStorage` key for the configured API base URL. | — |
| `pw:apiToken` | `localStorage` key for the optional bearer token. | — |

To make the dashboard default to a deployed backend, set `VITE_API_BASE_URL` in your hosting environment. The user can still override it in Settings.

---

## Common tasks

### Add a new page

Create a file in `src/routes/`. The file path maps to the URL automatically. For example, `src/routes/ci.tsx` becomes `/ci`. Export the route using `createFileRoute('/ci')`.

### Add a new API endpoint

1. Add the typed wrapper in `src/lib/api.ts`.
2. Use it in the route component or in `execution-store.tsx`.
3. Implement the matching endpoint in your Express backend.

### Switch from polling to Socket.IO

1. Install `socket.io-client` in this frontend.
2. In `src/lib/execution-store.tsx`, initialize the socket inside `useEffect`.
3. Listen for backend events and update `live` state.
4. Remove the `setInterval(pollOnce, 1200)` polling timer.
5. Keep the REST endpoints for history and artifacts.

### Customize the theme

Edit `src/styles.css`. The design tokens are defined as CSS custom properties under `@theme`. Changing `--primary`, `--background`, `--foreground`, `--success`, `--destructive`, and `--warning` will update the entire dashboard.

### Build for production

```bash
bun run build
```

The output is generated by Vite and ready for static hosting or the Lovable Cloud edge runtime.

---

## Need help?

- Backend contract lives in `src/lib/api.ts`.
- Live execution state lives in `src/lib/execution-store.tsx`.
- Route file conventions live in `src/routes/README.md`.
- UI components come from `src/components/ui/` and `src/components/dashboard-ui.tsx`.
