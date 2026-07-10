import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Search, ScrollText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard-ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useExecution } from "@/lib/execution-store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Logs · Playwright Automation" },
      {
        name: "description",
        content: "Searchable execution logs with syntax highlighting and download.",
      },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const { live } = useExecution();
  const [q, setQ] = useState("");

  // Fetch historical logs from backend when no live execution
  const [backendLogs, setBackendLogs] = useState<Array<{ ts: number; text: string }>>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (live?.logs.length) return; // live logs take priority
    let cancelled = false;
    setLogsLoading(true);
    api.listLogs()
      .then((logs) => {
        if (!cancelled) setBackendLogs(logs.map((l) => ({ ts: l.ts, text: l.text })));
      })
      .catch(() => {
        if (!cancelled) setBackendLogs([]);
      })
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => { cancelled = true; };
  }, [live]);

  const lines = useMemo(() => {
    if (live?.logs.length) return live.logs.map((l) => ({ ts: l.ts, text: l.text }));
    return backendLogs;
  }, [live, backendLogs]);

  const filtered = useMemo(
    () => (q ? lines.filter((l) => l.text.toLowerCase().includes(q.toLowerCase())) : lines),
    [lines, q],
  );

  const copy = async () => {
    await navigator.clipboard.writeText(filtered.map((l) => l.text).join("\n"));
    toast.success("Logs copied to clipboard");
  };
  const download = () => {
    const blob = new Blob(
      [filtered.map((l) => `[${new Date(l.ts).toISOString()}] ${l.text}`).join("\n")],
      { type: "text/plain" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "execution.log";
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Logs"
        description="Search execution output with syntax highlighting and auto-scroll."
      />

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background/40 p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter log lines…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button size="sm" variant="secondary" className="gap-1.5" onClick={copy} disabled={filtered.length === 0}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button size="sm" variant="secondary" className="gap-1.5" onClick={download} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-auto bg-[oklch(0.11_0.015_250)] px-4 py-3 font-mono text-[12.5px] leading-relaxed">
          {logsLoading && lines.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" /> Loading logs…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-sm text-muted-foreground">
              <ScrollText className="h-6 w-6" />
              {lines.length === 0 ? "No logs available. Run an execution to generate logs." : "No log lines match your filter."}
            </div>
          ) : (
            filtered.map((l, i) => {
              const isPass = l.text.includes("✓");
              const isFail = l.text.toLowerCase().includes("fail") || l.text.includes("✗");
              const isCmd = l.text.startsWith("→");
              return (
                <div
                  key={i}
                  className={cn(
                    "whitespace-pre-wrap",
                    isPass && "text-success",
                    isFail && "text-destructive",
                    isCmd && "text-accent",
                    !isPass && !isFail && !isCmd && "text-muted-foreground",
                  )}
                >
                  <span className="mr-3 text-muted-foreground/40">
                    {new Date(l.ts).toISOString().slice(11, 19)}
                  </span>
                  {l.text}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
