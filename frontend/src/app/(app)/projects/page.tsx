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
  IconArrowsSort,
  IconTimeline,
  IconClock,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteDialog } from "@/components/delete-dialog";
import {
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

const API_PROJECT_STATUS: Record<string, ProjectStatus> = {
  planning: "On Track",
  active: "On Track",
  on_hold: "At Risk",
  completed: "Completed",
};

const PROJECT_STATUS_API: Record<
  ProjectStatus,
  "planning" | "active" | "on_hold" | "completed"
> = {
  "On Track": "active",
  "At Risk": "on_hold",
  Delayed: "on_hold",
  Completed: "completed",
};

type ApiMembership = {
  user: number;
  user_name: string;
  user_email: string;
  role: string;
  user_avatar_url: string;
};

function toProjectMember(membership: ApiMembership): TeamMember {
  const knownMember = team.find(
    (member) => member.name === membership.user_name,
  );
  return {
    id: String(membership.user),
    name: membership.user_name,
    email: membership.user_email,
    role: membership.role,
    department: knownMember?.department ?? "Project",
    avatar:
      membership.user_avatar_url ??
      knownMember?.avatar ??
      "/avatars/default-young-man.png",
    status: knownMember?.status ?? "Active",
    location: knownMember?.location ?? "",
  };
}

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "starred", label: "Starred" },
  { value: "On Track", label: "On Track" },
  { value: "At Risk", label: "At Risk" },
  { value: "Delayed", label: "Delayed" },
  { value: "Completed", label: "Completed" },
];

