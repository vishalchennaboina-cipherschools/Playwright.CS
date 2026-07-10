import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Play, History, FileText, Image as ImageIcon,
  Video, Route as RouteIcon, Terminal, Settings, Zap, Activity,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { useExecution } from "@/lib/execution-store";
import { Badge } from "@/components/ui/badge";

const primary = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Run Tests", url: "/run", icon: Play },
  { title: "Execution History", url: "/history", icon: History },
];
const artifacts = [
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Screenshots", url: "/screenshots", icon: ImageIcon },
  { title: "Videos", url: "/videos", icon: Video },
  { title: "Trace Viewer", url: "/traces", icon: RouteIcon },
  { title: "Logs", url: "/logs", icon: Terminal },
];
const system = [
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items, currentPath }: { label: string; items: typeof primary; currentPath: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = currentPath === item.url;
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary data-[active=true]:font-medium">
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { isRunning, live } = useExecution();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground glow-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">Playwright</span>
            <span className="text-[11px] text-muted-foreground">Automation Console</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Workspace" items={primary} currentPath={currentPath} />
        <NavGroup label="Artifacts" items={artifacts} currentPath={currentPath} />
        <NavGroup label="System" items={system} currentPath={currentPath} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 text-xs group-data-[collapsible=icon]:hidden">
          {isRunning ? (
            <>
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse-dot" />
              <span className="text-muted-foreground">Executing</span>
              <Badge variant="outline" className="ml-auto font-mono text-[10px]">{live?.suite}</Badge>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Runner idle</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">v1.48.2</span>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function Topbar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const label = ({
    "/": "Dashboard", "/run": "Run Tests", "/history": "Execution History",
    "/reports": "Reports", "/screenshots": "Screenshots", "/videos": "Videos",
    "/traces": "Trace Viewer", "/logs": "Logs", "/settings": "Settings",
  } as Record<string, string>)[currentPath] ?? "";
  const { isRunning, live } = useExecution();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-lg">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Console</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {isRunning && live && (
          <div className="flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs">
            <Activity className="h-3.5 w-3.5 text-warning animate-pulse" />
            <span className="font-mono text-warning">{live.id}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-warning">{live.progress}%</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">QA Engineer</span>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            QA
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background bg-grid">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-hidden p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
