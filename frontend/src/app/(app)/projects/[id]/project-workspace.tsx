"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconLayoutDashboard,
  IconLayoutKanban,
  IconList,
  IconTimeline,
  IconUsers,
  IconActivity,
  IconChecklist,
  IconBolt,
  IconMessageCircle,
  IconFlag3Filled,
  IconPlus,
  IconDots,
  IconDotsVertical,
  IconCopy,
  IconTrash,
  IconExternalLink,
  IconArrowsSort,
  IconEyeOff,
  IconCircleCheckFilled,
  IconCircle,
  IconWallet,
  IconProgressCheck,
  IconCalendarDue,
  IconClock,
  IconTargetArrow,
  IconSubtask,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  tasksForProject,
  type Project,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type TeamMember,
} from "@/data";

// ---------------------------------------------------------------------------
// Meta maps
// ---------------------------------------------------------------------------

// Neutral, monochrome ramp for the task pipeline: faint → strong as work
// progresses. No hues anywhere — differentiation comes from shade + label.
const STATUS_DOT: Record<TaskStatus, string> = {
  Backlog: "bg-muted-foreground/40",
  Todo: "bg-muted-foreground/60",
  "In Progress": "bg-muted-foreground",
  "In Review": "bg-foreground/70",
  Done: "bg-foreground",
};

const BOARD_COLUMNS: {
  status: TaskStatus;
  dot: string;
}[] = [
  { status: "Backlog", dot: STATUS_DOT.Backlog },
  { status: "Todo", dot: STATUS_DOT.Todo },
  { status: "In Progress", dot: STATUS_DOT["In Progress"] },
  { status: "In Review", dot: STATUS_DOT["In Review"] },
  { status: "Done", dot: STATUS_DOT.Done },
];

const PRIORITY_META: Record<TaskPriority, { flag: string }> = {
  Urgent: { flag: "text-foreground" },
  High: { flag: "text-foreground/70" },
  Medium: { flag: "text-muted-foreground" },
  Low: { flag: "text-muted-foreground/40" },
};

const STATUS_STATE: Record<TeamMember["status"], string> = {
  Active: "bg-foreground",
  Away: "bg-muted-foreground",
  Offline: "bg-muted-foreground/40",
};

