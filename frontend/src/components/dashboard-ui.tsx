import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label, value, hint, icon, tone = "default",
}: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: "default" | "success" | "danger" | "warning" | "info" }) {
  const toneMap: Record<string, string> = {
    default: "from-secondary/40 to-transparent text-foreground",
    success: "from-success/15 to-transparent text-success",
    danger: "from-destructive/15 to-transparent text-destructive",
    warning: "from-warning/15 to-transparent text-warning",
    info: "from-info/15 to-transparent text-info",
  };
  return (
    <div className="surface-card relative overflow-hidden p-5">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", toneMap[tone])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className={cn("grid h-10 w-10 place-items-center rounded-lg bg-background/60 border border-border", toneMap[tone].split(" ").at(-1))}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    passed: "bg-success/15 text-success border-success/30",
    failed: "bg-destructive/15 text-destructive border-destructive/30",
    running: "bg-warning/15 text-warning border-warning/30",
    aborted: "bg-muted text-muted-foreground border-border",
    skipped: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", map[status] ?? map.skipped)}>
      {status === "running" && <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse-dot" />}
      {status}
    </span>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <div className="surface-card flex flex-col items-center justify-center gap-3 p-12 text-center">
      {icon && <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">{icon}</div>}
      <div className="text-base font-medium text-foreground">{title}</div>
      {description && <div className="max-w-sm text-sm text-muted-foreground">{description}</div>}
    </div>
  );
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
