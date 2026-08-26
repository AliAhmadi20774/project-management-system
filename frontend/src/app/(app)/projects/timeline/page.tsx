"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { IconCalendarDue, IconTimeline } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ProjectStatus = "On Track" | "At Risk" | "Delayed" | "Completed";

type TimelineProject = {
  id: number;
  name: string;
  code: string;
  category: string;
  description: string;
  status: ProjectStatus;
  start: string;
  due: string;
  progress: number;
  canEdit: boolean;
};

const STATUS_FROM_API: Record<string, ProjectStatus> = {
  planning: "On Track",
  active: "On Track",
  on_hold: "At Risk",
  completed: "Completed",
};

const STATUS_TO_API: Record<ProjectStatus, "planning" | "active" | "on_hold" | "completed"> = {
  "On Track": "active",
  "At Risk": "on_hold",
  Delayed: "on_hold",
  Completed: "completed",
};

const STATUS_DOT: Record<ProjectStatus, string> = {
  "On Track": "bg-sky-500",
  "At Risk": "bg-amber-500",
  Delayed: "bg-rose-500",
  Completed: "bg-emerald-500",
};

function dateMs(value: string) {
  return value ? Date.parse(`${value.slice(0, 10)}T00:00:00Z`) : Number.NaN;
}

function formatDate(value: string) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function toTimelineProject(item: {
  id: number; name: string; code: string; category: string; description: string; status: string;
  start_date: string | null; end_date: string | null; progress: number; can_manage_members: boolean;
}): TimelineProject {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    category: item.category || "General",
    description: item.description || "",
    status: STATUS_FROM_API[item.status] ?? "On Track",
    start: item.start_date || "",
    due: item.end_date || "",
    progress: item.progress ?? 0,
    canEdit: Boolean(item.can_manage_members),
  };
}

