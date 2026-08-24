"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
  IconUserPlus,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/delete-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Neutral status markers are used outside the Gantt; the timeline has its
// own compact semantic dot so that progress brightness remains unambiguous.
const STATUS_DOT: Record<TaskStatus, string> = {
  Backlog: "bg-muted-foreground/40",
  Todo: "bg-muted-foreground/60",
  "In Progress": "bg-muted-foreground",
  "In Review": "bg-foreground/70",
  Done: "bg-foreground",
};

const TIMELINE_STATUS_DOT: Record<TaskStatus, string> = {
  Backlog: "bg-slate-500",
  Todo: "bg-sky-500",
  "In Progress": "bg-blue-500",
  "In Review": "bg-amber-500",
  Done: "bg-emerald-500",
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

function currency(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ganttProgressColor(progress: number) {
  const clamped = Math.min(100, Math.max(0, progress));
  return `color-mix(in oklch, var(--timeline-progress-start) ${100 - clamped}%, var(--timeline-progress-end) ${clamped}%)`;
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
  onDuplicate: (task: Task) => Promise<void>;
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
          <IconExternalLink className="size-4" /> Edit task
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {
          void actions.onDuplicate(task).catch((error) => {
            toast.error(error instanceof Error ? error.message : "Could not duplicate task.");
          });
        }}>
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

function BoardCard({
  task,
  actions,
  canManageTasks,
}: {
  task: Task;
  actions: TaskActions;
  canManageTasks: boolean;
}) {
  const prio = PRIORITY_META[task.priority];
  const isPendingReview = task.progressState === "pending_review";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canManageTasks,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }}
      className={`group/card space-y-2.5 rounded-lg border bg-card p-3 shadow-sm transition-[transform,opacity,border-color] hover:border-foreground/20 ${canManageTasks ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <IconFlag3Filled className={`size-3.5 ${prio.flag}`} />
          <span className="font-mono text-[11px] text-muted-foreground">
            {task.id}
          </span>
        </span>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {task.priority}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
              {task.weight ?? 0}% weight
            </span>
          </div>
          <TaskMenu task={task} actions={actions} />
        </div>
      </div>

      <p className="text-sm font-medium leading-snug">{task.title}</p>

      <TaskLabels labels={task.labels} />

      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{isPendingReview ? "Approved progress" : "Progress"}</span>
          <span className="tabular-nums">{task.approvedProgress ?? 0}%</span>
        </div>
        <Progress value={task.approvedProgress ?? 0} className="h-1.5" />
        {isPendingReview && (
          <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
            {task.reportedProgress ?? 0}% reported · awaiting observer approval
          </p>
        )}
      </div>

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

function BoardColumn({
  column,
  tasks,
  actions,
  canManageTasks,
  onAddTask,
}: {
  column: (typeof BOARD_COLUMNS)[number];
  tasks: Task[];
  actions: TaskActions;
  canManageTasks: boolean;
  onAddTask: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status, disabled: !canManageTasks });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-0 flex-col gap-3 rounded-xl bg-muted/40 p-3 transition-all ${isOver ? "scale-[1.01] bg-primary/10 ring-2 ring-primary/50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className={`size-2 rounded-full ${column.dot}`} /><span className="text-sm font-medium">{column.status}</span><span className="rounded bg-background px-1.5 text-xs font-medium tabular-nums text-muted-foreground">{tasks.length}</span></div>
        <div className="flex items-center gap-0.5">
          {canManageTasks && <Button variant="ghost" size="icon" className="size-6" onClick={() => onAddTask(column.status)} aria-label={`Add task to ${column.status}`}><IconPlus className="size-4" /></Button>}
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-6" aria-label={`${column.status} column options`}><IconDots className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44">
            {canManageTasks && <DropdownMenuItem onSelect={() => onAddTask(column.status)}><IconPlus className="size-4" /> Add task</DropdownMenuItem>}
            <DropdownMenuItem onSelect={() => toast.success("Column sorted", { description: `${column.status} sorted by priority.` })}><IconArrowsSort className="size-4" /> Sort by priority</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast(`${column.status} collapsed`, { description: `${tasks.length} tasks hidden.` })}><IconEyeOff className="size-4" /> Collapse column</DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => <BoardCard key={task.id} task={task} actions={actions} canManageTasks={canManageTasks} />)}
        {isOver && <div className="rounded-lg border border-dashed border-primary/60 bg-primary/5 px-3 py-4 text-center text-xs font-medium text-primary">Drop to move to {column.status}</div>}
      </div>
      {canManageTasks && <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" onClick={() => onAddTask(column.status)}><IconPlus className="size-4" /> Add task</Button>}
    </div>
  );
}

function BoardView({ tasks, actions, onAddTask, canManageTasks, onStatusChange }: {
  tasks: Task[];
  actions: TaskActions;
  onAddTask: (status: TaskStatus) => void;
  canManageTasks: boolean;
  onStatusChange: (task: Task, status: TaskStatus) => Promise<void>;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(tasks.find((task) => task.id === String(event.active.id)) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const task = activeTask;
    setActiveTask(null);
    if (!task || !event.over) return;
    const destination = String(event.over.id) as TaskStatus;
    if (destination === task.status || !BOARD_COLUMNS.some((column) => column.status === destination)) return;
    void onStatusChange(task, destination).catch((error) => toast.error(error instanceof Error ? error.message : "Could not update task status."));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragCancel={() => setActiveTask(null)} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {BOARD_COLUMNS.map((column) => <BoardColumn key={column.status} column={column} tasks={tasks.filter((task) => task.status === column.status)} actions={actions} canManageTasks={canManageTasks} onAddTask={onAddTask} />)}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(.2,.8,.2,1)" }}>
        {activeTask && <div className="w-72 rounded-lg border bg-card p-3 shadow-2xl"><p className="font-mono text-[11px] text-muted-foreground">{activeTask.id}</p><p className="mt-1 text-sm font-medium">{activeTask.title}</p></div>}
      </DragOverlay>
    </DndContext>
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
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Weight</TableHead>
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
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex w-32 items-center gap-2">
                      <Progress value={t.approvedProgress ?? 0} className="h-1.5" />
                      <span className="w-9 text-right text-xs font-medium tabular-nums">
                        {t.approvedProgress ?? 0}%
                      </span>
                    </div>
                    {t.progressState === "pending_review" && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        {t.reportedProgress ?? 0}% pending approval
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {t.weight ?? 0}%
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

function EditableGanttBar({
  task,
  progress,
  members,
  canSubmitProgress,
  canReviewProgress,
  onChange,
  onTaskDetailsChange,
  onReviewProgress,
}: {
  task: Task;
  progress: number;
  members: TeamMember[];
  canSubmitProgress: boolean;
  canReviewProgress: boolean;
  onChange: (task: Task, progress: number) => Promise<void>;
  onTaskDetailsChange: (
    task: Task,
    input: { title: string; status: TaskStatus; priority: TaskPriority; assigneeId: string; start: string; due: string; weight: number }
  ) => Promise<void>;
  onReviewProgress: (task: Task, approved: boolean) => Promise<void>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(progress);
  const [inputValue, setInputValue] = useState(String(progress));
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftStatus, setDraftStatus] = useState<TaskStatus>(task.status);
  const [draftPriority, setDraftPriority] = useState<TaskPriority>(task.priority);
  const [draftAssignee, setDraftAssignee] = useState(
    task.assignee.id.startsWith("unassigned") ? "unassigned" : task.assignee.id
  );
  const [draftStart, setDraftStart] = useState(task.start);
  const [draftDue, setDraftDue] = useState(task.due);
  const [draftWeight, setDraftWeight] = useState(task.weight ?? 1);

  const detailsDirty =
    draftTitle.trim() !== task.title ||
    draftStatus !== task.status ||
    draftPriority !== task.priority ||
    draftAssignee !== (task.assignee.id.startsWith("unassigned") ? "unassigned" : task.assignee.id) ||
    draftStart !== task.start ||
    draftDue !== task.due ||
    draftWeight !== (task.weight ?? 1);

  function resetDrafts() {
    setDraft(progress);
    setInputValue(String(progress));
    setDraftTitle(task.title);
    setDraftStatus(task.status);
    setDraftPriority(task.priority);
    setDraftAssignee(task.assignee.id.startsWith("unassigned") ? "unassigned" : task.assignee.id);
    setDraftStart(task.start);
    setDraftDue(task.due);
    setDraftWeight(task.weight ?? 1);
  }

  function progressFromPointer(event: PointerEvent<HTMLElement>) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return draft;
    return Math.max(0, Math.min(100, Math.round(((event.clientX - rect.left) / rect.width) * 100)));
  }

  async function saveQuickEdit() {
    const nextProgress = Number(inputValue);
    if (canSubmitProgress && (!Number.isFinite(nextProgress) || nextProgress < 0 || nextProgress > 100)) {
      toast.error("Progress must be between 0 and 100.");
      return;
    }
    if (canSubmitProgress && !draftTitle.trim()) {
      toast.error("Task title is required.");
      return;
    }
    if (canSubmitProgress && draftStart && draftDue && draftDue < draftStart) {
      toast.error("End date must be on or after start date.");
      return;
    }
    if (canSubmitProgress && (!Number.isInteger(draftWeight) || draftWeight < 1 || draftWeight > 100)) {
      toast.error("Weight must be a whole number between 1 and 100.");
      return;
    }

    setSaving(true);
    try {
      if (canSubmitProgress && detailsDirty) {
        await onTaskDetailsChange(task, {
          title: draftTitle.trim(),
          status: draftStatus,
          priority: draftPriority,
          assigneeId: draftAssignee,
          start: draftStart,
          due: draftDue,
          weight: draftWeight,
        });
      }
      if (canSubmitProgress && Math.round(nextProgress) !== progress) {
        await onChange(task, Math.round(nextProgress));
      } else if (detailsDirty) {
        toast.success("Task updated");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update task.");
    } finally {
      setSaving(false);
    }
  }

  async function reviewProgress(approved: boolean) {
    setSaving(true);
    try {
      await onReviewProgress(task, approved);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review progress.");
    } finally {
      setSaving(false);
    }
  }

  const tooltip = `${task.title} · ${task.status} · ${draft}% progress · ${task.weight ?? 0}% weight${
    task.progressState === "pending_review" ? " · Pending review" : ""
  }`;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) {
          resetDrafts();
        }
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <div
          ref={trackRef}
          className="group/progress relative h-full cursor-pointer select-none overflow-visible"
          title={tooltip}
          role="button"
          tabIndex={0}
          aria-label={`Edit progress for ${task.title}`}
          onContextMenu={(event) => {
            event.preventDefault();
            setInputValue(String(draft));
            setOpen(true);
          }}
          onClick={() => setInputValue(String(draft))}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setInputValue(String(draft));
            setOpen(true);
          }}
        >
          <div className="h-full overflow-hidden rounded-md bg-slate-200/80 ring-1 ring-inset ring-slate-300/70 dark:bg-muted dark:ring-border/50">
            <div
              className="h-full transition-[width,background-color]"
              style={{ width: `${draft}%`, backgroundColor: ganttProgressColor(draft) }}
            />
          </div>
          <span
            className={`absolute -left-1 top-1/2 size-2.5 -translate-y-1/2 rounded-full ring-2 ring-card ${TIMELINE_STATUS_DOT[task.status]}`}
            aria-label={task.status}
            title={task.status}
          />
          {canSubmitProgress && <button
              type="button"
              className={`absolute top-1/2 z-10 h-8 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize bg-transparent after:absolute after:inset-y-1 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:shadow-sm after:ring-1 after:ring-background transition-opacity focus-visible:opacity-100 focus-visible:outline-none ${dragging ? "opacity-100" : "opacity-55 group-hover/progress:opacity-100"}`}
              style={{ left: `${draft}%` }}
              aria-label={`Change progress for ${task.title}`}
              disabled={saving}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
              }}
              onClick={(event) => event.stopPropagation()}
              onPointerMove={(event) => {
                if (dragging) setDraft(progressFromPointer(event));
              }}
              onPointerUp={(event) => {
                if (!dragging) return;
                const next = progressFromPointer(event);
                setDraft(next);
                setInputValue(String(next));
                setDragging(false);
                setOpen(true);
              }}
              onPointerCancel={() => {
                setDragging(false);
                setDraft(progress);
              }}
          />}
          {dragging && (
            <span
              className="pointer-events-none absolute -top-7 z-20 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background shadow"
              style={{ left: `${draft}%` }}
            >
              {draft}%
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <form
          className="space-y-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            void saveQuickEdit();
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Quick edit</p>
            <span className="text-[10px] text-muted-foreground">{task.id}</span>
          </div>

          {canSubmitProgress && (
            <>
              <Input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                className="h-8 text-xs"
                placeholder="Task title"
                aria-label="Task title"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Status</Label>
                  <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as TaskStatus)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BOARD_COLUMNS.map((column) => (
                        <SelectItem key={column.status} value={column.status}>{column.status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Priority</Label>
                  <Select value={draftPriority} onValueChange={(value) => setDraftPriority(value as TaskPriority)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(PRIORITY_META).map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={draftAssignee} onValueChange={setDraftAssignee}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Assignee" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Weight</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={draftWeight}
                    onChange={(event) => setDraftWeight(Number(event.target.value))}
                    className="h-8 text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Start</Label>
                  <Input type="date" value={draftStart} onChange={(event) => setDraftStart(event.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">End</Label>
                  <Input type="date" value={draftDue} onChange={(event) => setDraftDue(event.target.value)} className="h-8 text-xs" />
                </div>
              </div>
            </>
          )}

          {canSubmitProgress && (
            <div className="space-y-1.5 border-t pt-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`progress-${task.id}`} className="text-[10px] text-muted-foreground">Progress</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id={`progress-${task.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                      if (event.target.value) setDraft(Number(event.target.value));
                    }}
                    className="h-7 w-16 text-right text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={inputValue || 0}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  setDraft(Number(event.target.value));
                }}
                className="h-1.5 w-full cursor-pointer accent-foreground"
                aria-label={`Progress for ${task.title}`}
              />
            </div>
          )}

          {canReviewProgress && task.progressState === "pending_review" && (
            <div className="flex items-center justify-between rounded-md border bg-muted/40 p-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Reported progress</p>
                <p className="text-xs font-semibold">{task.reportedProgress ?? 0}%</p>
              </div>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={saving} onClick={() => void reviewProgress(false)}>Reject</Button>
                <Button type="button" size="sm" className="h-7 px-2 text-[11px]" disabled={saving} onClick={() => void reviewProgress(true)}>Approve</Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={saving}
              onClick={() => {
                resetDrafts();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="flex-1" disabled={saving || (!detailsDirty && (!canSubmitProgress || Number(inputValue) === progress))}>
              {saving ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function GanttView({
  project,
  tasks,
  members,
  canSubmitProgress,
  canReviewProgress,
  onProgressChange,
  onTaskDetailsChange,
  onReviewProgress,
}: {
  project: Project;
  tasks: Task[];
  members: TeamMember[];
  canSubmitProgress: boolean;
  canReviewProgress: boolean;
  onProgressChange: (task: Task, progress: number) => Promise<void>;
  onTaskDetailsChange: (
    task: Task,
    input: { title: string; status: TaskStatus; priority: TaskPriority; assigneeId: string; start: string; due: string; weight: number }
  ) => Promise<void>;
  onReviewProgress: (task: Task, approved: boolean) => Promise<void>;
}) {
  const [todayMs, setTodayMs] = useState(WINDOW_START);

  useEffect(() => {
    const refreshToday = () => setTodayMs(Date.now());
    const initialRefresh = window.setTimeout(refreshToday, 0);
    const interval = window.setInterval(refreshToday, 60 * 60 * 1000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, []);

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

  const todayPct = toPct(todayMs);

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
          <div className="hidden flex border-b bg-background">
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
                {false && milestones.map((m) => (
                  <div
                    key={m.title}
                    className="absolute inset-y-0 w-px border-l border-dashed border-muted-foreground/40"
                    style={{ left: `${m.pct}%` }}
                  />
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="pointer-events-auto absolute inset-y-0 z-10 -translate-x-1/2 cursor-help px-1"
                      style={{ left: `${todayPct}%` }}
                      aria-label="Today"
                    >
                      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-primary/50" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Today</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Rows */}
            {rows.map((t) => {
              const left = toPct(isoToMs(t.start));
              const right = toPct(isoToMs(t.due));
              const width = Math.max(right - left, 2.5);
              const progress =
                t.progressState === "pending_review"
                  ? t.reportedProgress ?? t.approvedProgress ?? 0
                  : t.approvedProgress ?? 0;
              return (
                <div
                  key={t.id}
                  className="flex items-center border-b last:border-b-0"
                >
                  <div className="w-56 shrink-0 border-r px-4 py-2">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {t.assignee.name}
                    </p>
                  </div>
                  <div className="relative h-11 flex-1">
                    <div
                      className="absolute top-1/2 h-5 -translate-y-1/2 overflow-visible"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <EditableGanttBar
                        key={`${t.id}-${progress}`}
                        task={t}
                        progress={progress}
                        members={members}
                        canSubmitProgress={canSubmitProgress}
                        canReviewProgress={canReviewProgress}
                        onChange={onProgressChange}
                        onTaskDetailsChange={onTaskDetailsChange}
                        onReviewProgress={onReviewProgress}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-16 rounded-sm"
                style={{
                  background: "linear-gradient(to right, var(--timeline-progress-start), var(--timeline-progress-end))",
                }}
              />
              Progress
            </span>
            {BOARD_COLUMNS.map((column) => (
              <span key={column.status} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${TIMELINE_STATUS_DOT[column.status]}`} />
                {column.status}
              </span>
            ))}
            <span className="hidden flex items-center gap-1.5">
              <span className="size-2.5 rotate-45 rounded-[2px] bg-foreground" />
              Milestone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-primary/60" />
              Today
            </span>
            <span className="ml-auto text-[11px]">
              Click a bar to edit; drag its progress edge for quick changes
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
  tasks,
  members,
  membersLoaded,
  canManageMembers,
  candidates,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
}: {
  tasks: Task[];
  members: TeamMember[];
  membersLoaded: boolean;
  canManageMembers: boolean;
  candidates: Array<{ id: string; name: string; email: string }>;
  onAddMember: (userId: string, role: "lead" | "observer" | "member") => Promise<void>;
  onRemoveMember: (member: TeamMember) => Promise<void>;
  onUpdateMemberRole: (member: TeamMember, role: "lead" | "observer" | "member") => Promise<void>;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"lead" | "observer" | "member">("member");
  const [pendingRemoval, setPendingRemoval] = useState<TeamMember | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    member: TeamMember;
    role: "lead" | "observer" | "member";
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedUser = candidates.find((candidate) => candidate.id === selectedUserId);
  const projectMembers = members;
  const roster = projectMembers.map((member) => ({
    member,
    lead: member.role.toLowerCase() === "lead",
  }));

  async function addMember() {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      await onAddMember(selectedUserId, selectedRole);
      setAddOpen(false);
      setSelectedUserId("");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember() {
    if (!pendingRemoval) return;
    setSaving(true);
    try {
      await onRemoveMember(pendingRemoval);
      setPendingRemoval(null);
    } finally {
      setSaving(false);
    }
  }

  async function confirmRoleChange() {
    if (!pendingRoleChange) return;
    setSaving(true);
    try {
      await onUpdateMemberRole(pendingRoleChange.member, pendingRoleChange.role);
      setPendingRoleChange(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the project role.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {membersLoaded ? `${projectMembers.length} project members` : "Loading project members…"}
        </p>
        {canManageMembers && (
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <IconUserPlus className="size-4" />
            Add member
          </Button>
        )}
      </div>
      {membersLoaded && roster.length === 0 ? (
        <div className="rounded-xl border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
          No members have been added to this project yet.
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roster.map(({ member, lead }) => {
        const assigned = tasks.filter((t) => t.assignee.id === member.id);
        const weight = assigned.reduce((sum, task) => sum + (task.weight ?? 0), 0);
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
                    {canManageMembers && member.membershipId ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) => {
                          const nextRole = role as "lead" | "observer" | "member";
                          if (nextRole !== member.role) setPendingRoleChange({ member, role: nextRole });
                        }}
                      >
                        <SelectTrigger aria-label={`Change ${member.name}'s project role`} className="h-7 w-[118px] border-primary/20 bg-primary/10 px-2 text-xs text-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="observer">Observer</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : member.role && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {member.role === "lead"
                            ? "Lead"
                            : member.role === "observer"
                              ? "Observer"
                              : member.role === "member"
                                ? "Member"
                                : lead
                                  ? "Lead"
                                  : "Member"}
                      </Badge>
                    )}
                  </div>
                </div>
                {canManageMembers && member.membershipId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingRemoval(member)}
                    aria-label={`Remove ${member.name} from project`}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                )}
              </div>

              <div className="flex justify-end text-sm">
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
                  <p className="text-lg font-semibold tabular-nums">{weight}%</p>
                  <p className="text-xs text-muted-foreground">Weight</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add project member</DialogTitle>
            <DialogDescription>Add an existing user to this project and choose their role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="project-member-user">User</Label>
              <Popover open={userPickerOpen} onOpenChange={setUserPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="project-member-user"
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={userPickerOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedUser
                        ? `${selectedUser.name}${selectedUser.email ? ` — ${selectedUser.email}` : ""}`
                        : "Search users…"}
                    </span>
                    <IconArrowsSort className="size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name or email…" />
                    <CommandList>
                      <CommandEmpty>No matching users.</CommandEmpty>
                      <CommandGroup>
                        {candidates.map((candidate) => (
                          <CommandItem
                            key={candidate.id}
                            value={`${candidate.name} ${candidate.email}`}
                            onSelect={() => {
                              setSelectedUserId(candidate.id);
                              setUserPickerOpen(false);
                            }}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm">{candidate.name}</p>
                              {candidate.email && (
                                <p className="truncate text-xs text-muted-foreground">{candidate.email}</p>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {!candidates.length && <p className="text-xs text-muted-foreground">No other active users are available.</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-member-role">Project role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as "lead" | "observer" | "member")}>
                <SelectTrigger id="project-member-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!selectedUserId || saving} onClick={() => void addMember()}>Add member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingRoleChange)}
        onOpenChange={(open) => !open && setPendingRoleChange(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change project role?</DialogTitle>
            <DialogDescription>
              {pendingRoleChange
                ? `${pendingRoleChange.member.name} will change from ${pendingRoleChange.member.role} to ${pendingRoleChange.role}. Their task assignments will remain unchanged.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setPendingRoleChange(null)}>Cancel</Button>
            <Button disabled={saving} onClick={() => void confirmRoleChange()}>
              {saving ? "Updating…" : "Confirm change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        name={pendingRemoval?.name ?? "member"}
        description="This removes the person from this project only. Their account remains active and their assigned project tasks become unassigned."
        onConfirm={removeMember}
      />
    </>
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

function buildActivity(_project: Project, _tasks: Task[]): ActivityEvent[] {
  // Project activity is not persisted yet. Do not fabricate an audit trail.
  return [];
}

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No activity has been recorded yet.</p>;
  }
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
  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight ?? 0), 0);
  const weightedProgressTotal = tasks.reduce(
    (sum, task) => sum + ((task.weight ?? 0) * (task.approvedProgress ?? 0)) / 100,
    0
  );
  const weightedProgress = totalWeight
    ? (weightedProgressTotal / totalWeight) * 100
    : 0;
  const teamSize = new Set([
    project.lead.id,
    ...project.members.map((m) => m.id),
  ]).size;
  const spentPct = project.budget ? Math.round((project.spent / project.budget) * 100) : 0;
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
      label: "Weighted progress",
      value: `${Number(weightedProgress.toFixed(1))}%`,
      hint: `${totalWeight}% task weight allocated`,
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

            {project.budget > 0 ? (
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
            ) : (
              <p className="text-sm text-muted-foreground">Budget tracking is not configured for this project.</p>
            )}

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
            {project.milestones.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No milestones have been added yet.</p>
            ) : (
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
            )}
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
  initialTab = "overview",
  tasks,
  members,
  membersLoaded,
  actions,
  canSubmitProgress,
  canReviewProgress,
  onProgressChange,
  onTaskDetailsChange,
    onReviewProgress,
    onAddTask,
    canManageMembers,
    memberCandidates,
    onAddMember,
    onRemoveMember,
    onUpdateMemberRole,
}: {
  project: Project;
  initialTab?: "overview" | "members";
  tasks: Task[];
    members: TeamMember[];
    membersLoaded: boolean;
  actions: TaskActions;
  canSubmitProgress: boolean;
  canReviewProgress: boolean;
  onProgressChange: (task: Task, progress: number) => Promise<void>;
  onTaskDetailsChange: (
    task: Task,
    input: { title: string; status: TaskStatus; priority: TaskPriority; assigneeId: string; start: string; due: string; weight: number }
  ) => Promise<void>;
    onReviewProgress: (task: Task, approved: boolean) => Promise<void>;
    onAddTask: (status: TaskStatus) => void;
    canManageMembers: boolean;
    memberCandidates: Array<{ id: string; name: string; email: string }>;
    onAddMember: (userId: string, role: "lead" | "observer" | "member") => Promise<void>;
    onRemoveMember: (member: TeamMember) => Promise<void>;
    onUpdateMemberRole: (member: TeamMember, role: "lead" | "observer" | "member") => Promise<void>;
}) {
  const events = useMemo(() => buildActivity(project, tasks), [project, tasks]);

  return (
    <Tabs defaultValue={initialTab} className="w-full gap-4">
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
        <BoardView
          tasks={tasks}
          actions={actions}
          onAddTask={onAddTask}
          canManageTasks={canSubmitProgress}
          onStatusChange={async (task, status) => {
            await onTaskDetailsChange(task, {
              title: task.title,
              status,
              priority: task.priority,
              assigneeId: task.assignee.id.startsWith("unassigned") ? "unassigned" : task.assignee.id,
              start: task.start,
              due: task.due,
              weight: task.weight ?? 1,
            });
            toast.success("Task status updated", { description: `${task.title} moved to ${status}.` });
          }}
        />
      </TabsContent>
      <TabsContent value="list">
        <ListView tasks={tasks} actions={actions} />
      </TabsContent>
      <TabsContent value="timeline">
        <GanttView
          project={project}
          tasks={tasks}
          members={members}
          canSubmitProgress={canSubmitProgress}
          canReviewProgress={canReviewProgress}
          onProgressChange={onProgressChange}
          onTaskDetailsChange={onTaskDetailsChange}
          onReviewProgress={onReviewProgress}
        />
      </TabsContent>
      <TabsContent value="members">
          <MembersView
            tasks={tasks}
            members={members}
            membersLoaded={membersLoaded}
            canManageMembers={canManageMembers}
            candidates={memberCandidates}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
            onUpdateMemberRole={onUpdateMemberRole}
          />
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
