import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Execution, ExecStatus } from "./types";
import { api, type StartPayload } from "./api";

export interface LogLine {
  ts: number;
  level: "info" | "pass" | "fail" | "warn";
  text: string;
}

interface LiveExecution {
  id: string;
  suite: string;
  environment: string;
  browser: "Chrome" | "Firefox" | "Edge";
  mode: "Headless" | "Headed";
  workers: number;
  specFile?: string;
  status: ExecStatus;
  startedAt: number;
  logs: LogLine[];
  currentTest: string;
  currentStep: string;
  currentFile: string;
  passed: number;
  failed: number;
  skipped: number;
  totalPlanned: number;
  progress: number;
}

export interface RunConfig extends StartPayload {}

interface Ctx {
  live: LiveExecution | null;
  history: Execution[];
  historyLoading: boolean;
  historyError: string | null;
  isRunning: boolean;
  start: (cfg: RunConfig) => Promise<void>;
  stop: () => Promise<void>;
  clearLive: () => void;
  refreshHistory: () => Promise<void>;
}

const ExecutionContext = createContext<Ctx | null>(null);

function toLogLine(raw: unknown): LogLine {
  if (raw && typeof raw === "object" && "text" in raw) {
    const l = raw as Partial<LogLine>;
    return {
      ts: typeof l.ts === "number" ? l.ts : Date.now(),
      level: (l.level as LogLine["level"]) || "info",
      text: String(l.text ?? ""),
    };
  }
  const text = String(raw ?? "");
  const level: LogLine["level"] = text.includes("✓")
    ? "pass"
    : text.includes("✗") || /fail/i.test(text)
      ? "fail"
      : /warn/i.test(text)
        ? "warn"
        : "info";
  return { ts: Date.now(), level, text };
}

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<LiveExecution | null>(null);
  const [history, setHistory] = useState<Execution[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const rows = await api.listExecutions();
      setHistory(rows);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "Failed to reach backend");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { void refreshHistory(); }, [refreshHistory]);

  const pollOnce = useCallback(async (id: string) => {
    try {
      const d = await api.getExecution(id);
      setLive((cur) => {
        if (!cur || cur.id !== id) return cur;
        const logs = (d.logs ?? []).map(toLogLine);
        const status = d.status ?? cur.status;
        const next: LiveExecution = {
          ...cur,
          status,
          logs: logs.length > cur.logs.length ? logs : cur.logs,
          passed: d.passed ?? cur.passed,
          failed: d.failed ?? cur.failed,
          skipped: d.skipped ?? cur.skipped,
          progress: typeof d.progress === "number"
            ? d.progress
            : cur.totalPlanned
              ? Math.min(100, Math.round(((d.passed ?? 0) + (d.failed ?? 0) + (d.skipped ?? 0)) / cur.totalPlanned * 100))
              : cur.progress,
          totalPlanned: d.totalPlanned ?? cur.totalPlanned,
          currentFile: d.currentFile ?? cur.currentFile,
          currentTest: d.currentTest ?? cur.currentTest,
          currentStep: d.currentStep ?? cur.currentStep,
        };
        if (status !== "running") {
          stopPolling();
          void refreshHistory();
        }
        return next;
      });
    } catch (e) {
      setLive((cur) => {
        if (!cur) return cur;
        const msg = e instanceof Error ? e.message : "network error";
        const warn: LogLine = { ts: Date.now(), level: "warn", text: `⚠ poll failed: ${msg}` };
        return { ...cur, logs: [...cur.logs, warn].slice(-500) };
      });
    }
  }, [refreshHistory]);

  // Set up Socket.IO listeners
  useEffect(() => {
    import("./socket").then(({ getSocket }) => {
      const socket = getSocket();
      
      socket.on("execution-log", (data: any) => {
        setLive((cur) => {
          if (!cur || cur.id !== data.execId) return cur;
          const newLog = toLogLine(data);
          return { ...cur, logs: [...cur.logs, newLog] };
        });
      });

      socket.on("execution-progress", (data: any) => {
        setLive((cur) => {
          if (!cur || cur.id !== data.execId) return cur;
          return {
            ...cur,
            passed: data.passed ?? cur.passed,
            failed: data.failed ?? cur.failed,
            skipped: data.skipped ?? cur.skipped,
            progress: data.progress ?? cur.progress,
            currentFile: data.currentFile ?? cur.currentFile,
            currentTest: data.currentTest ?? cur.currentTest,
            currentStep: data.currentStep ?? cur.currentStep,
          };
        });
      });

      socket.on("execution-completed", (data: any) => {
        setLive((cur) => {
          if (!cur || cur.id !== data.id) return cur;
          stopPolling();
          void refreshHistory();
          return { ...cur, status: data.status };
        });
      });

      socket.on("execution-error", (data: any) => {
        setLive((cur) => {
          if (!cur || cur.id !== data.execId) return cur;
          const newLog = toLogLine({ level: "fail", text: data.error });
          return { ...cur, logs: [...cur.logs, newLog] };
        });
      });

      return () => {
        socket.off("execution-log");
        socket.off("execution-progress");
        socket.off("execution-completed");
        socket.off("execution-error");
      };
    }).catch(console.error);
  }, [refreshHistory]);

  const start = useCallback(async (cfg: RunConfig) => {
    stopPolling();
    const startedAt = Date.now();
    // Optimistic live entry while we wait for the backend to accept the run.
    const tempId = `pending_${Math.random().toString(36).slice(2, 8)}`;
    setLive({
      id: tempId, suite: cfg.suite, environment: cfg.environment, browser: cfg.browser,
      mode: cfg.mode, workers: cfg.workers, specFile: cfg.specFile,
      status: "running", startedAt,
      logs: [{ ts: startedAt, level: "info" as const, text: `→ POST /api/executions  (${cfg.suite} · ${cfg.browser} · ${cfg.environment})` }],
      currentTest: "waiting for backend…", currentStep: "dispatching", currentFile: "-",
      passed: 0, failed: 0, skipped: 0, totalPlanned: 0, progress: 0,
    });

    let created: Awaited<ReturnType<typeof api.startExecution>>;
    try {
      created = await api.startExecution(cfg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown error";
      setLive((cur) => cur && ({
        ...cur, status: "aborted",
        logs: [...cur.logs, { ts: Date.now(), level: "fail" as const, text: `✗ backend unreachable: ${msg}` }],
      }));
      throw e;
    }

    setLive((cur) => cur && ({
      ...cur,
      id: created.id,
      status: created.status ?? "running",
      startedAt: created.startedAt ? new Date(created.startedAt).getTime() : cur.startedAt,
      totalPlanned: created.totalPlanned ?? cur.totalPlanned,
      logs: [...cur.logs, { ts: Date.now(), level: "info" as const, text: `✓ execution accepted · id=${created.id}` }],
    }));

    pollRef.current = setInterval(() => { void pollOnce(created.id); }, 1200);
    void pollOnce(created.id);
  }, [pollOnce]);

  const stop = useCallback(async () => {
    const id = live?.id;
    if (!id || id.startsWith("pending_")) { stopPolling(); return; }
    try {
      await api.stopExecution(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "network error";
      setLive((cur) => cur && ({
        ...cur, logs: [...cur.logs, { ts: Date.now(), level: "warn" as const, text: `⚠ stop failed: ${msg}` }],
      }));
      return;
    }
    setLive((cur) => cur && ({ ...cur, status: "aborted" }));
    stopPolling();
    void refreshHistory();
  }, [live?.id, refreshHistory]);

  useEffect(() => () => stopPolling(), []);

  const clearLive = useCallback(() => setLive(null), []);

  const value = useMemo<Ctx>(() => ({
    live, history, historyLoading, historyError,
    isRunning: live?.status === "running",
    start, stop, clearLive, refreshHistory,
  }), [live, history, historyLoading, historyError, start, stop, clearLive, refreshHistory]);

  return <ExecutionContext.Provider value={value}>{children}</ExecutionContext.Provider>;
}

export function useExecution() {
  const ctx = useContext(ExecutionContext);
  if (!ctx) throw new Error("useExecution must be used inside ExecutionProvider");
  return ctx;
}
