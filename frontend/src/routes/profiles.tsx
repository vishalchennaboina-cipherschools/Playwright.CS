import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, BookMarked, Loader2, Chrome, Cpu, Globe,
  Layers, FileCode, User, Info, Check, X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api, type ExecutionProfile, type CreateProfilePayload } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [
      { title: "Execution Profiles · Playwright Automation" },
      { name: "description", content: "Create and manage reusable execution profiles for your Playwright automation platform." },
    ],
  }),
  component: ProfilesPage,
});

const EMPTY_FORM: CreateProfilePayload = {
  name: "",
  email: "",
  defaultEnvironment: "",
  defaultBrowser: "Chrome",
  defaultWorkers: 4,
  defaultMode: "Headless",
  defaultFolder: "",
  defaultSpec: "",
  description: "",
};

function ProfilesPage() {
  const [profiles, setProfiles] = useState<ExecutionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProfilePayload>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string>("");

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const list = await api.listProfiles();
      setProfiles(list);
    } catch (e) {
      toast.error("Failed to load profiles", { description: e instanceof Error ? e.message : "Check backend connection" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchProfiles(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (p: ExecutionProfile) => {
    setForm({
      name: p.name,
      email: p.email,
      defaultEnvironment: p.defaultEnvironment,
      defaultBrowser: p.defaultBrowser,
      defaultWorkers: p.defaultWorkers,
      defaultMode: p.defaultMode,
      defaultFolder: p.defaultFolder,
      defaultSpec: p.defaultSpec,
      description: p.description,
    });
    setEditingId(p._id);
    setFormError("");
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormError(""); };

  const handleSave = async () => {
    setFormError("");
    if (!form.name.trim()) { setFormError("Profile name is required."); return; }

    setSaving(true);
    try {
      if (editingId) {
        await api.updateProfile(editingId, form);
        toast.success("Profile updated");
      } else {
        await api.createProfile(form);
        toast.success("Profile created");
      }
      cancelForm();
      await fetchProfiles();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setFormError(msg.includes("409") || msg.includes("already") ? `A profile named "${form.name}" already exists.` : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProfile(id);
      toast.success("Profile deleted");
      setDeletingId(null);
      setProfiles((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      toast.error("Failed to delete profile", { description: e instanceof Error ? e.message : "Unknown error" });
    }
  };

  const field = (key: keyof CreateProfilePayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Execution Profiles"
        description="Reusable configuration templates to speed up test execution. Passwords are never stored."
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""} configured
        </p>
        <Button onClick={openCreate} className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <Plus className="h-4 w-4" /> New Profile
        </Button>
      </div>

      {/* Profile Form */}
      {showForm && (
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookMarked className="h-4 w-4 text-primary" />
              {editingId ? "Edit Profile" : "New Profile"}
            </h2>
            <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Profile Name *" icon={<BookMarked className="h-3 w-3" />}>
              <Input
                id="profile-name"
                placeholder="QA Smoke – Chrome"
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
              />
            </FormField>

            <FormField label="Default Email" icon={<User className="h-3 w-3" />} hint="No password stored">
              <Input
                id="profile-email"
                type="email"
                placeholder="tester@example.com"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
              />
            </FormField>

            <FormField label="Default Environment" icon={<Globe className="h-3 w-3" />}>
              <Input
                id="profile-environment"
                placeholder="QA"
                value={form.defaultEnvironment}
                onChange={(e) => field("defaultEnvironment", e.target.value)}
              />
            </FormField>

            <FormField label="Default Browser" icon={<Chrome className="h-3 w-3" />}>
              <Select value={form.defaultBrowser} onValueChange={(v) => field("defaultBrowser", v)}>
                <SelectTrigger id="profile-browser"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chrome">Chrome</SelectItem>
                  <SelectItem value="Firefox">Firefox</SelectItem>
                  <SelectItem value="Edge">Edge</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Default Workers" icon={<Cpu className="h-3 w-3" />}>
              <Select value={String(form.defaultWorkers)} onValueChange={(v) => field("defaultWorkers", Number(v))}>
                <SelectTrigger id="profile-workers"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "4", "8"].map((n) => <SelectItem key={n} value={n}>{n} worker{n !== "1" ? "s" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Default Mode">
              <Select value={form.defaultMode} onValueChange={(v) => field("defaultMode", v)}>
                <SelectTrigger id="profile-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Headless">Headless</SelectItem>
                  <SelectItem value="Headed">Headed</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Default Folder" icon={<Layers className="h-3 w-3" />}>
              <Input
                id="profile-folder"
                placeholder="cipherschools"
                value={form.defaultFolder}
                onChange={(e) => field("defaultFolder", e.target.value)}
              />
            </FormField>

            <FormField label="Default Spec" icon={<FileCode className="h-3 w-3" />} hint="Leave blank for all">
              <Input
                id="profile-spec"
                placeholder="tests/auth/login.spec.js"
                value={form.defaultSpec}
                onChange={(e) => field("defaultSpec", e.target.value)}
                className="font-mono text-xs"
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Description" icon={<Info className="h-3 w-3" />}>
                <Input
                  id="profile-description"
                  placeholder="Brief description of this profile's purpose"
                  value={form.description}
                  onChange={(e) => field("description", e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {formError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {formError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={cancelForm} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? "Save changes" : "Create profile"}
            </Button>
          </div>
        </div>
      )}

      {/* Profile List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading profiles…</span>
        </div>
      ) : profiles.length === 0 ? (
        <div className="surface-card flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <BookMarked className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No profiles yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a profile to save your most common run configurations and fill them in automatically.
          </p>
          <Button onClick={openCreate} className="mt-2 gap-2">
            <Plus className="h-4 w-4" /> Create first profile
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <ProfileCard
              key={p._id}
              profile={p}
              onEdit={() => openEdit(p)}
              onDelete={() => setDeletingId(p._id)}
              confirmingDelete={deletingId === p._id}
              onConfirmDelete={() => handleDelete(p._id)}
              onCancelDelete={() => setDeletingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileCard({
  profile, onEdit, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete,
}: {
  profile: ExecutionProfile;
  onEdit: () => void;
  onDelete: () => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  return (
    <div className="surface-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">{profile.name}</h3>
          {profile.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{profile.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            title="Edit profile"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Delete profile"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {profile.defaultEnvironment && (
          <Badge variant="outline" className="text-[10px] gap-1"><Globe className="h-2.5 w-2.5" />{profile.defaultEnvironment}</Badge>
        )}
        <Badge variant="outline" className="text-[10px] gap-1"><Chrome className="h-2.5 w-2.5" />{profile.defaultBrowser}</Badge>
        <Badge variant="outline" className="text-[10px] gap-1"><Cpu className="h-2.5 w-2.5" />{profile.defaultWorkers}w</Badge>
        {profile.defaultFolder && (
          <Badge variant="outline" className="text-[10px] gap-1"><Layers className="h-2.5 w-2.5" />{profile.defaultFolder}</Badge>
        )}
        {profile.email && (
          <Badge variant="outline" className="text-[10px] gap-1 font-mono"><User className="h-2.5 w-2.5" />{profile.email}</Badge>
        )}
      </div>

      {confirmingDelete && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 space-y-2">
          <p className="text-xs text-destructive">Delete this profile? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={onConfirmDelete} className="h-7 text-xs gap-1">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelDelete} className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      )}

      <p className={cn("text-[10px] text-muted-foreground/60")}>
        Created {new Date(profile.createdAt).toLocaleDateString()}
        {profile.updatedAt !== profile.createdAt && ` · Updated ${new Date(profile.updatedAt).toLocaleDateString()}`}
      </p>
    </div>
  );
}

function FormField({ label, icon, hint, children }: { label: string; icon?: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {icon}{label}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
