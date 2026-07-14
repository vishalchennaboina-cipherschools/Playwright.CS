// REST client for the Express Playwright backend.
// Base URL is user-configurable via Settings and persisted in localStorage.

import type { ExecStatus, Execution } from "./types";
import type { LogLine } from "./execution-store";

const KEY = "pw:apiBaseUrl";
const TOKEN_KEY = "pw:apiToken";
export const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_BASE_URL;
  return window.localStorage.getItem(KEY) || DEFAULT_BASE_URL;
}
export function setApiBaseUrl(v: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v);
}
export function getApiToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}
export function setApiToken(v: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, v);
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const token = getApiToken();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get("content-type") || "";
  return (ct.includes("application/json") ? await res.json() : (await res.text() as unknown)) as T;
}

// Resolve a possibly-relative artifact URL against the configured API base URL.
export function absoluteAssetUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const base = getApiBaseUrl().replace(/\/+$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ---------- Spec discovery types ----------

export interface SpecFile {
  name: string;
  relativePath: string;
}

export interface SpecFolder {
  name: string;
  path: string;
  files: SpecFile[];
}

export interface SpecTree {
  folders: SpecFolder[];
  totalFiles: number;
}

// ---------- Settings types ----------

export interface BackendSettings {
  environments: Record<string, string>;
  browsers: string[];
  slackWebhookUrl: string;
  emailRecipient: string;
  notifications: {
    automationStarted: boolean;
    executionCompleted: boolean;
    executionFailed: boolean;
    reportGenerated: boolean;
  };
  slackOnFailureOnly: boolean;
  dailyDigest: boolean;
}

// ---------- Execution types ----------

export interface StartPayload {
  suite: string;
  environment: string;
  browser: "Chrome" | "Firefox" | "Edge";
  mode: "Headless" | "Headed";
  workers: number;
  specFile?: string;
}

export interface ExecutionDetail extends Execution {
  logs?: LogLine[];
  progress?: number;
  currentFile?: string;
  currentTest?: string;
  currentStep?: string;
  totalPlanned?: number;
}

// ---------- Endpoints ----------

export const api = {
  // Executions
  startExecution: (payload: StartPayload) =>
    req<ExecutionDetail>("/api/executions", { method: "POST", body: JSON.stringify(payload) }),
  stopExecution: (id: string) =>
    req<{ ok: true; status: ExecStatus }>(`/api/executions/${id}/stop`, { method: "POST" }),
  getExecution: (id: string) => req<ExecutionDetail>(`/api/executions/${id}`),
  listExecutions: () => req<Execution[]>("/api/executions"),
  deleteExecution: (id: string) => req<{ ok: true }>(`/api/executions/${id}`, { method: "DELETE" }),

  // Artifacts
  listScreenshots: () =>
    req<Array<{ id: string; execId: string; test: string; url: string; takenAt: string }>>(
      "/api/screenshots",
    ),
  listVideos: () =>
    req<Array<{ id: string; execId: string; test: string; url: string; duration?: string; takenAt: string }>>(
      "/api/videos",
    ),
  listTraces: () =>
    req<Array<{ id: string; execId: string; test: string; url: string; size?: string; takenAt: string }>>(
      "/api/traces",
    ),
  listReports: () =>
    req<Array<{ id: string; execId: string; suite: string; environment: string; status: ExecStatus; url: string; generatedAt: string; sizeMB?: string | number }>>(
      "/api/reports",
    ),

  // Spec discovery
  listSpecs: () => req<SpecTree>("/api/specs"),

  // Settings
  getSettings: () => req<BackendSettings>("/api/settings"),
  updateSettings: (payload: Partial<BackendSettings>) =>
    req<{ ok: true }>("/api/settings", { method: "PUT", body: JSON.stringify(payload) }),

  // Logs
  listLogs: () =>
    req<Array<{ ts: number; level: string; text: string }>>("/api/logs"),
};
