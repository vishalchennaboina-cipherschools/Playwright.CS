import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Play, Square, Rocket, Globe, Chrome, Cpu, Layers, FileCode, Terminal, CheckCircle2, XCircle, Circle, Download, Loader2 } from "lucide-react";
import { PageHeader, StatusPill, formatDuration } from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api, type SpecTree } from "@/lib/api";
import { useExecution, type RunConfig } from "@/lib/execution-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/run")({
  head: () => ({
    meta: [
      { title: "Run Tests · Playwright Automation" },
      { name: "description", content: "Launch Playwright executions with fine-grained control over environment, browser, workers and suites." },
    ],
  }),
  component: RunPage,
});

function RunPage() {
  const { live, isRunning, start, stop } = useExecution();

  // Dynamic data from backend
  const [specTree, setSpecTree] = useState<SpecTree | null>(null);
  const [specsLoading, setSpecsLoading] = useState(true);
  const [envUrls, setEnvUrls] = useState<Record<string, string>>({});

  // Form state
  const [suite, setSuite] = useState<string>("");
  const [environment, setEnvironment] = useState<string>("");
  const [browser, setBrowser] = useState<"Chrome" | "Firefox" | "Edge">("Chrome");
  const [mode, setMode] = useState<"Headless" | "Headed">("Headless");
  const [workers, setWorkers] = useState<string>("4");
  const [specFile, setSpecFile] = useState<string>("all");

  // Fetch specs and settings from backend
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSpecsLoading(true);
      try {
        const [specs, settings] = await Promise.all([
          api.listSpecs(),
          api.getSettings(),
        ]);
        if (cancelled) return;
        setSpecTree(specs);
        setEnvUrls(settings.environments || {});

        // Set defaults from first available values
        if (specs.folders.length > 0 && !suite) {
          setSuite(specs.folders[0].name);
        }
        const envNames = Object.keys(settings.environments || {});
        if (envNames.length > 0 && !environment) {
          setEnvironment(envNames[0]);
        }
      } catch (e) {
        console.error("Failed to load specs/settings:", e);
        toast.error("Failed to load configuration", {
          description: e instanceof Error ? e.message : "Check backend connection",
        });
      } finally {
        if (!cancelled) setSpecsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const files = useMemo(() => {
    if (!specTree) return [];
    const folder = specTree.folders.find((f) => f.name === suite);
    return folder?.files ?? [];
  }, [specTree, suite]);

  const elapsed = useElapsed(live?.startedAt ?? null, isRunning);

  const onRun = async () => {
    const cfg: RunConfig = {
      suite, environment, browser, mode, workers: Number(workers),
      specFile: specFile === "all" ? undefined : specFile,
    };
    try {
      await start(cfg);
      toast.success("Automation started", { description: `${suite} · ${browser} · ${environment}` });
    } catch (e) {
      toast.error("Failed to start execution", {
        description: e instanceof Error ? e.message : "Check backend URL in Settings",
      });
    }
  };

  const onStop = async () => { await stop(); toast.warning("Execution stopped"); };

  const envNames = Object.keys(envUrls);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Run Tests" description="Configure and dispatch a Playwright execution against your test environments." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Config panel */}
        <div className="surface-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Execution configuration</h2>
          </div>

          {specsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading configuration…</span>
            </div>
          ) : (
            <div className="space-y-5">
              <Field icon={<Globe className="h-3.5 w-3.5" />} label="Environment" hint={envUrls[environment] || ""}>
                <Select value={environment} onValueChange={setEnvironment} disabled={isRunning || envNames.length === 0}>
                  <SelectTrigger><SelectValue placeholder="Select environment" /></SelectTrigger>
                  <SelectContent>
                    {envNames.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field icon={<Chrome className="h-3.5 w-3.5" />} label="Browser">
                <Select value={browser} onValueChange={(v) => setBrowser(v as typeof browser)} disabled={isRunning}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chrome">Chrome</SelectItem>
                    <SelectItem value="Firefox">Firefox</SelectItem>
                    <SelectItem value="Edge">Edge</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Execution mode">
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="grid grid-cols-2 gap-2" disabled={isRunning}>
                  {(["Headless", "Headed"] as const).map((m) => (
                    <Label key={m} htmlFor={m} className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm transition",
                      mode === m && "border-primary bg-primary/10 text-primary"
                    )}>
                      <RadioGroupItem id={m} value={m} className="sr-only" />{m}
                    </Label>
                  ))}
                </RadioGroup>
              </Field>

              <Field icon={<Cpu className="h-3.5 w-3.5" />} label="Workers">
                <Select value={workers} onValueChange={setWorkers} disabled={isRunning}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1", "2", "4", "8"].map((n) => <SelectItem key={n} value={n}>{n} parallel worker{n !== "1" && "s"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field icon={<Layers className="h-3.5 w-3.5" />} label="Test folder">
                <Select value={suite} onValueChange={(v) => { setSuite(v); setSpecFile("all"); }} disabled={isRunning || !specTree?.folders.length}>
                  <SelectTrigger><SelectValue placeholder={specTree?.folders.length ? "Select folder" : "No specs found"} /></SelectTrigger>
                  <SelectContent>
                    {specTree?.folders.map((f) => (
                      <SelectItem key={f.name} value={f.name}>
                        {f.name} <span className="ml-1 text-muted-foreground">({f.files.length} file{f.files.length !== 1 ? "s" : ""})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field icon={<FileCode className="h-3.5 w-3.5" />} label="Spec file" hint="Optional — narrow to one file">
                <Select value={specFile} onValueChange={setSpecFile} disabled={isRunning}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All files in folder</SelectItem>
                    {files.map((f) => <SelectItem key={f.relativePath} value={f.relativePath}><span className="font-mono text-xs">{f.name}</span></SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <div className="border-t border-border pt-4">
                {!isRunning ? (
                  <Button
                    onClick={onRun} size="lg"
                    disabled={!suite || !environment}
                    className="group relative w-full gap-2 overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:opacity-95"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Play className="h-4 w-4" /> Run automation
                  </Button>
                ) : (
                  <Button onClick={onStop} size="lg" variant="destructive" className="w-full gap-2">
                    <Square className="h-4 w-4" /> Stop execution
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live panel */}
        <div className="space-y-4">
          {live ? (
            <>
              <div className="surface-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <StatusPill status={live.status} />
                    <span className="font-mono text-sm text-foreground">{live.id}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{live.suite}</Badge>
                  </div>
                  <div className="font-mono text-sm text-muted-foreground">{formatDuration(elapsed)}</div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Overall progress</span>
                    <span className="font-mono text-foreground">{live.progress}%</span>
                  </div>
                  <Progress value={live.progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <MiniStat icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="success" label="Passed" value={live.passed} />
                  <MiniStat icon={<XCircle className="h-3.5 w-3.5" />} tone="danger" label="Failed" value={live.failed} />
                  <MiniStat icon={<Circle className="h-3.5 w-3.5" />} tone="muted" label="Skipped" value={live.skipped} />
                </div>

                <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs">
                  <KV k="Current file" v={<span className="font-mono">{live.currentFile}</span>} />
                  <KV k="Current test" v={live.currentTest} />
                  <KV k="Current step" v={live.currentStep} />
                </div>
              </div>

              <LiveConsole />
            </>
          ) : (
            <div className="surface-card flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Ready to launch</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Configure the environment, browser and test folder on the left, then click <span className="text-primary">Run automation</span> to dispatch a Playwright execution.
              </p>
              <div className="mt-4 flex gap-2">
                <Link to="/history" className="text-xs text-primary hover:underline">Browse history</Link>
                <span className="text-xs text-muted-foreground">·</span>
                <Link to="/reports" className="text-xs text-primary hover:underline">Latest reports</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, hint, children }: { label: string; icon?: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {icon}{label}
        </Label>
        {hint && <span className="font-mono text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function MiniStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "success" | "danger" | "muted" }) {
  const tones = {
    success: "text-success border-success/30 bg-success/10",
    danger: "text-destructive border-destructive/30 bg-destructive/10",
    muted: "text-muted-foreground border-border bg-secondary/40",
  };
  return (
    <div className={cn("rounded-md border p-2.5", tones[tone])}>
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider opacity-80">
        {icon}{label}
      </div>
      <div className="mt-1 text-xl font-semibold font-mono">{value}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="min-w-0 truncate text-right text-foreground">{v}</span>
    </div>
  );
}

function useElapsed(startedAt: number | null, running: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [running]);
  if (!startedAt) return 0;
  return Math.max(0, Math.round((now - startedAt) / 1000));
}

function LiveConsole() {
  const { live } = useExecution();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [live?.logs.length]);

  const downloadLogs = () => {
    if (!live) return;
    const blob = new Blob([live.logs.map((l) => `[${new Date(l.ts).toISOString()}] ${l.text}`).join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${live.id}.log`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!live) return null;
  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          <span>Live console</span>
          <span className="ml-2 flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-0.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", live.status === "running" ? "bg-warning animate-pulse-dot" : "bg-muted-foreground")} />
            <span className="font-mono">{live.logs.length} lines</span>
          </span>
        </div>
        <button onClick={downloadLogs} className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
          <Download className="h-3 w-3" /> Download
        </button>
      </div>
      <div className="max-h-[400px] overflow-auto bg-[oklch(0.11_0.015_250)] px-4 py-3 font-mono text-[12.5px] leading-relaxed">
        {live.logs.map((l, i) => (
          <div key={i} className={cn("whitespace-pre-wrap",
            l.level === "pass" && "text-success",
            l.level === "fail" && "text-destructive",
            l.level === "warn" && "text-warning",
            l.level === "info" && "text-muted-foreground",
          )}>
            <span className="mr-3 text-muted-foreground/40">{new Date(l.ts).toISOString().slice(11, 19)}</span>
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
