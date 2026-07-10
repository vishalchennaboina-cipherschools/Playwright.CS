import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, Activity, TrendingUp, Play, Zap, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatCard, StatusPill, EmptyState, formatDuration } from "@/components/dashboard-ui";
import { useExecution } from "@/lib/execution-store";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Playwright Automation" },
      { name: "description", content: "Overview of Playwright executions, success rate, trends and recent activity." },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { history, historyLoading, historyError } = useExecution();

  const stats = useMemo(() => {
    if (!history.length) return null;
    const total = history.length;
    const passed = history.filter((e) => e.status === "passed").length;
    const failed = history.filter((e) => e.status === "failed").length;
    const aborted = history.filter((e) => e.status === "aborted").length;
    const successRate = Math.round((passed / total) * 100);
    const avgDuration = Math.round(history.reduce((a, b) => a + b.duration, 0) / total);
    return { total, passed, failed, aborted, successRate, avgDuration };
  }, [history]);

  // Build trends from history (group by date, last 14 days)
  const trends = useMemo(() => {
    const now = Date.now();
    const days = 14;
    const buckets: Record<string, { date: string; passed: number; failed: number; total: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(now - (days - 1 - i) * 86400_000);
      const key = d.toISOString().slice(5, 10);
      buckets[key] = { date: key, passed: 0, failed: 0, total: 0 };
    }
    for (const e of history) {
      const key = new Date(e.startedAt).toISOString().slice(5, 10);
      if (buckets[key]) {
        buckets[key].total += 1;
        if (e.status === "passed") buckets[key].passed += 1;
        if (e.status === "failed") buckets[key].failed += 1;
      }
    }
    return Object.values(buckets);
  }, [history]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Passed", value: stats.passed, color: "oklch(0.75 0.17 160)" },
      { name: "Failed", value: stats.failed, color: "oklch(0.65 0.22 25)" },
      { name: "Aborted", value: stats.aborted, color: "oklch(0.68 0.015 250)" },
    ];
  }, [stats]);

  if (historyLoading && history.length === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Automation Overview"
          description="Loading execution data from backend…"
        />
        <div className="surface-card flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (historyError && history.length === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Automation Overview"
          description="Aggregate view of Playwright executions across environments and suites."
          actions={
            <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:opacity-90">
              <Link to="/run"><Play className="h-4 w-4" /> Run automation</Link>
            </Button>
          }
        />
        <EmptyState
          title="Cannot reach backend"
          description={`${historyError} — check the API base URL in Settings.`}
          icon={<Activity className="h-6 w-6" />}
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Automation Overview"
          description="No executions yet — run your first automation to see data here."
          actions={
            <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:opacity-90">
              <Link to="/run"><Play className="h-4 w-4" /> Run automation</Link>
            </Button>
          }
        />
        <EmptyState
          title="No executions recorded"
          description="Configure your backend and launch your first Playwright test run from the Run page."
          icon={<Activity className="h-6 w-6" />}
        />
      </div>
    );
  }

  const latest = history[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Automation Overview"
        description="Aggregate view of Playwright executions across environments and suites."
        actions={
          <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:opacity-90">
            <Link to="/run"><Play className="h-4 w-4" /> Run automation</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total executions" value={stats.total} hint="last 14 days" icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Passed" value={stats.passed} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Failed" value={stats.failed} tone="danger" icon={<XCircle className="h-5 w-5" />} />
        <StatCard label="Success rate" value={`${stats.successRate}%`} tone="info" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Avg duration" value={formatDuration(stats.avgDuration)} tone="warning" icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Execution trends</div>
              <div className="text-xs text-muted-foreground">Daily passed vs failed runs · last 14 days</div>
            </div>
            <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs text-muted-foreground">14D</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.018 250)" />
                <XAxis dataKey="date" stroke="oklch(0.68 0.015 250)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.015 250)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.018 250)", border: "1px solid oklch(0.28 0.018 250)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="passed" stroke="oklch(0.75 0.17 160)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="failed" stroke="oklch(0.65 0.22 25)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-foreground">Pass vs fail</div>
            <div className="text-xs text-muted-foreground">Distribution across recent runs</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="oklch(0.16 0.015 250)" strokeWidth={2} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "oklch(0.68 0.015 250)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Daily runs</div>
            <span className="text-xs text-muted-foreground">Total executions per day</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.018 250)" />
                <XAxis dataKey="date" stroke="oklch(0.68 0.015 250)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.015 250)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.018 250)", border: "1px solid oklch(0.28 0.018 250)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" fill="oklch(0.72 0.15 220)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Latest execution</div>
            <StatusPill status={latest.status} />
          </div>
          <div className="space-y-3 text-sm">
            <Row k="ID" v={<span className="font-mono text-xs">{latest.id}</span>} />
            <Row k="Suite" v={latest.suite} />
            <Row k="Environment" v={latest.environment} />
            <Row k="Browser" v={`${latest.browser} · ${latest.mode}`} />
            <Row k="Duration" v={formatDuration(latest.duration)} />
            <Row k="Started" v={formatDistanceToNow(new Date(latest.startedAt), { addSuffix: true })} />
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <Button asChild variant="secondary" className="w-full gap-2">
              <Link to="/history"><Zap className="h-4 w-4" /> View full history</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="surface-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="text-sm font-semibold text-foreground">Recent activity</div>
          <Link to="/history" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="divide-y divide-border">
          {history.slice(0, 6).map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-secondary/30">
              <StatusPill status={e.status} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">{e.suite}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {e.environment} · {e.browser} · {e.workers} workers · by {e.triggeredBy}
                </div>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <div className="font-mono">{e.id}</div>
                <div>{formatDistanceToNow(new Date(e.startedAt), { addSuffix: true })}</div>
              </div>
              <div className="text-right text-xs font-mono text-muted-foreground">{formatDuration(e.duration)}</div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-sm text-foreground">{v}</span>
    </div>
  );
}
