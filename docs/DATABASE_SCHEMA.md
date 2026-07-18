# Database Schema — QA Automation Console

> Generated: 2026-07-18 | Version: v1.1.0

---

## Overview

MongoDB Atlas is used as the database. All schemas are defined using Mongoose.

| Collection | Mongoose Model | Purpose |
|---|---|---|
| `executions` | `Execution` | Live in-progress test runs |
| `execution_histories` | `ExecutionHistory` | Completed run archive |
| `artifacts` | `Artifact` | File metadata (reports, screenshots, etc.) |
| `execution_profiles` | `ExecutionProfile` | Reusable run configuration templates |

---

## executions

**Model file:** `backend/src/models/Execution.js`

Stores a single live execution. When a run completes (passed, failed, aborted), this document is moved to `execution_histories` and deleted from this collection.

```javascript
{
  id:           String,    // unique exec ID e.g. "exec_a3bX9" (indexed, unique)
  suite:        String,    // test folder name
  environment:  String,    // e.g. "QA"
  browser:      String,    // "Chrome" | "Firefox" | "Edge"
  mode:         String,    // "Headless" | "Headed"
  workers:      Number,    // 1–16
  specFile:     String,    // optional, relative path
  triggeredBy:  String,    // "dashboard" (default)
  email:        String,    // operator email for traceability (NEVER password)
  profile:      String,    // profile name used (audit trail)
  customUrl:    String,    // custom BASE_URL if provided
  status:       String,    // "running" | "passed" | "failed" | "aborted"
  startedAt:    String,    // ISO 8601 timestamp
  duration:     Number,    // seconds
  passed:       Number,    // test count
  failed:       Number,    // test count
  skipped:      Number,    // test count
  logs: [{
    ts:    Number,         // Unix timestamp ms
    level: String,         // "info" | "pass" | "fail" | "warn"
    text:  String          // log line content (max 2000 chars)
  }],
  progress:     Number,    // 0–100
  currentFile:  String,    // currently running spec file
  currentTest:  String,    // currently running test name
  currentStep:  String,    // current step within test
  totalPlanned: Number,    // expected test count
  errorMessage: String     // set if run failed to start
}
```

**Indexes:**
- `{ id: 1 }` — unique
- `{ status: 1, startedAt: -1 }` — filter by status + sort

> **SECURITY:** The `password` field does NOT exist in this schema. Passwords are never written to MongoDB.

---

## execution_histories

**Model file:** `backend/src/models/ExecutionHistory.js`

Identical schema to `executions` but stored permanently after completion. `progress` defaults to 100. Has additional `completedAt` field.

```javascript
{
  // Same fields as executions, plus:
  completedAt: String,    // ISO 8601 when the run finished
  // progress defaults to 100 for completed runs
}
```

**Indexes:**
- `{ id: 1 }` — unique
- `{ startedAt: -1 }` — default sort for history view
- `{ suite: 1, environment: 1 }` — filter queries

---

## artifacts

**Model file:** `backend/src/models/Artifact.js`

```javascript
{
  id:          String,    // unique artifact ID
  execId:      String,    // parent execution ID (indexed)
  type:        String,    // "report" | "screenshot" | "video" | "trace"
  test:        String,    // test name (for screenshots/videos/traces)
  url:         String,    // relative URL e.g. "/uploads/reports/exec_a/index.html"
  suite:       String,    // denormalized from execution
  environment: String,    // denormalized from execution
  status:      String,    // denormalized from execution
  sizeMB:      Number,    // file size in MB (optional)
  duration:    String,    // video/trace duration (optional)
  takenAt:     String,    // ISO 8601 capture timestamp
  generatedAt: String     // ISO 8601 (reports only)
}
```

**Indexes:**
- `{ execId: 1, type: 1 }` — filter by execution + type
- `{ takenAt: -1 }` — sort

---

## execution_profiles

**Model file:** `backend/src/models/ExecutionProfile.js`

NEW in v1.1.0.

```javascript
{
  name:               String,    // unique profile name (indexed unique)
  email:              String,    // default operator email (NO password — by design)
  defaultEnvironment: String,    // environment name
  defaultBrowser:     String,    // "Chrome" | "Firefox" | "Edge"
  defaultWorkers:     Number,    // 1–16, default 4
  defaultMode:        String,    // "Headless" | "Headed"
  defaultFolder:      String,    // test folder (suite)
  defaultSpec:        String,    // spec file path, empty = all files
  description:        String,    // human-readable description

  // Auto-managed timestamps:
  createdAt:  Date,
  updatedAt:  Date
}
```

**Indexes:**
- `{ name: 1 }` — unique
- `{ createdAt: -1 }` — default sort

> **SECURITY:** There is no `password` field, no `credentials` field, no credential-related field of any kind in this schema. This is enforced at the model level.

---

## Relationship Diagram

```
ExecutionProfile (read-only reference)
       |
       | profile.name stored in
       v
  Execution ──────────────────────→ ExecutionHistory
  (live runs)       archived on      (completed runs)
       |             completion
       | execId
       v
    Artifact
  (reports, screenshots,
   videos, traces)
```

---

## Migration Notes

- **v1.0.0 → v1.1.0:** No schema migration required. `email`, `profile`, `customUrl` fields have empty-string defaults, so existing documents remain valid and backwards-compatible.
- The `execution_profiles` collection is created automatically by Mongoose on first profile creation.
