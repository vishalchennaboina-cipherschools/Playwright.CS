/** REST client for the Playwright backend. */

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

/** Resolves an artifact URL. */
export function absoluteAssetUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const base = getApiBaseUrl().replace(/\/+$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

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

export interface StartPayload {
  suite: string;
  environment: string;
  browser: "Chrome" | "Firefox" | "Edge";
  mode: "Headless" | "Headed";
  workers: number;
  specFile?: string;
  email?: string;
  password?: string;
  customUrl?: string;
  profile?: string;
}

export interface ExecutionDetail extends Execution {
  logs?: LogLine[];
  progress?: number;
  currentFile?: string;
  currentTest?: string;
  currentStep?: string;
  totalPlanned?: number;
  email?: string;
  profile?: string;
  customUrl?: string;
}

export interface ExecutionProfile {
  _id: string;
  name: string;
  email: string;
  defaultEnvironment: string;
  defaultBrowser: "Chrome" | "Firefox" | "Edge";
  defaultWorkers: number;
  defaultMode: "Headless" | "Headed";
  defaultFolder: string;
  defaultSpec: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateProfilePayload = Omit<ExecutionProfile, "_id" | "createdAt" | "updatedAt">;

export const api = {
  startExecution: (payload: StartPayload) =>
    req<ExecutionDetail>("/api/executions", { method: "POST", body: JSON.stringify(payload) }),
  stopExecution: (id: string) =>
    req<{ ok: true; status: ExecStatus }>(`/api/executions/${id}/stop`, { method: "POST" }),
  getExecution: (id: string) => req<ExecutionDetail>(`/api/executions/${id}`),
  listExecutions: () => req<Execution[]>("/api/executions"),
  deleteExecution: (id: string) => req<{ ok: true }>(`/api/executions/${id}`, { method: "DELETE" }),

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

  listSpecs: () => req<SpecTree>("/api/specs"),

  getSettings: () => req<BackendSettings>("/api/settings"),
  updateSettings: (payload: Partial<BackendSettings>) =>
    req<{ ok: true }>("/api/settings", { method: "PUT", body: JSON.stringify(payload) }),

  listLogs: () =>
    req<Array<{ ts: number; level: string; text: string }>>("/api/logs"),

  listProfiles: () => req<ExecutionProfile[]>("/api/profiles"),
  createProfile: (payload: CreateProfilePayload) =>
    req<ExecutionProfile>("/api/profiles", { method: "POST", body: JSON.stringify(payload) }),
  updateProfile: (id: string, payload: Partial<CreateProfilePayload>) =>
    req<ExecutionProfile>(`/api/profiles/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProfile: (id: string) =>
    req<{ ok: true }>(`/api/profiles/${id}`, { method: "DELETE" }),
};
