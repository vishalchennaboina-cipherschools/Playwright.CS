import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X } from "lucide-react";
import { absoluteAssetUrl } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  subtitle?: ReactNode;
  url: string;
  kind: "image" | "video" | "iframe";
  downloadName?: string;
}

export function MediaPreview({ open, onOpenChange, title, subtitle, url, kind, downloadName }: Props) {
  const src = absoluteAssetUrl(url);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-border bg-card p-0">
        <DialogHeader className="flex flex-row items-start justify-between gap-3 border-b border-border p-4">
          <div className="min-w-0">
            <DialogTitle className="truncate text-sm">{title}</DialogTitle>
            {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {src && (
              <>
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <a href={src} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open</a>
                </Button>
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <a href={src} download={downloadName}><Download className="h-3.5 w-3.5" /> Download</a>
                </Button>
              </>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-auto bg-[oklch(0.11_0.015_250)]">
          {!src ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No media URL provided by backend.</div>
          ) : kind === "image" ? (
            <ImageViewer src={src} alt={title} />
          ) : kind === "video" ? (
            <video src={src} controls autoPlay className="mx-auto max-h-[75vh] w-full bg-black" />
          ) : (
            <iframe src={src} title={title} className="h-[75vh] w-full border-0 bg-white" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState(1);
  useEffect(() => { setZoom(1); }, [src]);
  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border bg-background/80 p-1 backdrop-blur">
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}>−</Button>
        <span className="w-12 text-center font-mono text-xs">{Math.round(zoom * 100)}%</span>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}>+</Button>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setZoom(1)}>1:1</Button>
      </div>
      <div className="flex min-h-[300px] items-center justify-center overflow-auto p-6">
        <img
          src={src}
          alt={alt}
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          className="max-w-full transition-transform"
        />
      </div>
    </div>
  );
}
