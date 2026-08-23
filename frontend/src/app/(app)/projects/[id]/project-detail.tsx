"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconShare3,
  IconSettings,
  IconStar,
  IconStarFilled,
  IconPlus,
  IconCalendarDue,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { DeleteDialog } from "@/components/delete-dialog";
import {
  type Project,
  type ProjectStatus,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type TeamMember,
} from "@/data";
import {
  ProjectWorkspace,
  buildTasks,
  type TaskActions,
} from "./project-workspace";

const STATUS_DOT: Record<ProjectStatus, string> = {
  "On Track": "bg-foreground",
  "At Risk": "bg-muted-foreground",
  Delayed: "bg-muted-foreground/50",
  Completed: "bg-primary",
};

const TASK_STATUSES: TaskStatus[] = [
  "Backlog",
  "Todo",
  "In Progress",
  "In Review",
  "Done",
];
const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
const POINT_OPTIONS = [1, 2, 3, 5, 8];
const MS_DAY = 86_400_000;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Add-task dialog (shared by the header "New task" and each board column)
// ---------------------------------------------------------------------------

type NewTaskInput = {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  points: number;
};

function AddTaskDialog({
  open,
  onOpenChange,
  defaultStatus,
  roster,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: TaskStatus;
  roster: TeamMember[];
  onCreate: (input: NewTaskInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeId, setAssigneeId] = useState(roster[0]?.id ?? "");
  const [points, setPoints] = useState(3);

  // Reset the form each time the dialog opens, honouring the source column.
  useEffect(() => {
    if (open) {
      setTitle("");
      setStatus(defaultStatus);
      setPriority("Medium");
      setAssigneeId(roster[0]?.id ?? "");
      setPoints(3);
    }
  }, [open, defaultStatus, roster]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    onCreate({ title: title.trim(), status, priority, assigneeId, points });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              Add a task to this project&apos;s board.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wire up empty states"
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as TaskStatus)}
                >
                  <SelectTrigger id="task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as TaskPriority)}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger id="task-assignee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roster.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-points">Story points</Label>
                <Select
                  value={String(points)}
                  onValueChange={(v) => setPoints(Number(v))}
                >
                  <SelectTrigger id="task-points">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POINT_OPTIONS.map((p) => (
                      <SelectItem key={p} value={String(p)}>
                        {p} {p === 1 ? "point" : "points"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Button type="submit">Create task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Detail view (header + interactive workspace)
// ---------------------------------------------------------------------------

export function ProjectDetail({ project }: { project: Project }) {
  const roster = [
    project.lead,
    ...project.members.filter((m) => m.id !== project.lead.id),
  ];

  const [tasks, setTasks] = useState<Task[]>(() => buildTasks(project));
  const idRef = useRef(1000);

  const [starred, setStarred] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addStatus, setAddStatus] = useState<TaskStatus>("Todo");
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  function openAddTask(status: TaskStatus) {
    setAddStatus(status);
    setAddOpen(true);
  }

  function createTask(input: NewTaskInput) {
    const assignee =
      roster.find((m) => m.id === input.assigneeId) ?? project.lead;
    const id = `${project.key}-${idRef.current++}`;
    const now = Date.now();
    const task: Task = {
      id,
      title: input.title,
      status: input.status,
      priority: input.priority,
      assignee,
      labels: [],
      projectId: project.id,
      start: new Date(now).toISOString().slice(0, 10),
      due: new Date(now + 7 * MS_DAY).toISOString().slice(0, 10),
      points: input.points,
      comments: 0,
      subtasks: { total: 0, done: 0 },
    };
    setTasks((prev) => [task, ...prev]);
    toast.success("Task created", {
      description: `${id} · ${input.title} → ${input.status}`,
    });
  }

  const actions: TaskActions = {
    onOpen: (task) =>
      toast(`Opening ${task.id}`, { description: task.title }),
    onDuplicate: (task) => {
      const id = `${project.key}-${idRef.current++}`;
      setTasks((prev) => [
        { ...task, id, title: `${task.title} (copy)` },
        ...prev,
      ]);
      toast.success("Task duplicated", { description: id });
    },
    onDelete: (task) => setPendingDelete(task),
  };

  const shown = roster.slice(0, 5);
  const extra = roster.length - shown.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              asChild
            >
              <Link href="/projects">
                <IconArrowLeft className="size-4" />
                <span className="sr-only">Back to projects</span>
              </Link>
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="size-3 rounded-full bg-foreground" />
                <h1 className="text-2xl font-semibold tracking-tight">
                  {project.name}
                </h1>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {project.key}
                </span>
                <Badge variant="secondary" className="gap-1.5 font-medium">
                  <span
                    className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
                  />
                  {project.status}
                </Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <IconCalendarDue className="size-4" />
                  {formatDate(project.start)} – {formatDate(project.due)}
                </span>
                <span>·</span>
                <span>{project.category}</span>
                <span>·</span>
                <span className="tabular-nums">
                  {project.taskCounts.done}/{project.taskCounts.total} tasks done
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center -space-x-2">
              {shown.map((m) => (
                <Avatar key={m.id} className="size-8 ring-2 ring-background">
                  <AvatarImage src={m.avatar} alt={m.name} />
                  <AvatarFallback className="text-[10px]">
                    {initials(m.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {extra > 0 && (
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
                  +{extra}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => {
                setStarred((s) => {
                  const next = !s;
                  toast.success(
                    next ? "Added to starred" : "Removed from starred",
                    { description: project.name }
                  );
                  return next;
                });
              }}
              aria-pressed={starred}
            >
              {starred ? (
                <IconStarFilled className="size-4" />
              ) : (
                <IconStar className="size-4" />
              )}
              <span className="sr-only">
                {starred ? "Unstar project" : "Star project"}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Share link copied", {
                  description: `${project.key} is ready to share with your team.`,
                })
              }
            >
              <IconShare3 className="size-4" /> Share
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() =>
                toast("Project settings", {
                  description: `Configure ${project.name}.`,
                })
              }
            >
              <IconSettings className="size-4" />
              <span className="sr-only">Project settings</span>
            </Button>
            <Button onClick={() => openAddTask("Todo")}>
              <IconPlus className="size-4" /> New task
            </Button>
          </div>
        </div>

        {/* Progress strip */}
        <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="tabular-nums">{project.progress}%</span>
            <span className="text-muted-foreground">complete</span>
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span
            className={`hidden size-2.5 rounded-full sm:block ${STATUS_DOT[project.status]}`}
          />
          <span className="hidden text-sm text-muted-foreground sm:block">
            {project.status}
          </span>
        </div>
      </div>

      <ProjectWorkspace
        project={project}
        tasks={tasks}
        actions={actions}
        onAddTask={openAddTask}
      />

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultStatus={addStatus}
        roster={roster}
        onCreate={createTask}
      />

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null);
        }}
        name={pendingDelete ? pendingDelete.id : "task"}
        description={
          pendingDelete
            ? `This will permanently remove "${pendingDelete.title}". This action cannot be undone.`
            : undefined
        }
        onConfirm={() => {
          if (pendingDelete) {
            setTasks((prev) => prev.filter((t) => t.id !== pendingDelete.id));
          }
        }}
      />
    </div>
  );
}
