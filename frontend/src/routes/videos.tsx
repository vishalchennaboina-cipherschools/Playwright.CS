import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Download, Video, RefreshCw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/dashboard-ui";
import { MediaPreview } from "@/components/media-preview";
import { Button } from "@/components/ui/button";
import { api, absoluteAssetUrl, getApiBaseUrl } from "@/lib/api";

type Vid = { id: string; execId: string; test: string; url: string; duration?: string; takenAt: string };

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Videos · Playwright Automation" },
      { name: "description", content: "Recorded videos of Playwright test runs, ready to play or download." },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  const [items, setItems] = useState<Vid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Vid | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setItems(await api.listVideos()); }
    catch (e) { setError(e instanceof Error ? e.message : "network error"); setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Videos" description={error
          ? `Cannot reach ${getApiBaseUrl()}/api/videos`
          : `${items.length} recordings from ${getApiBaseUrl()}`} />
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

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((v) => (
          <div key={v.id} className="surface-card overflow-hidden">
            <button
              onClick={() => setPreview(v)}
              className="relative flex h-56 w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            >
              {v.url && (
                <video src={absoluteAssetUrl(v.url)} className="absolute inset-0 h-full w-full object-cover opacity-60" muted preload="metadata" />
              )}
              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-xl transition hover:scale-105 glow-primary">
                <Play className="h-6 w-6 fill-current" />
              </div>
              {v.duration && <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-white">{v.duration}</div>}
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white">
                <Video className="h-3 w-3" /> WEBM
              </div>
            </button>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{v.test}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{v.execId}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(v.takenAt), { addSuffix: true })}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setPreview(v)}>
                  <Play className="h-3.5 w-3.5" /> Play
                </Button>
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <a href={absoluteAssetUrl(v.url)} download><Download className="h-3.5 w-3.5" /></a>
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && !error && (
          <div className="col-span-full surface-card p-12 text-center text-sm text-muted-foreground">No videos yet.</div>
        )}
      </div>

      <MediaPreview
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        title={preview?.test ?? ""}
        subtitle={preview && <><span className="font-mono">{preview.execId}</span> · {formatDistanceToNow(new Date(preview.takenAt), { addSuffix: true })}</>}
        url={preview?.url ?? ""}
        kind="video"
        downloadName={preview ? `${preview.id}.webm` : undefined}
      />
    </div>
  );
}