// Gantt bar colors (uniform neutral track, monochrome fill by status).
const BAR_FILL: Record<TaskStatus, string> = {
  Backlog: STATUS_DOT.Backlog,
  Todo: STATUS_DOT.Todo,
  "In Progress": STATUS_DOT["In Progress"],
  "In Review": STATUS_DOT["In Review"],
  Done: STATUS_DOT.Done,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function firstName(name: string) {
  return name.split(" ")[0];
}

function currency(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DAY = 86_400_000;
const WINDOW_START = new Date("2026-07-01T00:00:00Z").getTime();
const WINDOW_END = new Date("2026-10-01T00:00:00Z").getTime();
const WINDOW_SPAN = WINDOW_END - WINDOW_START;
const TODAY = new Date("2026-08-08T00:00:00Z").getTime();

function toPct(ms: number) {
  return Math.min(100, Math.max(0, ((ms - WINDOW_START) / WINDOW_SPAN) * 100));
}

function isoToMs(iso: string) {
  return new Date(iso + "T00:00:00Z").getTime();
}

function addDays(ms: number, n: number) {
  return ms + n * DAY;
}

function seedFrom(id: string) {
  return parseInt(id.replace(/\D/g, ""), 10) || 0;
}

// Deterministic, believable task pool used to enrich each board so every
// column has content and the gantt spans the full Jul–Sep window.
const TASK_POOL = [
  "Audit responsive breakpoints",
  "Wire up empty & error states",
  "Add optimistic UI to mutations",
  "Ship keyboard shortcuts",
  "Refine loading skeletons",
  "Instrument funnel analytics",
  "Harden retry & backoff logic",
  "Localize currency formatting",
  "Add role-based access checks",
  "Compress and lazy-load images",
  "Draft API migration guide",
  "Set up feature flag rollout",
  "Reduce time-to-interactive",
  "Add end-to-end smoke tests",
  "Design confirmation dialogs",
  "Backfill missing changelog",
  "Improve search ranking model",
  "Wire webhooks retry queue",
];

const LABELS = ["frontend", "backend", "design", "bug", "feature", "infra", "docs", "research"];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
// Fill plan so the board and gantt are full but realistic.
const STATUS_PLAN: TaskStatus[] = [
  "Backlog", "Backlog", "Backlog",
  "Todo", "Todo", "Todo",
  "In Progress", "In Progress", "In Progress",
  "In Review", "In Review",
  "Done", "Done", "Done", "Done",
];

export function buildTasks(project: Project): Task[] {
  const base = tasksForProject(project.id);
  const seed = seedFrom(project.id);
  const roster = [project.lead, ...project.members];
  const synthetic: Task[] = STATUS_PLAN.map((status, i) => {
    const startOffset = (i * 6 + seed * 3) % 76;
    const duration = 4 + ((i * 5 + seed) % 15);
    const startMs = addDays(WINDOW_START, startOffset);
    const dueMs = addDays(startMs, duration);
    const total = (i % 4) + 1;
    const labels = Array.from(
      new Set([LABELS[(seed + i) % LABELS.length], LABELS[(seed + i * 3 + 1) % LABELS.length]])
    );
    return {
      id: `${project.key}-${210 + i}`,
      title: TASK_POOL[(seed + i) % TASK_POOL.length],
      status,
      priority: PRIORITIES[(seed + i * 2) % PRIORITIES.length],
      assignee: roster[(seed + i) % roster.length],
      labels,
      projectId: project.id,
      start: new Date(startMs).toISOString().slice(0, 10),
      due: new Date(dueMs).toISOString().slice(0, 10),
      points: [1, 2, 3, 5, 8][(seed + i) % 5],
      comments: (i * 2 + seed) % 11,
      subtasks: { total, done: status === "Done" ? total : i % (total + 1) },
    };
  });
  return [...base, ...synthetic];
}

// ---------------------------------------------------------------------------
// Small shared UI
// ---------------------------------------------------------------------------

function ProgressBar({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "foreground" | "muted";
}) {
  const fill =
    tone === "foreground"
      ? "bg-foreground"
      : tone === "muted"
        ? "bg-muted-foreground/70"
        : "bg-primary";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all ${fill}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function TaskLabels({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((l) => (
        <span
          key={l}
          className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Board (Kanban)
// ---------------------------------------------------------------------------

export type TaskActions = {
  onOpen: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function TaskMenu({
  task,
  actions,
  className,
}: {
  task: Task;
  actions: TaskActions;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`size-6 text-muted-foreground ${className ?? ""}`}
          aria-label={`Actions for ${task.title}`}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => actions.onOpen(task)}>
          <IconExternalLink className="size-4" /> Open
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.onDuplicate(task)}>
          <IconCopy className="size-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => actions.onDelete(task)}
        >
          <IconTrash className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BoardCard({ task, actions }: { task: Task; actions: TaskActions }) {
  const prio = PRIORITY_META[task.priority];
  return (
    <div className="group/card space-y-2.5 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:border-foreground/20">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <IconFlag3Filled className={`size-3.5 ${prio.flag}`} />
          <span className="font-mono text-[11px] text-muted-foreground">
            {task.id}
          </span>
        </span>
        <div className="flex items-center gap-1">
          <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-medium tabular-nums text-muted-foreground">
            {task.points}
          </span>
          <TaskMenu task={task} actions={actions} />
        </div>
      </div>

      <p className="text-sm font-medium leading-snug">{task.title}</p>

      <TaskLabels labels={task.labels} />

      <div className="flex items-center justify-between pt-0.5">
        <Avatar className="size-6">
          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
          <AvatarFallback className="text-[9px]">
            {initials(task.assignee.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconSubtask className="size-3.5" />
            <span className="tabular-nums">
              {task.subtasks.done}/{task.subtasks.total}
            </span>
          </span>
          {task.comments > 0 && (
            <span className="flex items-center gap-1">
              <IconMessageCircle className="size-3.5" />
              <span className="tabular-nums">{task.comments}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BoardView({
  tasks,
  actions,
  onAddTask,
}: {
  tasks: Task[];
  actions: TaskActions;
  onAddTask: (status: TaskStatus) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {BOARD_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-muted/40 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-medium">{col.status}</span>
                <span className="rounded bg-background px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => onAddTask(col.status)}
                  aria-label={`Add task to ${col.status}`}
                >
                  <IconPlus className="size-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      aria-label={`${col.status} column options`}
                    >
                      <IconDots className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onSelect={() => onAddTask(col.status)}>
                      <IconPlus className="size-4" /> Add task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        toast.success("Column sorted", {
                          description: `${col.status} sorted by priority.`,
                        })
                      }
                    >
                      <IconArrowsSort className="size-4" /> Sort by priority
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        toast(`${col.status} collapsed`, {
                          description: `${colTasks.length} tasks hidden.`,
                        })
                      }
                    >
                      <IconEyeOff className="size-4" /> Collapse column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {colTasks.map((t) => (
                <BoardCard key={t.id} task={t} actions={actions} />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => onAddTask(col.status)}
            >
              <IconPlus className="size-4" /> Add task
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

function ListView({
  tasks,
  actions,
}: {
  tasks: Task[];
  actions: TaskActions;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const allChecked = checked.size === tasks.length && tasks.length > 0;

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  aria-label="Select all"
                  checked={allChecked}
                  onCheckedChange={(v) =>
                    setChecked(v ? new Set(tasks.map((t) => t.id)) : new Set())
                  }
                />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id} data-state={checked.has(t.id) && "selected"}>
                <TableCell className="pl-4">
                  <Checkbox
                    aria-label={`Select ${t.title}`}
                    checked={checked.has(t.id)}
                    onCheckedChange={() => toggle(t.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <IconFlag3Filled
                      className={`size-3.5 shrink-0 ${PRIORITY_META[t.priority].flag}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {t.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1.5 font-medium">
                    <span
                      className={`size-1.5 rounded-full ${STATUS_DOT[t.status]}`}
                    />
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1 font-normal">
                    <IconFlag3Filled
                      className={`size-3 ${PRIORITY_META[t.priority].flag}`}
                    />
                    {t.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage
                        src={t.assignee.avatar}
                        alt={t.assignee.name}
                      />
                      <AvatarFallback className="text-[9px]">
                        {initials(t.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {t.assignee.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {shortDate(t.due)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {t.points}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <TaskMenu task={t} actions={actions} className="ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Timeline (Gantt)
// ---------------------------------------------------------------------------

const GANTT_MONTHS = [
  { label: "July", days: 31 },
  { label: "August", days: 31 },
  { label: "September", days: 30 },
];

function GanttView({ project, tasks }: { project: Project; tasks: Task[] }) {
  const rows = useMemo(
    () =>
      [...tasks].sort((a, b) => isoToMs(a.start) - isoToMs(b.start)).slice(0, 14),
    [tasks]
  );

  const weekLines: number[] = [];
  for (let d = 7; d < 92; d += 7) weekLines.push((d / 92) * 100);

  const milestones = project.milestones
    .map((m) => ({ ...m, ms: isoToMs(m.date) }))
    .filter((m) => m.ms >= WINDOW_START && m.ms <= WINDOW_END)
    .map((m) => ({ ...m, pct: toPct(m.ms) }));

  const todayPct = toPct(TODAY);

  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <div className="min-w-[780px]">
          {/* Month header */}
          <div className="flex border-b bg-muted/40">
            <div className="w-56 shrink-0 border-r px-4 py-2.5 text-xs font-medium text-muted-foreground">
              Task
            </div>
            <div className="flex flex-1">
              {GANTT_MONTHS.map((m) => (
                <div
                  key={m.label}
                  className="border-r px-3 py-2.5 text-xs font-medium last:border-r-0"
                  style={{ width: `${(m.days / 92) * 100}%` }}
                >
                  {m.label}{" "}
                  <span className="text-muted-foreground">2026</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone strip */}
          <div className="flex border-b bg-background">
            <div className="w-56 shrink-0 border-r px-4 py-2 text-[11px] font-medium text-muted-foreground">
              Milestones
            </div>
            <div className="relative flex-1">
              {milestones.map((m) => (
                <Tooltip key={m.title}>
                  <TooltipTrigger asChild>
                    <span
                      className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                      style={{ left: `${m.pct}%` }}
                    >
                      <span
                        className={`size-2.5 rotate-45 rounded-[2px] border ${
                          m.done
                            ? "border-foreground bg-foreground"
                            : "border-muted-foreground bg-muted"
                        }`}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {m.title} · {shortDate(m.date)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Body with gridline overlay */}
          <div className="relative">
            {/* Overlay: week gridlines, milestone lines, today */}
            <div className="pointer-events-none absolute inset-0 flex">
              <div className="w-56 shrink-0" />
              <div className="relative flex-1">
                {weekLines.map((x, i) => (
                  <div
                    key={i}
                    className="absolute inset-y-0 w-px bg-border/60"
                    style={{ left: `${x}%` }}
                  />
                ))}
                {milestones.map((m) => (
                  <div
                    key={m.title}
                    className="absolute inset-y-0 w-px border-l border-dashed border-muted-foreground/40"
                    style={{ left: `${m.pct}%` }}
                  />
                ))}
                <div
                  className="absolute inset-y-0 w-0.5 bg-primary/50"
                  style={{ left: `${todayPct}%` }}
                />
              </div>
            </div>

            {/* Rows */}
            {rows.map((t) => {
              const left = toPct(isoToMs(t.start));
              const right = toPct(isoToMs(t.due));
              const width = Math.max(right - left, 2.5);
              const subPct =
                t.subtasks.total > 0
                  ? (t.subtasks.done / t.subtasks.total) * 100
                  : 0;
              return (
                <div
                  key={t.id}
                  className="flex items-center border-b last:border-b-0"
                >
                  <div className="w-56 shrink-0 border-r px-4 py-2">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {t.id} · {firstName(t.assignee.name)}
                    </p>
                  </div>
                  <div className="relative h-11 flex-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute top-1/2 flex h-5 -translate-y-1/2 items-center overflow-hidden rounded-md bg-muted"
                          style={{ left: `${left}%`, width: `${width}%` }}
                        >
                          <div
                            className={`h-full ${BAR_FILL[t.status]}`}
                            style={{ width: `${subPct}%` }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.title} · {shortDate(t.start)} – {shortDate(t.due)}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-3 text-xs text-muted-foreground">
            {BOARD_COLUMNS.map((c) => (
              <span key={c.status} className="flex items-center gap-1.5">
                <span className={`size-2.5 rounded-sm ${c.dot}`} />
                {c.status}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rotate-45 rounded-[2px] bg-foreground" />
              Milestone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-primary/60" />
              Today
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

function MembersView({
  project,
  tasks,
}: {
  project: Project;
  tasks: Task[];
}) {
  const roster = [
    { member: project.lead, lead: true },
    ...project.members
      .filter((m) => m.id !== project.lead.id)
      .map((member) => ({ member, lead: false })),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roster.map(({ member, lead }) => {
        const assigned = tasks.filter((t) => t.assignee.id === member.id);
        const points = assigned.reduce((s, t) => s + t.points, 0);
        return (
          <Card key={member.id} className={lead ? "ring-1 ring-primary/30" : ""}>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="size-11">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-card ${STATUS_STATE[member.status]}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{member.name}</p>
                    {lead && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        Lead
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{member.department}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className={`size-2 rounded-full ${STATUS_STATE[member.status]}`}
                  />
                  {member.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-lg font-semibold tabular-nums">
                    {assigned.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Assigned</p>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-lg font-semibold tabular-nums">{points}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

type ActivityEvent = {
  actor: TeamMember;
  verb: string;
  target: string;
  suffix?: string;
  time: string;
};

function buildActivity(project: Project, tasks: Task[]): ActivityEvent[] {
  const roster = [project.lead, ...project.members];
  const pickMember = (i: number) => roster[i % roster.length];
  const done = tasks.filter((t) => t.status === "Done");
  const review = tasks.filter((t) => t.status === "In Review");
  const inprog = tasks.filter((t) => t.status === "In Progress");
  const doneMs = project.milestones.filter((m) => m.done);

  const t = (arr: Task[], i: number, fb = 0) =>
    (arr[i] ?? tasks[fb]).title;

  return [
    {
      actor: pickMember(2),
      verb: "moved",
      target: t(review, 0),
      suffix: "to In Review",
      time: "24m ago",
    },
    {
      actor: pickMember(0),
      verb: "completed",
      target: t(done, 0, 1),
      time: "1h ago",
    },
    {
      actor: pickMember(1),
      verb: "commented on",
      target: t(tasks, 3),
      time: "3h ago",
    },
    {
      actor: pickMember(3),
      verb: "started work on",
      target: t(inprog, 0, 2),
      time: "5h ago",
    },
    {
      actor: project.lead,
      verb: "marked milestone",
      target: (doneMs[doneMs.length - 1] ?? project.milestones[0]).title,
      suffix: "as complete",
      time: "Yesterday",
    },
    {
      actor: pickMember(4),
      verb: "was assigned",
      target: t(tasks, 5),
      time: "Yesterday",
    },
    {
      actor: pickMember(2),
      verb: "added labels to",
      target: t(tasks, 6),
      time: "2 days ago",
    },
    {
      actor: pickMember(1),
      verb: "updated the timeline for",
      target: project.name,
      time: "3 days ago",
    },
    {
      actor: project.lead,
      verb: "created the project",
      target: project.name,
      time: longDate(project.start),
    },
  ];
}

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="relative space-y-5 border-l pl-6">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[31px] top-0.5">
            <Avatar className="size-6 ring-4 ring-background">
              <AvatarImage src={e.actor.avatar} alt={e.actor.name} />
              <AvatarFallback className="text-[9px]">
                {initials(e.actor.name)}
              </AvatarFallback>
            </Avatar>
          </span>
          <p className="text-sm">
            <span className="font-medium">{e.actor.name}</span> {e.verb}{" "}
            <span className="font-medium">{e.target}</span>
            {e.suffix ? ` ${e.suffix}` : ""}
          </p>
          <span className="text-xs text-muted-foreground">{e.time}</span>
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function OverviewView({
  project,
  tasks,
  events,
}: {
  project: Project;
  tasks: Task[];
  events: ActivityEvent[];
}) {
  const doneTasks = tasks.filter((t) => t.status === "Done");
  const totalPoints = tasks.reduce((s, t) => s + t.points, 0);
  const donePoints = doneTasks.reduce((s, t) => s + t.points, 0);
  const teamSize = new Set([
    project.lead.id,
    ...project.members.map((m) => m.id),
  ]).size;
  const spentPct = Math.round((project.spent / project.budget) * 100);
  const durationDays = Math.round(
    (isoToMs(project.due) - isoToMs(project.start)) / DAY
  );

  const kpis = [
    {
      icon: IconProgressCheck,
      label: "Completion",
      value: `${project.progress}%`,
      hint: "Overall progress",
    },
    {
      icon: IconChecklist,
      label: "Tasks done",
      value: `${doneTasks.length}/${tasks.length}`,
      hint: `${tasks.length - doneTasks.length} remaining`,
    },
    {
      icon: IconBolt,
      label: "Story points",
      value: `${donePoints}/${totalPoints}`,
      hint: "Completed of planned",
    },
    {
      icon: IconUsers,
      label: "Team",
      value: String(teamSize),
      hint: "Contributors",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiTile key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Delivery */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Delivery health</CardTitle>
            <CardDescription>
              Progress, budget burn and key dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <IconTargetArrow className="size-4 text-muted-foreground" />
                  Progress
                </span>
                <span className="tabular-nums">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <IconWallet className="size-4 text-muted-foreground" />
                  Budget spent
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {currency(project.spent)} of {currency(project.budget)} ·{" "}
                  {spentPct}%
                </span>
              </div>
              <ProgressBar
                value={spentPct}
                tone={spentPct > 90 ? "foreground" : "muted"}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <DateStat
                icon={IconCalendarDue}
                label="Start"
                value={shortDate(project.start)}
              />
              <DateStat
                icon={IconCalendarDue}
                label="Due"
                value={shortDate(project.due)}
              />
              <DateStat
                icon={IconClock}
                label="Duration"
                value={`${durationDays}d`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Milestones</CardTitle>
            <CardDescription>
              {project.milestones.filter((m) => m.done).length} of{" "}
              {project.milestones.length} complete
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {project.milestones.map((m) => (
                <li key={m.title} className="flex items-start gap-3">
                  {m.done ? (
                    <IconCircleCheckFilled className="mt-0.5 size-5 shrink-0 text-foreground" />
                  ) : (
                    <IconCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground/50" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        m.done ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {longDate(m.date)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest updates on this project</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed events={events.slice(0, 5)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team</CardTitle>
            <CardDescription>Lead and collaborators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[project.lead, ...project.members.filter((m) => m.id !== project.lead.id)]
              .slice(0, 5)
              .map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="size-8">
                      <AvatarImage src={m.avatar} alt={m.name} />
                      <AvatarFallback className="text-[10px]">
                        {initials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card ${STATUS_STATE[m.status]}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {i === 0 ? "Project lead" : m.role}
                    </p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DateStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workspace shell
// ---------------------------------------------------------------------------

const TABS = [
  { value: "overview", label: "Overview", icon: IconLayoutDashboard },
  { value: "board", label: "Board", icon: IconLayoutKanban },
  { value: "list", label: "List", icon: IconList },
  { value: "timeline", label: "Timeline", icon: IconTimeline },
  { value: "members", label: "Members", icon: IconUsers },
  { value: "activity", label: "Activity", icon: IconActivity },
];

export function ProjectWorkspace({
  project,
  tasks,
  actions,
  onAddTask,
}: {
  project: Project;
  tasks: Task[];
  actions: TaskActions;
  onAddTask: (status: TaskStatus) => void;
}) {
  const events = useMemo(() => buildActivity(project, tasks), [project, tasks]);

  return (
    <Tabs defaultValue="overview" className="w-full gap-4">
      <div className="overflow-x-auto">
        <TabsList className="h-9">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              <t.icon className="size-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="overview">
        <OverviewView project={project} tasks={tasks} events={events} />
      </TabsContent>
      <TabsContent value="board">
        <BoardView tasks={tasks} actions={actions} onAddTask={onAddTask} />
      </TabsContent>
      <TabsContent value="list">
        <ListView tasks={tasks} actions={actions} />
      </TabsContent>
      <TabsContent value="timeline">
        <GanttView project={project} tasks={tasks} />
      </TabsContent>
      <TabsContent value="members">
        <MembersView project={project} tasks={tasks} />
      </TabsContent>
      <TabsContent value="activity">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
            <CardDescription>
              A complete history of changes on {project.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed events={events} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
