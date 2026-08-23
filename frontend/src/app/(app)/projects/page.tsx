"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconPlus,
  IconLayoutGrid,
  IconLayoutList,
  IconCalendarDue,
  IconChecklist,
  IconArrowUpRight,
  IconFolders,
  IconDotsVertical,
  IconExternalLink,
  IconCopy,
  IconTrash,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  projects,
  team,
  type Project,
  type ProjectStatus,
  type StatCard as StatCardType,
  type TeamMember,
} from "@/data";

// Unified neutral / monochrome palette — status is conveyed by a small
// grayscale dot + label, never by hue.
const STATUS_DOT: Record<ProjectStatus, string> = {
  "On Track": "bg-foreground",
  "At Risk": "bg-muted-foreground",
  Delayed: "bg-muted-foreground/50",
  Completed: "bg-primary",
};

const PROJECT_STATUSES: ProjectStatus[] = [
  "On Track",
  "At Risk",
  "Delayed",
  "Completed",
];

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "On Track", label: "On Track" },
  { value: "At Risk", label: "At Risk" },
  { value: "Delayed", label: "Delayed" },
  { value: "Completed", label: "Completed" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function AvatarStack({
  members,
  lead,
  max = 4,
}: {
  members: TeamMember[];
  lead: TeamMember;
  max?: number;
}) {
  // Lead first, then the rest, de-duplicated.
  const people = [lead, ...members.filter((m) => m.id !== lead.id)];
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m, i) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <Avatar className="size-7 ring-2 ring-card">
              <AvatarImage src={m.avatar} alt={m.name} />
              <AvatarFallback className="text-[10px]">
                {initials(m.name)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            {m.name}
            {i === 0 ? " · Lead" : ` · ${m.role}`}
          </TooltipContent>
        </Tooltip>
      ))}
      {extra > 0 && (
        <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
          +{extra}
        </span>
      )}
    </div>
  );
}

function NeutralProgress({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="secondary" className="gap-1.5 font-medium">
      <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </Badge>
  );
}

