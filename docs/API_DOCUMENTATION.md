# API Documentation — QA Automation Console

> Generated: 2026-07-18 | Version: v1.1.0

All endpoints are prefixed with the backend base URL (configured in `VITE_API_URL`).
Responses follow the shape: `{ success: true, data: <payload> }` on success, `{ error: "message", details: [...] }` on failure.

---

## Executions

### POST /api/executions

Start a new Playwright test execution.

**Request Body:**

```json
{
  "suite": "cipherschools",
  "environment": "QA",
  "browser": "Chrome",
  "mode": "Headless",
  "workers": 4,
  "specFile": "tests/auth/login.spec.js",
  "email": "tester@example.com",
  "password": "s3cur3p4ss",
  "customUrl": "https://custom.example.com",
  "profile": "QA Smoke – Chrome"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `suite` | string | Yes | Test folder name |
| `environment` | string | Yes | Environment name (ignored if `customUrl` set) |
| `browser` | string | Yes | Chrome / Firefox / Edge |
| `mode` | string | Yes | Headless / Headed |
| `workers` | number | Yes | 1–16 |
| `specFile` | string | No | Relative spec path. Omit for all files |
| `email` | string | No | Runtime email override |
| `password` | string | No | Runtime password. NEVER stored |
| `customUrl` | string | No | Overrides BASE_URL for this run |
| `profile` | string | No | Profile name used (audit only) |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "exec_a3bX9",
    "suite": "cipherschools",
    "environment": "QA",
    "browser": "Chrome",
    "mode": "Headless",
    "workers": 4,
    "email": "tester@example.com",
    "profile": "QA Smoke – Chrome",
    "customUrl": "",
    "status": "running",
    "startedAt": "2026-07-18T10:00:00.000Z",
    "duration": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "progress": 0,
    "logs": []
  }
}
```

**Error Responses:**

| Status | Reason |
|---|---|
| 400 | Validation failed (missing suite, invalid browser, etc.) |
| 500 | Internal server error |

---

### GET /api/executions

List all executions (live + history merged, newest first).

**Response (200):**

```json
{
  "success": true,
  "data": [
    { "id": "exec_a3bX9", "status": "passed", "suite": "cipherschools", ... }
  ]
}
```

---

### GET /api/executions/:id

Get full detail of a single execution (supports live polling).

---

### POST /api/executions/:id/stop

Stop a running execution.

**Response (200):**

```json
{ "ok": true, "status": "aborted" }
```

---

### DELETE /api/executions/:id

Delete a single execution from store, history, and artifacts.

---

### DELETE /api/executions

Batch delete executions.

**Query:** `?all=true` — delete everything  
**Body:** `{ "ids": ["exec_a3bX9", "exec_b4cY1"] }` — delete specific IDs

---

## Execution Profiles

### GET /api/profiles

List all execution profiles.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "68797abc...",
      "name": "QA Smoke – Chrome",
      "email": "tester@example.com",
      "defaultEnvironment": "QA",
      "defaultBrowser": "Chrome",
      "defaultWorkers": 4,
      "defaultMode": "Headless",
      "defaultFolder": "cipherschools",
      "defaultSpec": "",
      "description": "Standard QA smoke run",
      "createdAt": "2026-07-18T10:00:00.000Z",
      "updatedAt": "2026-07-18T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/profiles

Create a new execution profile.

**Request Body:**

```json
{
  "name": "QA Smoke – Chrome",
  "email": "tester@example.com",
  "defaultEnvironment": "QA",
  "defaultBrowser": "Chrome",
  "defaultWorkers": 4,
  "defaultMode": "Headless",
  "defaultFolder": "cipherschools",
  "defaultSpec": "",
  "description": "Standard QA smoke run"
}
```

> **Note:** No `password` field is accepted. Ever.

**Response (201):** Created profile document.

**Error Responses:**

| Status | Reason |
|---|---|
| 400 | Profile name missing |
| 409 | Profile with same name already exists |

---

### GET /api/profiles/:id

Get a single profile by MongoDB `_id`.

---

### PUT /api/profiles/:id

Update an existing profile. Partial updates supported.

**Response (200):** Updated profile document.

---

### DELETE /api/profiles/:id

Delete a profile permanently.

**Response (200):** `{ "ok": true, "deletedId": "68797abc..." }`

---

## Settings

### GET /api/settings

Get current backend settings.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "environments": {
      "QA": "https://qa.cipherschools.com",
      "Production": "https://www.cipherschools.com"
    },
    "browsers": ["Chrome", "Firefox", "Edge"],
    "slackWebhookUrl": "",
    "emailRecipient": "",
    "notifications": {
      "automationStarted": true,
      "executionCompleted": true,
      "executionFailed": true,
      "reportGenerated": false
    },
    "slackOnFailureOnly": true,
    "dailyDigest": true
  }
}
```

---

### PUT /api/settings

Update settings. Partial updates supported.

---

## Spec Discovery

### GET /api/specs

Discover available test spec files.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "name": "cipherschools",
        "path": "tests/cipherschools",
        "files": [
          { "name": "login.spec.js", "relativePath": "tests/cipherschools/login.spec.js" }
        ]
      }
    ],
    "totalFiles": 12
  }
}
```

---

## Artifacts

### GET /api/reports

List all registered test reports.

### GET /api/screenshots

List all registered screenshots.

### GET /api/videos

List all registered videos.

### GET /api/traces

List all registered trace files.

---

## Health

### GET /health

Backend health check (no auth required).

**Response:**

```json
{ "status": "healthy", "uptime": 3600.5, "timestamp": "2026-07-18T10:00:00.000Z" }
```

---

## Error Codes

| HTTP Status | Meaning |
|---|---|
| 400 | Bad request / validation failure |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate profile name) |
| 500 | Internal server error |

All error responses include `{ "error": "Human-readable message" }` and optionally `"details": [...]` for validation errors.
