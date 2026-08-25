"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconCalendar,
  IconChecklist,
  IconClock,
  IconFileDescription,
  IconPlus,
  IconSearch,
  IconTarget,
  IconX,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Entry = {
  id: number;
  task: number;
  task_name: string;
  project: number;
  project_name: string;
  work_date: string;
  duration_minutes: number;
  notes: string;
};
type WorkLog = {
  id: number;
  project?: number | null;
  project_name?: string | null;
  work_date: string;
  duration_minutes: number;
  notes: string;
};
type TaskOption = { id: number; title: string; project: number };
type ProjectOption = { id: number; name: string };
type LogType = "task" | "general";

const formatDuration = (minutes: number) => {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const remaining = safe % 60;
  if (!hours) return `${remaining}m`;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};
const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof IconClock;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function GeneralTimeDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (entry: WorkLog) => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().slice(0, 10));
      setHours("1");
      setMinutes("0");
      setNotes("");
    }
  }, [open]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const hourValue = Number(hours);
    const minuteValue = Number(minutes);
    const duration = hourValue * 60 + minuteValue;
    if (!date) return toast.error("Choose a date.");
    if (
      !Number.isInteger(hourValue) ||
      !Number.isInteger(minuteValue) ||
      hourValue < 0 ||
      hourValue > 24 ||
      minuteValue < 0 ||
      minuteValue > 59 ||
      duration < 1 ||
      duration > 24 * 60
    )
      return toast.error("Enter a duration between 1 minute and 24 hours.");
    setSaving(true);
    try {
      const response = await fetch("/api/work-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_date: date,
          duration_minutes: duration,
          notes: notes.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Could not save work log.");
      onCreated(data);
      toast.success("General time added");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save work log.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Log general time</DialogTitle>
            <DialogDescription>
              Record work not linked to a project or task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <Textarea
                value={notes}
                maxLength={500}
                rows={3}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What did you work on?"
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskTimeDialog({
  open,
  onOpenChange,
  onTaskCreated,
  onGeneralCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (entry: Entry) => void;
  onGeneralCreated: (entry: WorkLog) => void;
}) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [entryType, setEntryType] = useState<LogType>("general");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(new Date().toISOString().slice(0, 10));
    setHours("1");
    setMinutes("0");
    setNotes("");
    setProjectId("");
    setTaskId("");
    setEntryType("general");
    Promise.all([
      fetch("/api/projects?mine=1", { cache: "no-store" }),
      fetch("/api/tasks?mine=1", { cache: "no-store" }),
    ])
      .then(async ([projectResponse, taskResponse]) => {
        const projectData = await projectResponse.json();
        const taskData = await taskResponse.json();
        if (!projectResponse.ok || !taskResponse.ok)
          throw new Error("Could not load projects and tasks.");
        const projectRows = Array.isArray(projectData)
          ? projectData
          : (projectData.results ?? []);
        const taskRows = Array.isArray(taskData)
          ? taskData
          : (taskData.results ?? []);
        setProjects(
          projectRows.map((item: { id: number; name: string }) => ({
            id: item.id,
            name: item.name,
          })),
        );
        setTasks(
          taskRows.map(
            (item: { id: number; title: string; project: number }) => ({
              id: item.id,
              title: item.title,
              project: item.project,
            }),
          ),
        );
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load task options.",
        ),
      );
  }, [open]);

  const availableTasks = projectId
    ? tasks.filter((task) => String(task.project) === projectId)
    : tasks;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const duration = Number(hours) * 60 + Number(minutes);
    const selectedTaskId = taskId || "none";
    if (entryType === "task" && !projectId)
      return toast.error("Choose a project.");
    if (entryType === "task" && selectedTaskId === "none")
      return toast.error("Choose a task.");
    if (
      !Number.isInteger(Number(hours)) ||
      !Number.isInteger(Number(minutes)) ||
      Number(hours) < 0 ||
      Number(hours) > 24 ||
      Number(minutes) < 0 ||
      Number(minutes) > 59 ||
      duration < 1 ||
      duration > 24 * 60
    )
      return toast.error("Enter a duration between 1 minute and 24 hours.");
    setSaving(true);
    try {
      const isGeneral = entryType !== "task";
      const response = await fetch(
        isGeneral ? "/api/work-logs" : "/api/time-entries",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(isGeneral
              ? { project: projectId ? Number(projectId) : null }
              : { task: Number(selectedTaskId) }),
            work_date: date,
            duration_minutes: duration,
            notes: notes.trim(),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not save time.");
      if (isGeneral) onGeneralCreated(data);
      else onTaskCreated(data);
      toast.success(isGeneral ? "General time added" : "Task time added");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save task time.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Log time</DialogTitle>
            <DialogDescription>
              Choose a type first, then fill only the fields that apply.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Time type</Label>
              <Select
                value={entryType}
                onValueChange={(value) => {
                  setEntryType(value as LogType);
                  setProjectId("");
                  setTaskId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task time</SelectItem>
                  <SelectItem value="general">General time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {entryType !== "general" && (
              <div className="grid gap-2">
                <Label>Project</Label>
                <Select
                  value={projectId}
                  onValueChange={(value) => {
                    setProjectId(value);
                    setTaskId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {entryType === "task" && (
              <div className="grid gap-2">
                <Label>Task</Label>
                <Select value={taskId} onValueChange={setTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((task) => (
                      <SelectItem key={task.id} value={String(task.id)}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                Note <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                value={notes}
                maxLength={500}
                rows={2}
                onChange={(event) => setNotes(event.target.value)}
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TimePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [recordType, setRecordType] = useState<"all" | LogType>("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskTimeOpen, setTaskTimeOpen] = useState(false);
  useEffect(() => {
    Promise.all([
      fetch("/api/time-entries", { cache: "no-store" }),
      fetch("/api/work-logs", { cache: "no-store" }),
    ])
      .then(async ([entriesResponse, logsResponse]) => {
        const entriesData = await entriesResponse.json();
        const logsData = await logsResponse.json();
        if (!entriesResponse.ok)
          throw new Error(entriesData.detail || "Could not load time entries.");
        if (!logsResponse.ok)
          throw new Error(logsData.detail || "Could not load work logs.");
        setEntries(
          Array.isArray(entriesData)
            ? entriesData
            : (entriesData.results ?? []),
        );
        setWorkLogs(
          Array.isArray(logsData) ? logsData : (logsData.results ?? []),
        );
      })
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Could not load time data.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  const projects = useMemo(() => {
    const options = new Map<number, string>();
    entries.forEach((entry) => options.set(entry.project, entry.project_name));
    workLogs.forEach((log) => {
      if (log.project && log.project_name)
        options.set(log.project, log.project_name);
    });
    return Array.from(options.entries());
  }, [entries, workLogs]);
  const tasks = useMemo(() => {
    const source =
      projectFilter === "all"
        ? entries
        : projectFilter === "__none__"
          ? []
          : entries.filter((entry) => String(entry.project) === projectFilter);
    return Array.from(
      new Map(source.map((entry) => [entry.task, entry.task_name])).entries(),
    );
  }, [entries, projectFilter]);
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesQuery =
        !normalized ||
        [
          entry.task_name,
          entry.project_name,
          entry.notes,
          entry.work_date,
        ].some((value) => value.toLowerCase().includes(normalized));
      return (
        matchesQuery &&
        (recordType === "all" || recordType === "task") &&
        (projectFilter === "all" ||
          (projectFilter === "__none__"
            ? false
            : String(entry.project) === projectFilter)) &&
        (taskFilter === "all" ||
          (taskFilter === "__none__"
            ? false
            : String(entry.task) === taskFilter))
      );
    });
  }, [entries, projectFilter, query, recordType, taskFilter]);
  const filteredLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return workLogs.filter(
      (log) =>
        (!normalized ||
          log.notes.toLowerCase().includes(normalized) ||
          log.work_date.includes(normalized)) &&
        (recordType === "all" || recordType === "general") &&
        (projectFilter === "all" ||
          (projectFilter === "__none__"
            ? !log.project
            : String(log.project) === projectFilter)) &&
        (taskFilter === "all" || taskFilter === "__none__"),
    );
  }, [projectFilter, query, recordType, taskFilter, workLogs]);
  const taskMinutes = filteredEntries.reduce(
    (sum, entry) => sum + entry.duration_minutes,
    0,
  );
  const generalMinutes = filteredLogs.reduce(
    (sum, entry) => sum + entry.duration_minutes,
    0,
  );
  const totalMinutes = taskMinutes + generalMinutes;
  const allRows = [
    ...filteredEntries.map((entry) => ({ ...entry, kind: "task" as const })),
    ...filteredLogs.map((entry) => ({ ...entry, kind: "general" as const })),
  ].sort((a, b) => b.work_date.localeCompare(a.work_date));
  function clearFilters() {
    setQuery("");
    setRecordType("all");
    setProjectFilter("all");
    setTaskFilter("all");
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="My time"
        description="A clear view of your task time and daily work notes."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setTaskTimeOpen(true)}>
            <IconPlus className="size-4" /> Log time
          </Button>
        </div>
      </PageHeader>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total time"
          value={formatDuration(totalMinutes)}
          icon={IconClock}
        />
        <Stat
          label="Task time"
          value={formatDuration(taskMinutes)}
          icon={IconTarget}
        />
        <Stat
          label="General time"
          value={formatDuration(generalMinutes)}
          icon={IconFileDescription}
        />
        <Stat
          label="Entries"
          value={String(allRows.length)}
          icon={IconChecklist}
        />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, tasks, notes or dates…"
              className="pl-9"
            />
          </div>
          <Select
            value={recordType}
            onValueChange={(value) => {
              setRecordType(value as "all" | LogType);
              setProjectFilter("all");
              setTaskFilter("all");
            }}
          >
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="task">Task time</SelectItem>
              <SelectItem value="general">General time</SelectItem>
            </SelectContent>
          </Select>
          {recordType === "task" && (
            <Select
              value={projectFilter}
              onValueChange={(value) => {
                setProjectFilter(value);
                setTaskFilter("all");
              }}
            >
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map(([id, name]) => (
                  <SelectItem key={id} value={String(id)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {recordType === "task" && (
            <Select value={taskFilter} onValueChange={setTaskFilter}>
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="All tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tasks</SelectItem>
                {tasks.map(([id, name]) => (
                  <SelectItem key={id} value={String(id)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {(query ||
            recordType !== "all" ||
            projectFilter !== "all" ||
            taskFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              aria-label="Clear filters"
            >
              <IconX className="size-4" />
            </Button>
          )}
        </CardContent>
      </Card>
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <IconCalendar className="size-4" /> Time log
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {allRows.length} matching entries · {formatDuration(totalMinutes)}{" "}
              total
            </p>
          </div>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-muted-foreground">
            Loading your time…
          </p>
        ) : allRows.length ? (
          <div className="divide-y">
            {allRows.map((row) => (
              <div
                key={`${row.kind}-${row.id}`}
                className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {row.kind === "task" ? row.task_name : "General work"}
                    </p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {row.kind === "task" ? "Task" : "General"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.kind === "task"
                      ? `${row.project_name} · `
                      : row.project_name
                        ? `${row.project_name} · `
                        : "No project · "}
                    {formatDate(row.work_date)}
                  </p>
                  {row.notes && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {row.notes}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatDuration(row.duration_minutes)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <IconClock className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No time entries match your filters.
            </p>
          </div>
        )}
      </Card>
      <TaskTimeDialog
        open={taskTimeOpen}
        onOpenChange={setTaskTimeOpen}
        onTaskCreated={(entry) => setEntries((current) => [entry, ...current])}
        onGeneralCreated={(entry) =>
          setWorkLogs((current) => [entry, ...current])
        }
      />
    </div>
  );
}
