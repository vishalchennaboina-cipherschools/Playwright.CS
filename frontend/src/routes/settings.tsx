import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Server, Bell, Shield, Slack, Mail, Globe, Plus, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DEFAULT_BASE_URL, getApiBaseUrl, getApiToken, setApiBaseUrl, setApiToken, api } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Playwright Automation" },
      { name: "description", content: "Configure backend endpoints, notifications and integrations for the automation dashboard." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [token, setToken] = useState("");

  // Dynamic environments from backend
  const [environments, setEnvironments] = useState<Record<string, string>>({});
  const [envLoading, setEnvLoading] = useState(true);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvUrl, setNewEnvUrl] = useState("");

  useEffect(() => {
    setBaseUrl(getApiBaseUrl());
    setToken(getApiToken());

    // Load settings from backend
    api.getSettings()
      .then((s) => {
        setEnvironments(s.environments || {});
      })
      .catch(() => {
        // Backend unreachable — show defaults
        setEnvironments({ QA: "https://qa.cipherschools.com", Production: "https://www.cipherschools.com" });
      })
      .finally(() => setEnvLoading(false));
  }, []);

  const onSave = async () => {
    setApiBaseUrl(baseUrl.trim() || DEFAULT_BASE_URL);
    setApiToken(token.trim());

    // Save environments to backend
    try {
      await api.updateSettings({ environments });
      toast.success("Settings saved", { description: "Dashboard will now hit the new API URL." });
    } catch (e) {
      // Connection settings are saved locally even if backend call fails
      toast.success("Local settings saved", { description: "Backend settings could not be updated." });
    }
  };

  const addEnvironment = () => {
    const name = newEnvName.trim();
    const url = newEnvUrl.trim();
    if (!name || !url) {
      toast.error("Both name and URL are required");
      return;
    }
    if (environments[name]) {
      toast.error(`Environment "${name}" already exists`);
      return;
    }
    setEnvironments({ ...environments, [name]: url });
    setNewEnvName("");
    setNewEnvUrl("");
  };

  const removeEnvironment = (name: string) => {
    const next = { ...environments };
    delete next[name];
    setEnvironments(next);
  };

  const updateEnvironmentUrl = (name: string, url: string) => {
    setEnvironments({ ...environments, [name]: url });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Settings" description="Configure the dashboard, backend and integrations." />

      <Section icon={<Server className="h-4 w-4" />} title="Backend connection" desc="Point the dashboard at your Node/Express Playwright runner.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="API base URL"><Input placeholder="http://localhost:4000" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></Row>
          <Row label="Auth token (optional)"><Input type="password" placeholder="Bearer …" value={token} onChange={(e) => setToken(e.target.value)} /></Row>
        </div>
      </Section>

      <Section icon={<Globe className="h-4 w-4" />} title="Environments" desc="Configure environment name → URL mappings for test execution.">
        {envLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading environments…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {Object.entries(environments).map(([name, url]) => (
                <div key={name} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
                  <span className="min-w-[100px] text-sm font-medium text-foreground">{name}</span>
                  <Input
                    value={url}
                    onChange={(e) => updateEnvironmentUrl(name, e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="https://…"
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeEnvironment(name)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input
                placeholder="Name (e.g. Staging)"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="w-36 h-8 text-sm"
              />
              <Input
                placeholder="URL (e.g. https://staging.example.com)"
                value={newEnvUrl}
                onChange={(e) => setNewEnvUrl(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={addEnvironment}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </>
        )}
      </Section>

      <Section icon={<Bell className="h-4 w-4" />} title="Notifications" desc="Toast + system notifications for execution events.">
        <Toggle label="Automation started" defaultChecked />
        <Toggle label="Execution completed" defaultChecked />
        <Toggle label="Execution failed" defaultChecked />
        <Toggle label="Report generated" />
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section icon={<Slack className="h-4 w-4" />} title="Slack" desc="Post execution summaries to a channel.">
          <Row label="Webhook URL"><Input placeholder="https://hooks.slack.com/…" /></Row>
          <Toggle label="Send on failure only" defaultChecked />
        </Section>
        <Section icon={<Mail className="h-4 w-4" />} title="Email" desc="Email daily QA reports.">
          <Row label="Recipient"><Input placeholder="qa-team@company.com" /></Row>
          <Toggle label="Daily digest" defaultChecked />
        </Section>
      </div>

      <Section icon={<Shield className="h-4 w-4" />} title="Access" desc="Role-based access is scaffolded for future use.">
        <div className="text-sm text-muted-foreground">
          Auth, role management, and CI/CD hooks slot into the existing folder architecture without restructuring.
        </div>
      </Section>

      <div className="flex justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button onClick={onSave} className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary">
          Save changes
        </Button>
      </div>
    </div>
  );
}

function Section({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary/50 text-primary">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm">
      <span className="text-foreground">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
