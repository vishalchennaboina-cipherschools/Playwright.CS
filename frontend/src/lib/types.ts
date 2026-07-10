// Shared TypeScript types for the Playwright Automation Platform.
// Extracted from mock-data.ts — this is the single source of truth
// for types used across api.ts, execution-store.tsx, and route files.

export type ExecStatus = "passed" | "failed" | "running" | "skipped" | "aborted";

export interface Execution {
  id: string;
  suite: string;
  environment: string;
  browser: "Chrome" | "Firefox" | "Edge";
  mode: "Headless" | "Headed";
  workers: number;
  status: ExecStatus;
  startedAt: string; // ISO
  duration: number; // seconds
  passed: number;
  failed: number;
  skipped: number;
  triggeredBy: string;
}
