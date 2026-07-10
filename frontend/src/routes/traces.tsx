import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Route as RouteIcon, ExternalLink, Download, Archive, RefreshCw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { api, absoluteAssetUrl, getApiBaseUrl } from "@/lib/api";

type Trace = { id: string; execId: string; test: string; url: string; size?: string; takenAt: string };

export const Route = createFileRoute("/traces")({
  head: () => ({
    meta: [
      { title: "Trace Viewer · Playwright Automation" },
      { name: "description", content: "Playwright trace bundles for step-by-step debugging of failed tests." },
    ],
  }),
  component: TracesPage,
});

function TracesPage() {
  const [items, setItems] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setItems(await api.listTraces()); }
    catch (e) { setError(e instanceof Error ? e.message : "network error"); setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const openInViewer = (t: Trace) => {
    const abs = absoluteAssetUrl(t.url);
    // Playwright trace viewer needs an absolute, publicly reachable URL.
    window.open(`https://trace.playwright.dev/?trace=${encodeURIComponent(abs)}`, "_blank", "noopener");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Trace Viewer"
          description={error
            ? `Cannot reach ${getApiBaseUrl()}/api/traces`
            : `${items.length} trace bundles — opens in trace.playwright.dev`}
        />
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="surface-card flex items-start gap-3 border-destructive/40 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
          <div className="text-xs text-muted-foreground">{error}</div>
        </div>
      )}

      <div className="surface-card divide-y divide-border">
        {items.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 text-accent">
              <RouteIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{t.test}</div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{t.execId}</span>
                {t.size && <span className="flex items-center gap-1"><Archive className="h-3 w-3" /> {t.size}</span>}
                <span>{formatDistanceToNow(new Date(t.takenAt), { addSuffix: true })}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => openInViewer(t)}>
                <ExternalLink className="h-3.5 w-3.5" /> Open in trace viewer
              </Button>
              <Button asChild size="sm" variant="ghost" className="gap-1.5">
                <a href={absoluteAssetUrl(t.url)} download><Download className="h-3.5 w-3.5" /> .zip</a>
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && !error && (
          <div className="p-12 text-center text-sm text-muted-foreground">No trace bundles yet.</div>
        )}
      </div>
    </div>
  );
}
