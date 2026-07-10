import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Image as ImageIcon, RefreshCw, AlertTriangle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/dashboard-ui";
import { MediaPreview } from "@/components/media-preview";
import { Button } from "@/components/ui/button";
import { api, absoluteAssetUrl, getApiBaseUrl } from "@/lib/api";

type Shot = { id: string; execId: string; test: string; url: string; takenAt: string };

export const Route = createFileRoute("/screenshots")({
  head: () => ({
    meta: [
      { title: "Screenshots · Playwright Automation" },
      { name: "description", content: "Failure and step screenshots captured across Playwright executions." },
    ],
  }),
  component: ScreenshotsPage,
});

function ScreenshotsPage() {
  const [items, setItems] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Shot | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setItems(await api.listScreenshots()); }
    catch (e) { setError(e instanceof Error ? e.message : "network error"); setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Screenshots" description={error
          ? `Cannot reach ${getApiBaseUrl()}/api/screenshots`
          : `${items.length} images from ${getApiBaseUrl()}`} />
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="surface-card group overflow-hidden">
            <button
              onClick={() => setPreview(s)}
              className="relative block h-48 w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900"
            >
              {s.url ? (
                <img src={absoluteAssetUrl(s.url)} alt={s.test} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
              ) : (
                <ImageIcon className="mx-auto mt-16 h-12 w-12 text-white/40" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </button>
            <div className="p-4">
              <div className="truncate text-sm font-medium text-foreground">{s.test}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{s.execId}</span>
                <span>{formatDistanceToNow(new Date(s.takenAt), { addSuffix: true })}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1 gap-1.5" onClick={() => setPreview(s)}>
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <a href={absoluteAssetUrl(s.url)} download><Download className="h-3.5 w-3.5" /></a>
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && !error && (
          <div className="col-span-full surface-card p-12 text-center text-sm text-muted-foreground">No screenshots yet.</div>
        )}
      </div>

      <MediaPreview
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        title={preview?.test ?? ""}
        subtitle={preview && <><span className="font-mono">{preview.execId}</span> · {formatDistanceToNow(new Date(preview.takenAt), { addSuffix: true })}</>}
        url={preview?.url ?? ""}
        kind="image"
        downloadName={preview ? `${preview.id}.png` : undefined}
      />
    </div>
  );
}