function formatDate(iso: string) {
  if (!iso) return "No due date";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

function formatLoggedTime(totalMinutes?: number) {
  const minutes = Math.max(0, Math.round(totalMinutes ?? 0));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
  const router = useRouter();
  const [showAllMembers, setShowAllMembers] = useState(false);
  // Lead first, then the rest, de-duplicated.
  const people = [lead, ...members.filter((m) => m.id !== lead.id)];
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <Dialog open={showAllMembers} onOpenChange={setShowAllMembers}>
      <div className="flex items-center -space-x-2">
        {shown.map((m, i) => (
          <Tooltip key={m.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="relative z-10 rounded-full transition-transform duration-150 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  router.push(`/profile?user=${m.id}`);
                }}
                aria-label={`Open ${m.name}'s profile`}
              >
                <Avatar className="size-7 ring-2 ring-card">
                  <AvatarImage src={m.avatar} alt={m.name} />
                  <AvatarFallback className="text-[10px]">
                    {initials(m.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {m.name}
              {i === 0 ? " · Lead" : ` · ${m.role}`}
            </TooltipContent>
          </Tooltip>
        ))}
        {extra > 0 && (
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground ring-2 ring-card transition-all duration-150 hover:-translate-y-1 hover:bg-accent focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Show ${extra} more project members`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setShowAllMembers(true);
            }}
          >
            +{extra}
          </button>
        )}
      </div>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project members</DialogTitle>
          <DialogDescription>
            Choose a member to open their profile.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 py-2 sm:grid-cols-3">
          {people.map((member) => (
            <button
              key={member.id}
              type="button"
              className="flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition-colors hover:bg-muted"
              onClick={() => {
                setShowAllMembers(false);
                router.push(`/profile?user=${member.id}`);
              }}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-[10px]">
                  {initials(member.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {member.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {member.role}
                </span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
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
        <DropdownMenuItem
          onSelect={() => router.push(`/projects/${project.id}`)}
        >
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
    <Card className="group relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link
        href={`/projects/${project.id}`}
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-0"
      />
      <div className="relative z-10 pointer-events-none">
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
            <div className="pointer-events-auto flex items-center gap-1">
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconChecklist className="size-4" />
              <span className="tabular-nums">
                {project.taskCounts.done}/{project.taskCounts.total}
              </span>{" "}
              tasks
            </span>
            {project.totalTimeMinutes ? (
              <span className="flex items-center gap-1.5 tabular-nums">
                <IconClock className="size-4" />
                {formatLoggedTime(project.totalTimeMinutes)}
              </span>
            ) : null}
            <span className="ml-auto flex items-center gap-1.5">
              <IconCalendarDue className="size-4" />
              <span className="tabular-nums">{formatDate(project.due)}</span>
            </span>
          </div>
        </CardContent>
        <div className="flex items-center justify-between border-t px-5 py-3">
          <div className="pointer-events-auto">
            <AvatarStack members={project.members} lead={project.lead} />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Open <IconArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Card>
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
    <div className="group relative flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center">
      <Link
        href={`/projects/${project.id}`}
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-0"
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background">
          {project.key.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium group-hover:underline">
            {project.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            <span className="font-mono">{project.key}</span> ·{" "}
            {project.category}
          </p>
        </div>
      </div>
      <div className="pointer-events-none relative z-10 flex items-center gap-2 sm:w-28">
        <span className={`size-2 rounded-full ${STATUS_DOT[project.status]}`} />
        <span className="text-sm text-muted-foreground">{project.status}</span>
      </div>
      <div className="pointer-events-none relative z-10 flex items-center gap-2 sm:w-44">
        <NeutralProgress value={project.progress} />
        <span className="w-9 text-right text-xs font-medium tabular-nums">
          {project.progress}%
        </span>
      </div>
      <div className="pointer-events-none relative z-10 hidden text-sm text-muted-foreground tabular-nums sm:block sm:w-20">
        {project.taskCounts.done}/{project.taskCounts.total}
      </div>
      <div className="pointer-events-none relative z-10 hidden items-center gap-1 text-sm text-muted-foreground tabular-nums lg:flex lg:w-20">
        <IconClock className="size-3.5" />
        {formatLoggedTime(project.totalTimeMinutes)}
      </div>
      <div className="pointer-events-none relative z-10 hidden text-sm text-muted-foreground tabular-nums sm:block sm:w-28">
        {formatDate(project.due)}
      </div>
      <div className="relative z-10 flex items-center justify-end gap-1 sm:w-28">
        <AvatarStack members={project.members} lead={project.lead} max={3} />
        <ProjectMenu
          project={project}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    </div>
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
  lead: TeamMember;
  description: string;
};

type ApiUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  department_detail?: { name: string } | null;
};

function toLeadCandidate(user: ApiUser): TeamMember {
  const name = `${user.first_name} ${user.last_name}`.trim() || user.username;
  return {
    id: String(user.id),
    name,
    email: user.email || "",
    role: "",
    department: user.department_detail?.name ?? "",
    avatar: user.avatar_url ?? "/avatars/default-young-man.png",
    status: "Active",
    location: "",
  };
}

function AddProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewProjectInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [category, setCategory] = useState("Product");
  const [status, setStatus] = useState<ProjectStatus>("On Track");
  const [leadId, setLeadId] = useState("");
  const [leadCandidates, setLeadCandidates] = useState<TeamMember[]>([]);
  const [leadPickerOpen, setLeadPickerOpen] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setKey("");
      setCategory("Product");
      setStatus("On Track");
      setLeadId("");
      setDescription("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingLeads(true);
    fetch("/api/users", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.detail || "Could not load users.");
        return (Array.isArray(data) ? data : (data.results ?? [])) as ApiUser[];
      })
      .then((users) => {
        if (!cancelled) setLeadCandidates(users.map(toLeadCandidate));
      })
      .catch((error) => {
        if (!cancelled)
          toast.error(
            error instanceof Error ? error.message : "Could not load users.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingLeads(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!key.trim()) {
      toast.error("Project code is required");
      return;
    }
    const lead = leadCandidates.find((candidate) => candidate.id === leadId);
    if (!lead) {
      toast.error("Select a project lead");
      return;
    }
    await onCreate({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      category,
      status,
      lead,
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
                <Label htmlFor="project-key">Project code</Label>
                <Input
                  id="project-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder="MOB"
                  maxLength={12}
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
              <Popover open={leadPickerOpen} onOpenChange={setLeadPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="project-lead"
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={leadPickerOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {leadCandidates.find(
                        (candidate) => candidate.id === leadId,
                      )?.name ??
                        (loadingLeads
                          ? "Loading users…"
                          : "Search and select a lead…")}
                    </span>
                    <IconArrowsSort className="size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search by name or email…" />
                    <CommandList>
                      <CommandEmpty>
                        {loadingLeads ? "Loading users…" : "No matching users."}
                      </CommandEmpty>
                      <CommandGroup>
                        {leadCandidates.map((candidate) => (
                          <CommandItem
                            key={candidate.id}
                            value={`${candidate.name} ${candidate.email}`}
                            onSelect={() => {
                              setLeadId(candidate.id);
                              setLeadPickerOpen(false);
                            }}
                          >
                            <Avatar className="mr-2 size-6 shrink-0">
                              <AvatarImage
                                src={candidate.avatar}
                                alt={candidate.name}
                              />
                              <AvatarFallback className="text-[9px]">
                                {initials(candidate.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0">
                              <span className="block truncate text-sm">
                                {candidate.name}
                              </span>
                              {candidate.email && (
                                <span className="block truncate text-xs text-muted-foreground">
                                  {candidate.email}
                                </span>
                              )}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {false && (
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
              )}
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
  const [items, setItems] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const idRef = useRef(900);

  useEffect(() => {
    let cancelled = false;

    async function loadProjectProgress() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.detail || "Could not load projects.");
        const apiProjects: Array<{
          id: number;
          name: string;
          code: string;
          category: string;
          description: string;
          start_date: string | null;
          end_date: string | null;
          progress: number;
          status: string;
          task_count: number;
          completed_task_count: number;
          total_time_minutes: number;
          is_starred: boolean;
        }> = Array.isArray(data) ? data : data.results || [];
        const membershipEntries = await Promise.all(
          apiProjects.map(async (apiProject: { id: number }) => {
            const membersResponse = await fetch(
              `/api/project-memberships?project=${apiProject.id}`,
              { cache: "no-store" },
            );
            const membersData = await membersResponse.json();
            if (!membersResponse.ok)
              throw new Error(
                membersData.detail || "Could not load project members.",
              );
            const memberships = Array.isArray(membersData)
              ? membersData
              : membersData.results || [];
            return [apiProject.id, memberships as ApiMembership[]] as const;
          }),
        );
        const membershipsByProject = new Map<number, ApiMembership[]>(
          membershipEntries,
        );
        if (cancelled) return;

        setItems(
          apiProjects.map((apiProject) => {
            const members = (membershipsByProject.get(apiProject.id) ?? []).map(
              toProjectMember,
            );
            const lead = members.find((member) => member.role === "lead") ??
              members[0] ?? {
                id: "unassigned",
                name: "Unassigned",
                email: "",
                role: "",
                department: "",
                avatar: "/avatars/default-young-man.png",
                status: "Offline" as const,
                location: "",
              };
            return {
              id: `PRJ-${apiProject.id + 100}`,
              name: apiProject.name,
              key: apiProject.code,
              description: apiProject.description,
              progress: apiProject.progress,
              status: API_PROJECT_STATUS[apiProject.status] ?? "On Track",
              color: "",
              category: apiProject.category || "General",
              taskCounts: {
                total: apiProject.task_count,
                done: apiProject.completed_task_count,
              },
              totalTimeMinutes: apiProject.total_time_minutes ?? 0,
              starred: apiProject.is_starred,
              lead,
              members,
              start: apiProject.start_date ?? "",
              due: apiProject.end_date ?? "",
              budget: 0,
              spent: 0,
              milestones: [],
            };
          }),
        );
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Could not load projects.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadProjectProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createProject(input: NewProjectInput) {
    const lead = input.lead;
    const now = Date.now();
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        code: input.key,
        category: input.category,
        description: input.description,
        status: PROJECT_STATUS_API[input.status],
        start_date: new Date(now).toISOString().slice(0, 10),
        end_date: new Date(now + 90 * 86_400_000).toISOString().slice(0, 10),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Could not create project.",
      );
    }
    const membershipResponse = await fetch("/api/project-memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: data.id,
        user: Number(lead.id),
        role: "lead",
      }),
    });
    if (!membershipResponse.ok) {
      const membershipData = await membershipResponse.json().catch(() => ({}));
      throw new Error(
        typeof membershipData.detail === "string"
          ? membershipData.detail
          : "Project was created, but its lead could not be assigned.",
      );
    }
    const project: Project = {
      id: `PRJ-${data.id + 100}`,
      name: data.name,
      key: data.code,
      description: data.description,
      status: API_PROJECT_STATUS[data.status] ?? input.status,
      progress: 0,
      color: "",
      category: data.category,
      lead,
      members: [lead],
      start: data.start_date,
      due: data.end_date,
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
    map.starred = items.filter((project) => project.starred).length;
    for (const p of items) map[p.status] = (map[p.status] ?? 0) + 1;
    return map;
  }, [items]);

  const stats = useMemo<StatCardType[]>(() => {
    const active = items.filter((p) => p.status !== "Completed").length;
    const completedTasks = items.reduce(
      (sum, project) => sum + project.taskCounts.done,
      0,
    );
    const memberIds = new Set<string>();
    for (const p of items) {
      memberIds.add(p.lead.id);
      for (const m of p.members) memberIds.add(m.id);
    }
    const healthy = items.filter(
      (p) => p.status === "On Track" || p.status === "Completed",
    ).length;
    const onTrack =
      items.length === 0 ? 0 : Math.round((healthy / items.length) * 100);
    return [
      {
        label: "Active projects",
        value: String(active),
      },
      {
        label: "Tasks completed",
        value: String(completedTasks),
      },
      {
        label: "Team members",
        value: String(memberIds.size),
      },
      {
        label: "On track",
        value: `${onTrack}%`,
      },
    ];
  }, [items]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? items
        : filter === "starred"
          ? items.filter((project) => project.starred)
          : items.filter((project) => project.status === filter),
    [filter, items],
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
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Project timeline"
          >
            <Link href="/projects/timeline">
              <IconTimeline className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading projects…
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
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