function ProjectMenu({
  project,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  onDuplicate: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground"
          aria-label={`Actions for ${project.name}`}
          onClick={(e) => {
            // Sits inside the card's <Link>; don't navigate when opening.
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => router.push(`/projects/${project.id}`)}>
          <IconExternalLink className="size-4" /> Open
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDuplicate(project)}>
          <IconCopy className="size-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onDelete(project)}
        >
          <IconTrash className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectCard({
  project,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  onDuplicate: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <span className="absolute inset-x-0 top-0 h-1 bg-muted-foreground/20" />
        <CardContent className="space-y-4 p-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background">
                {project.key.slice(0, 2)}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="truncate font-semibold tracking-tight group-hover:underline">
                  {project.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                    {project.key}
                  </span>
                  <span>{project.category}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <StatusBadge status={project.status} />
              <ProjectMenu
                project={project}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">
                {project.progress}%
              </span>
            </div>
            <NeutralProgress value={project.progress} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconChecklist className="size-4" />
              <span className="tabular-nums">
                {project.taskCounts.done}/{project.taskCounts.total}
              </span>{" "}
              tasks
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendarDue className="size-4" />
              <span className="tabular-nums">{formatDate(project.due)}</span>
            </span>
          </div>
        </CardContent>
        <div className="flex items-center justify-between border-t px-5 py-3">
          <AvatarStack members={project.members} lead={project.lead} />
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Open <IconArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

function ProjectRow({
  project,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  onDuplicate: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background">
          {project.key.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium group-hover:underline">
            {project.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            <span className="font-mono">{project.key}</span> · {project.category}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:w-28">
        <span className={`size-2 rounded-full ${STATUS_DOT[project.status]}`} />
        <span className="text-sm text-muted-foreground">{project.status}</span>
      </div>
      <div className="flex items-center gap-2 sm:w-44">
        <NeutralProgress value={project.progress} />
        <span className="w-9 text-right text-xs font-medium tabular-nums">
          {project.progress}%
        </span>
      </div>
      <div className="hidden text-sm text-muted-foreground tabular-nums sm:block sm:w-20">
        {project.taskCounts.done}/{project.taskCounts.total}
      </div>
      <div className="hidden text-sm text-muted-foreground tabular-nums sm:block sm:w-28">
        {formatDate(project.due)}
      </div>
      <div className="flex items-center justify-end gap-1 sm:w-28">
        <AvatarStack members={project.members} lead={project.lead} max={3} />
        <ProjectMenu
          project={project}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    </Link>
  );
}

const CATEGORIES = [
  "Product",
  "Engineering",
  "Marketing",
  "Data",
  "Security",
  "Design",
];

type NewProjectInput = {
  name: string;
  key: string;
  category: string;
  status: ProjectStatus;
  leadId: string;
  description: string;
};

function AddProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewProjectInput) => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [category, setCategory] = useState("Product");
  const [status, setStatus] = useState<ProjectStatus>("On Track");
  const [leadId, setLeadId] = useState(team[0].id);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setKey("");
      setCategory("Product");
      setStatus("On Track");
      setLeadId(team[0].id);
      setDescription("");
    }
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    const derivedKey =
      key.trim() ||
      name
        .trim()
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 3)
        .toUpperCase() ||
      "PRJ";
    onCreate({
      name: name.trim(),
      key: derivedKey.toUpperCase(),
      category,
      status,
      leadId,
      description:
        description.trim() || "No description yet — add one from settings.",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Spin up a new initiative. You can refine the details later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mobile App Revamp"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-key">Key</Label>
                <Input
                  id="project-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder="MOB"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="project-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="project-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as ProjectStatus)}
                >
                  <SelectTrigger id="project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-lead">Lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger id="project-lead">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {team.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} · {m.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState<Project[]>(projects);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const idRef = useRef(900);

  function createProject(input: NewProjectInput) {
    const lead = team.find((m) => m.id === input.leadId) ?? team[0];
    const now = Date.now();
    const project: Project = {
      id: `PRJ-${idRef.current++}`,
      name: input.name,
      key: input.key,
      description: input.description,
      status: input.status,
      progress: 0,
      color: "",
      category: input.category,
      lead,
      members: [lead],
      start: new Date(now).toISOString().slice(0, 10),
      due: new Date(now + 90 * 86_400_000).toISOString().slice(0, 10),
      budget: 50_000,
      spent: 0,
      taskCounts: { total: 0, done: 0 },
      milestones: [],
    };
    setItems((prev) => [project, ...prev]);
    toast.success("Project created", {
      description: `${project.key} · ${project.name}`,
    });
  }

  function duplicateProject(project: Project) {
    const copy: Project = {
      ...project,
      id: `PRJ-${idRef.current++}`,
      name: `${project.name} (copy)`,
    };
    setItems((prev) => [copy, ...prev]);
    toast.success("Project duplicated", { description: copy.name });
  }

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const p of items) map[p.status] = (map[p.status] ?? 0) + 1;
    return map;
  }, [items]);

  const stats = useMemo<StatCardType[]>(() => {
    const active = items.filter((p) => p.status !== "Completed").length;
    const tasksThisWeek = items.reduce(
      (sum, p) => sum + Math.round(p.taskCounts.done / 6),
      0
    );
    const memberIds = new Set<string>();
    for (const p of items) {
      memberIds.add(p.lead.id);
      for (const m of p.members) memberIds.add(m.id);
    }
    const healthy = items.filter(
      (p) => p.status === "On Track" || p.status === "Completed"
    ).length;
    const onTrack =
      items.length === 0 ? 0 : Math.round((healthy / items.length) * 100);
    return [
      {
        label: "Active projects",
        value: String(active),
        change: 12.5,
        trend: "up",
        hint: "2 launching this quarter",
      },
      {
        label: "Tasks completed",
        value: String(tasksThisWeek),
        change: 8.4,
        trend: "up",
        hint: "this week",
      },
      {
        label: "Team members",
        value: String(memberIds.size),
        change: 4.2,
        trend: "up",
        hint: "across all projects",
      },
      {
        label: "On track",
        value: `${onTrack}%`,
        change: 3.1,
        trend: "up",
        hint: "of all projects",
      },
    ];
  }, [items]);

  const filtered = useMemo(
    () =>
      filter === "all" ? items : items.filter((p) => p.status === filter),
    [filter, items]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Track delivery across every initiative your teams are shipping."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast("Templates", {
              description: "Browse starter templates for a new project.",
            })
          }
        >
          <IconFolders className="size-4" /> Templates
        </Button>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <IconPlus className="size-4" /> New project
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={setFilter} className="min-w-0">
          <div className="overflow-x-auto">
            <TabsList className="h-9">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className="gap-1.5">
                  {f.label}
                  <span className="rounded bg-foreground/10 px-1.5 text-[10px] font-medium tabular-nums">
                    {counts[f.value] ?? 0}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <IconLayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <IconLayoutList className="size-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <IconFolders className="size-8 opacity-50" />
            <p className="text-sm">No projects in this view.</p>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDuplicate={duplicateProject}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden py-0">
          <div className="hidden items-center gap-3 border-b bg-muted/40 px-5 py-2.5 text-xs font-medium text-muted-foreground sm:flex">
            <span className="flex-1">Project</span>
            <span className="w-28">Status</span>
            <span className="w-44">Progress</span>
            <span className="w-20">Tasks</span>
            <span className="w-28">Due</span>
            <span className="w-28 text-right">Team</span>
          </div>
          <div className="divide-y">
            {filtered.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                onDuplicate={duplicateProject}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        </Card>
      )}

      <AddProjectDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={createProject}
      />

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null);
        }}
        name={pendingDelete ? pendingDelete.name : "project"}
        description={
          pendingDelete
            ? `This will permanently remove "${pendingDelete.name}" and its board. This action cannot be undone.`
            : undefined
        }
        onConfirm={() => {
          if (pendingDelete) {
            setItems((prev) => prev.filter((p) => p.id !== pendingDelete.id));
          }
        }}
      />
    </div>
  );
}