function ProjectEditDialog({ project, onClose, onSaved }: {
  project: TimelineProject | null;
  onClose: () => void;
  onSaved: (project: TimelineProject) => void;
}) {
  const [form, setForm] = useState<TimelineProject | null>(project);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(project), [project]);
  if (!form) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.name.trim() || !form.code.trim()) return toast.error("Project name and code are required.");
    if (form.start && form.due && form.due < form.start) return toast.error("Due date must be on or after the start date.");
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(), code: form.code.trim().toUpperCase(), category: form.category,
          description: form.description, status: STATUS_TO_API[form.status],
          start_date: form.start || null, end_date: form.due || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Could not update project.");
      onSaved(toTimelineProject(data));
      toast.success("Project updated");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(project)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle>Edit project</DialogTitle><DialogDescription>Project progress is calculated automatically from its tasks.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
              <div className="grid gap-2"><Label>Code</Label><Input value={form.code} maxLength={12} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Category</Label><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as ProjectStatus })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(STATUS_DOT).map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} rows={3} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Start date</Label><Input type="date" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} /></div>
              <div className="grid gap-2"><Label>Due date</Label><Input type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsTimelinePage() {
  const [projects, setProjects] = useState<TimelineProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TimelineProject | null>(null);

  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not load projects.");
        return (Array.isArray(data) ? data : data.results ?? []).map(toTimelineProject);
      })
      .then(setProjects)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load projects."))
      .finally(() => setLoading(false));
  }, []);

  const datedProjects = useMemo(() => projects.filter((project) => Number.isFinite(dateMs(project.start)) && Number.isFinite(dateMs(project.due))), [projects]);
  const range = useMemo(() => {
    if (!datedProjects.length) return null;
    const starts = datedProjects.map((project) => dateMs(project.start));
    const ends = datedProjects.map((project) => dateMs(project.due));
    const day = 86_400_000;
    const start = Math.min(...starts) - day * 7;
    const end = Math.max(...ends) + day * 7;
    return { start, end: Math.max(end, start + day * 30) };
  }, [datedProjects]);

  const months = useMemo(() => {
    if (!range) return [] as Array<{ label: string; width: number }>;
    const result: Array<{ label: string; width: number }> = [];
    const cursor = new Date(range.start);
    cursor.setUTCDate(1);
    while (cursor.getTime() < range.end) {
      const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      const visibleStart = Math.max(cursor.getTime(), range.start);
      const visibleEnd = Math.min(next.getTime(), range.end);
      result.push({
        label: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(cursor),
        width: ((visibleEnd - visibleStart) / (range.end - range.start)) * 100,
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return result;
  }, [range]);

  const weekLines = useMemo(() => {
    if (!range) return [] as number[];
    const day = 86_400_000;
    const count = Math.floor((range.end - range.start) / (day * 7));
    return Array.from({ length: count }, (_, index) => ((index + 1) * day * 7 / (range.end - range.start)) * 100);
  }, [range]);

  const today = Date.now();
  const todayPct = range ? ((today - range.start) / (range.end - range.start)) * 100 : -1;

  return (
    <div className="space-y-6">
      <PageHeader title="Project timeline" description="Project schedules and their automatically calculated progress." />
      <Card className="overflow-hidden py-0">
        {loading ? <div className="p-8 text-sm text-muted-foreground">Loading projects…</div>
          : !range ? <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center"><IconTimeline className="size-7 text-muted-foreground" /><p className="font-medium">No dated projects</p><p className="text-sm text-muted-foreground">Add start and due dates to display projects here.</p></div>
          : <div className="overflow-x-auto"><div className="min-w-[860px]">
            <div className="flex border-b bg-muted/40"><div className="w-64 shrink-0 border-r px-4 py-3 text-xs font-medium text-muted-foreground">Project</div><div className="flex flex-1">{months.map((month) => <div key={month.label} className="border-r px-3 py-3 text-xs font-medium last:border-r-0" style={{ width: `${month.width}%` }}>{month.label}</div>)}</div></div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 flex"><div className="w-64 shrink-0" /><div className="relative flex-1">{weekLines.map((left) => <span key={left} className="absolute inset-y-0 w-px bg-border/60" style={{ left: `${left}%` }} />)}{todayPct >= 0 && todayPct <= 100 && <span className="absolute inset-y-0 z-10 w-0.5 bg-primary/60" style={{ left: `${todayPct}%` }} title="Today" />}</div></div>
              {datedProjects.map((project) => {
                const left = ((dateMs(project.start) - range.start) / (range.end - range.start)) * 100;
                const width = Math.max(((dateMs(project.due) - dateMs(project.start)) / (range.end - range.start)) * 100, 2.5);
                return <div key={project.id} className="flex items-center border-b last:border-b-0"><div className="w-64 shrink-0 border-r px-4 py-2.5"><Link href={`/projects/PRJ-${project.id + 100}`} className="block truncate text-sm font-medium hover:underline">{project.name}</Link><div className="mt-0.5 flex items-center gap-2"><p className="flex min-w-0 items-center gap-1.5 truncate text-[11px] text-muted-foreground"><span className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`} />{project.code} · {project.status}</p><Link href={`/projects/PRJ-${project.id + 100}?tab=timeline&from=project-timeline`} className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`Open ${project.name} task timeline`} title="Open task timeline"><IconTimeline className="size-3.5" /></Link></div></div><div className="relative h-12 flex-1"><button type="button" onClick={() => project.canEdit && setEditing(project)} title={project.canEdit ? "Click to edit project" : `${project.name}: ${project.progress}% complete`} className={`absolute top-1/2 h-6 -translate-y-1/2 overflow-hidden rounded-md bg-muted ring-1 ring-border ${project.canEdit ? "cursor-pointer hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" : "cursor-default"}`} style={{ left: `${left}%`, width: `${width}%` }}><span className="block h-full bg-primary/80" style={{ width: `${project.progress}%` }} /></button><span className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[11px] font-medium" style={{ left: `calc(${left}% + 8px)` }}>{width > 8 ? `${project.progress}%` : ""}</span></div></div>;
              })}
            </div>
            <div className="flex items-center gap-5 border-t px-4 py-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-2 w-16 rounded bg-primary/80" />Automatic task progress</span><span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-primary/60" />Today</span><span className="ml-auto">Click a project bar to edit its details</span></div>
          </div></div>}
      </Card>
      {projects.length !== datedProjects.length && !loading && <p className="text-sm text-muted-foreground">{projects.length - datedProjects.length} project(s) without dates are not shown on the timeline.</p>}
      <ProjectEditDialog project={editing} onClose={() => setEditing(null)} onSaved={(updated) => setProjects((current) => current.map((project) => project.id === updated.id ? updated : project))} />
    </div>
  );
}
