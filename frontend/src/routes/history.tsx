import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Eye, RefreshCw, Search, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader, StatusPill, formatDuration } from "@/components/dashboard-ui";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useExecution } from "@/lib/execution-store";
import { api, getApiBaseUrl } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Execution History · Playwright Automation" },
      { name: "description", content: "Full history of Playwright executions with filters, status and downloadable reports." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history, historyLoading, historyError, refreshHistory } = useExecution();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [env, setEnv] = useState<string>("all");

  const filtered = useMemo(() => history.filter((e) => {
    if (status !== "all" && e.status !== status) return false;
    if (env !== "all" && e.environment !== env) return false;
    if (q && !(`${e.id} ${e.suite} ${e.browser} ${e.triggeredBy}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [history, status, env, q]);

  const onDelete = async (id: string) => {
    try {
      await api.deleteExecution(id);
      toast.success("Execution deleted");
      await refreshHistory();
    } catch (e) {
      toast.error("Delete failed", { description: e instanceof Error ? e.message : "" });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Execution History"
        description={historyError
          ? `Backend unreachable at ${getApiBaseUrl()}`
          : `${history.length} recorded executions from ${getApiBaseUrl()}`}
      />

      <div className="surface-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by id, suite, browser…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {["all", "passed", "failed", "aborted", "running"].map((s) =>
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={env} onValueChange={setEnv}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Environment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All environments</SelectItem>
              <SelectItem value="QA">QA</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refreshHistory()} disabled={historyLoading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${historyLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {historyError && (
        <div className="surface-card flex items-start gap-3 border-destructive/40 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <div className="font-medium text-foreground">Cannot reach Express backend</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {historyError} — verify the API base URL in <span className="font-mono">Settings</span>{" "}
              and that <span className="font-mono">GET {getApiBaseUrl()}/api/executions</span> responds.
            </div>
          </div>
        </div>
      )}

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Execution</th>
                <th className="px-4 py-3 font-medium">Suite</th>
                <th className="px-4 py-3 font-medium">Env</th>
                <th className="px-4 py-3 font-medium">Browser</th>
                <th className="px-4 py-3 font-medium">Results</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-foreground">{e.id}</div>
                    <div className="text-[11px] text-muted-foreground">by {e.triggeredBy}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{e.suite}</td>
                  <td className="px-4 py-3">
                    <span className={e.environment === "Production" ? "text-warning" : "text-info"}>{e.environment}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.browser} · {e.mode.toLowerCase()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-success">✓ {e.passed}</span>
                      <span className="text-destructive">✗ {e.failed}</span>
                      <span className="text-muted-foreground">◦ {e.skipped}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{formatDuration(e.duration)}</td>
                  <td className="px-4 py-3"><StatusPill status={e.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.startedAt), { addSuffix: true })}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(`${getApiBaseUrl()}/api/executions/${e.id}`, "_blank")}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(`${getApiBaseUrl()}/api/executions/${e.id}/report`, "_blank")}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !historyLoading && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {historyError ? "No data — backend disconnected." : "No executions match the current filters."}
                </td></tr>
              )}
              {historyLoading && history.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">Loading executions…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
