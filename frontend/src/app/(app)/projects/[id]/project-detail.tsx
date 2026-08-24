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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { useAuth } from "@/components/auth-provider";
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
const MS_DAY = 86_400_000;

const API_TASK_STATUS: Record<TaskStatus, "backlog" | "todo" | "in_progress" | "in_review" | "done"> = {
  Backlog: "backlog",
  Todo: "todo",
  "In Progress": "in_progress",
  "In Review": "in_review",
  Done: "done",
};

const WORKSPACE_TASK_STATUS: Record<string, TaskStatus> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

const WORKSPACE_TASK_PRIORITY: Record<string, TaskPriority> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const API_TASK_PRIORITY: Record<TaskPriority, "low" | "medium" | "high" | "urgent"> = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Urgent: "urgent",
};

function getBackendProjectId(projectId: string) {
  const match = /^PRJ-(\d+)$/.exec(projectId);
  return match ? Number(match[1]) - 100 : null;
}

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
  weight: number;
  progress: number;
  startDate: string;
  endDate: string;
};

function AddTaskDialog({
  open,
  onOpenChange,
  defaultStatus,
  statusLocked,
  roster,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: TaskStatus;
  statusLocked: boolean;
  roster: TeamMember[];
  onCreate: (input: NewTaskInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeId, setAssigneeId] = useState("unassigned");
  const [weight, setWeight] = useState(1);
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Reset the form each time the dialog opens, honouring the source column.
  useEffect(() => {
    if (open) {
      setTitle("");
      setStatus(defaultStatus);
      setPriority("Medium");
      setAssigneeId("unassigned");
      setWeight(1);
      setProgress(0);
      setStartDate("");
      setEndDate("");
    }
  }, [open, defaultStatus, roster]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      toast.error("End date must be on or after the start date.");
      return;
    }
    if (!Number.isInteger(weight) || weight < 1 || weight > 100) {
      toast.error("Task weight must be between 1% and 100%.");
      return;
    }
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      toast.error("Task progress must be between 0% and 100%.");
      return;
    }
    onCreate({ title: title.trim(), status, priority, assigneeId, weight, progress, startDate, endDate });
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
                <Label htmlFor="task-start-date">Start date</Label>
                <Input id="task-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-end-date">End date</Label>
                <Input id="task-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as TaskStatus)}
                  disabled={statusLocked}
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
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {roster.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-weight">Project weight (%)</Label>
                <Input
                  id="task-weight"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={weight}
                  onChange={(event) => setWeight(Number(event.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-progress">Task progress (%)</Label>
                <Input
                  id="task-progress"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={progress}
                  onChange={(event) => setProgress(Number(event.target.value))}
                />
                <p className="text-xs text-muted-foreground">Applied to the project after observer approval.</p>
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

function EditTaskDialog({
  task,
  roster,
  open,
  onOpenChange,
  onSave,
  isSystemAdmin,
}: {
  task: Task | null;
  roster: TeamMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task, input: NewTaskInput) => Promise<void>;
  isSystemAdmin: boolean;
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Todo");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeId, setAssigneeId] = useState("unassigned");
  const [weight, setWeight] = useState(1);
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task || !open) return;
    setTitle(task.title);
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assignee.id.startsWith("unassigned") ? "unassigned" : task.assignee.id);
    setWeight(task.weight ?? 1);
    setProgress(task.reportedProgress ?? task.approvedProgress ?? 0);
    setStartDate(task.start);
    setEndDate(task.due);
  }, [task, open]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!task || !title.trim()) return toast.error("Task title is required.");
    if (startDate && endDate && endDate < startDate) return toast.error("End date must be on or after the start date.");
    if (!Number.isInteger(weight) || weight < 1 || weight > 100) return toast.error("Weight must be between 1% and 100%.");
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) return toast.error("Progress must be between 0% and 100%.");
    setSaving(true);
    try {
      await onSave(task, { title: title.trim(), status, priority, assigneeId, weight, progress, startDate, endDate });
      onOpenChange(false);
      toast.success("Task updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle>Edit task</DialogTitle><DialogDescription>Update this task&apos;s details and progress.</DialogDescription></DialogHeader>
          <div className="grid gap-3 py-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2"><Label>Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus /></div>
            <div className="grid gap-2"><Label>Status</Label><Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TASK_STATUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Priority</Label><Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TASK_PRIORITIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Assignee</Label><Select value={assigneeId} onValueChange={setAssigneeId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{roster.map((member) => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Weight (%)</Label><Input type="number" min="1" max="100" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /></div>
            <div className="grid gap-2"><Label>Start date</Label><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div>
            <div className="grid gap-2"><Label>End date</Label><Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Task progress (%)</Label>
              <Input type="number" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
              <p className="text-xs text-muted-foreground">
                {isSystemAdmin
                  ? "System administrator updates are approved immediately."
                  : "This value is submitted to the project observer and does not affect project progress until approved."}
              </p>
            </div>
          </div>
          <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Updating..." : "Update task"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Detail view (header + interactive workspace)
// ---------------------------------------------------------------------------

export function ProjectDetail({ project }: { project: Project }) {
  const { user } = useAuth();
  const [roster, setRoster] = useState<TeamMember[]>([]);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [memberCandidates, setMemberCandidates] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectProgress, setProjectProgress] = useState(project.progress);
  const [projectTaskCounts, setProjectTaskCounts] = useState(project.taskCounts);
  const idRef = useRef(1000);

  const [starred, setStarred] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addStatus, setAddStatus] = useState<TaskStatus>("Todo");
  const [addStatusLocked, setAddStatusLocked] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const backendProjectId = getBackendProjectId(project.id);
    if (!backendProjectId) return;
    let cancelled = false;

    async function loadProjectTeamAndTasks() {
      setMembersLoaded(false);
      try {
        const [membersResponse, tasksResponse, projectResponse] = await Promise.all([
          fetch(`/api/project-memberships?project=${backendProjectId}`, { cache: "no-store" }),
          fetch(`/api/tasks?project=${backendProjectId}`, { cache: "no-store" }),
          fetch(`/api/projects/${backendProjectId}`, { cache: "no-store" }),
        ]);
        const [membersData, tasksData, projectData] = await Promise.all([
          membersResponse.json(),
          tasksResponse.json(),
          projectResponse.json(),
        ]);
        if (!membersResponse.ok) throw new Error(membersData.detail || "Could not load project members.");
        if (!tasksResponse.ok) throw new Error(tasksData.detail || "Could not load tasks.");
        if (!projectResponse.ok) throw new Error(projectData.detail || "Could not load project progress.");

        const memberships = Array.isArray(membersData) ? membersData : membersData.results || [];
        const members: TeamMember[] = memberships.map((item: { id: number; user: number; user_name: string; user_email: string; user_avatar_url?: string; role: string }) => ({
          membershipId: item.id,
          id: String(item.user),
          name: item.user_name,
          role: item.role,
          department: "Project",
          email: item.user_email,
          avatar: item.user_avatar_url || "/avatars/default-young-man.png",
          status: "Active",
          location: "",
        }));
        const items = Array.isArray(tasksData) ? tasksData : tasksData.results || [];
        if (cancelled) return;

        setRoster(members);
        setTasks(items.map((item: { id: number; title: string; status: string; priority: string; assignee: number | null; assignee_name: string | null; assignee_avatar_url: string | null; start_date: string | null; end_date: string | null; weight: number; approved_progress: number; reported_progress: number; progress_state: Task["progressState"] }) => ({
          id: `${project.key}-${item.id}`,
          backendId: item.id,
          title: item.title,
          status: WORKSPACE_TASK_STATUS[item.status] || "Todo",
          priority: WORKSPACE_TASK_PRIORITY[item.priority] || "Medium",
          assignee: members.find((member) => member.id === String(item.assignee)) ?? (item.assignee ? {
            id: String(item.assignee),
            name: item.assignee_name || "Unknown user",
            role: "",
            department: "",
            email: "",
            avatar: item.assignee_avatar_url || "/avatars/default-young-man.png",
            status: "Active",
            location: "",
          } : {
            id: `unassigned-${item.id}`,
            name: "Unassigned",
            role: "",
            department: "",
            email: "",
            avatar: "",
            status: "Offline",
            location: "",
          }),
          labels: [],
          projectId: project.id,
          start: item.start_date || project.start,
          due: item.end_date || project.due,
          points: 3,
          weight: item.weight,
          approvedProgress: item.approved_progress,
          reportedProgress: item.reported_progress,
          progressState: item.progress_state,
          comments: 0,
          subtasks: { total: 0, done: 0 },
        })));
        setProjectProgress(projectData.progress);
        setProjectTaskCounts({
          total: projectData.task_count,
          done: projectData.completed_task_count,
        });
        const mayManageMembers = Boolean(projectData.can_manage_members);
        setCanManageMembers(mayManageMembers);
        if (mayManageMembers) {
          const candidatesResponse = await fetch(`/api/project-memberships/candidates?project=${backendProjectId}`, { cache: "no-store" });
          const candidatesData = await candidatesResponse.json();
          if (!cancelled && candidatesResponse.ok) {
            const candidates = Array.isArray(candidatesData) ? candidatesData : candidatesData.results || [];
            setMemberCandidates(candidates.map((candidate: { id: number; name: string; email: string }) => ({
              id: String(candidate.id),
              name: candidate.name,
              email: candidate.email,
            })));
          }
        } else {
          setMemberCandidates([]);
        }
        setMembersLoaded(true);
      } catch (error) {
        if (!cancelled) {
          setMembersLoaded(true);
          toast.error(error instanceof Error ? error.message : "Could not load project data.");
        }
      }
    }

    void loadProjectTeamAndTasks();
    return () => {
      cancelled = true;
    };
  }, [project]);

  function openAddTask(status: TaskStatus, statusLocked = false) {
    if (!membersLoaded) {
      toast.info("Loading project members. Please try again in a moment.");
      return;
    }
    setAddStatus(status);
    setAddStatusLocked(statusLocked);
    setAddOpen(true);
  }

  async function createTask(input: NewTaskInput) {
    const backendProjectId = getBackendProjectId(project.id);
    if (!backendProjectId) {
      toast.error("This project is not connected to the API.");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: backendProjectId,
          title: input.title,
          status: API_TASK_STATUS[input.status],
          priority: API_TASK_PRIORITY[input.priority],
          assignee: input.assigneeId === "unassigned" ? null : Number(input.assigneeId),
          weight: input.weight,
          initial_progress: input.progress,
          start_date: input.startDate || null,
          end_date: input.endDate || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.detail === "string" ? data.detail : "Could not create task.");
      }

    const assignee =
      roster.find((m) => m.id === input.assigneeId) ?? {
        id: "unassigned-new-task",
        name: "Unassigned",
        role: "",
        department: "",
        email: "",
        avatar: "",
        status: "Offline" as const,
        location: "",
      };
    const id = `${project.key}-${data.id ?? idRef.current++}`;
    const now = Date.now();
    const task: Task = {
      id,
      backendId: data.id,
      title: input.title,
      status: input.status,
      priority: input.priority,
      assignee,
      labels: [],
      projectId: project.id,
      start: input.startDate || new Date(now).toISOString().slice(0, 10),
      due: input.endDate || new Date(now + 7 * MS_DAY).toISOString().slice(0, 10),
      points: 0,
      weight: input.weight,
      approvedProgress: data.approved_progress ?? 0,
      reportedProgress: data.reported_progress ?? input.progress,
      progressState: data.progress_state,
      comments: 0,
      subtasks: { total: 0, done: 0 },
    };
    setTasks((prev) => [task, ...prev]);
    toast.success("Task created", {
      description: `${id} · ${input.title} → ${input.status}`,
    });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create task.");
    }
  }

  const currentRoles = roster
    .filter((member) => member.id === String(user?.id))
    .map((member) => member.role);
  const isSystemAdmin = Boolean(user?.is_superuser);
  const canSubmitProgress = isSystemAdmin || currentRoles.includes("lead");
  const canReviewProgress = isSystemAdmin || currentRoles.includes("observer");

  const actions: TaskActions = {
    onOpen: (task) => {
      if (!canSubmitProgress) {
        toast.error("Only the project lead or system administrator can edit tasks.");
        return;
      }
      setEditingTask(task);
    },
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

  async function updateTaskProgress(task: Task, progress: number) {
    if (!task.backendId) throw new Error("This task is not connected to the API.");

    const response = await fetch(`/api/tasks/${task.backendId}?action=submit-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    });
    const responseText = await response.text();
    let data: {
      detail?: string;
      approved_progress?: number;
      reported_progress?: number;
      progress_state?: Task["progressState"];
    };
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        response.status === 404
          ? "The progress API route is unavailable. Please refresh and try again."
          : "The server returned an invalid response."
      );
    }
    if (!response.ok) {
      throw new Error(typeof data.detail === "string" ? data.detail : "Could not update progress.");
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              approvedProgress: data.approved_progress,
              reportedProgress: data.reported_progress,
              progressState: data.progress_state,
            }
          : item
      )
    );

    if (data.progress_state === "approved") {
      const backendProjectId = getBackendProjectId(project.id);
      const projectResponse = await fetch(`/api/projects/${backendProjectId}`, { cache: "no-store" });
      const projectData = await projectResponse.json();
      if (projectResponse.ok) setProjectProgress(projectData.progress);
      toast.success("Progress updated", { description: `${task.title}: ${progress}%` });
    } else {
      toast.success("Progress submitted for review", { description: `${task.title}: ${progress}%` });
    }
  }

  async function updateTaskDetails(
    task: Task,
    input: {
      title: string;
      status: TaskStatus;
      priority: TaskPriority;
      assigneeId: string;
      start: string;
      due: string;
      weight: number;
    }
  ) {
    if (!task.backendId) throw new Error("This task is not connected to the API.");
    const response = await fetch(`/api/tasks/${task.backendId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        status: API_TASK_STATUS[input.status],
        priority: API_TASK_PRIORITY[input.priority],
        assignee: input.assigneeId === "unassigned" ? null : Number(input.assigneeId),
        start_date: input.start || null,
        end_date: input.due || null,
        weight: input.weight,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(typeof data.detail === "string" ? data.detail : "Could not update task details.");
    }
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              title: data.title,
              status: WORKSPACE_TASK_STATUS[data.status] || input.status,
              priority: WORKSPACE_TASK_PRIORITY[data.priority] || input.priority,
              start: data.start_date || project.start,
              due: data.end_date || project.due,
              weight: data.weight,
              assignee:
                roster.find((member) => member.id === String(data.assignee)) ?? {
                  id: `unassigned-${data.id}`,
                  name: "Unassigned",
                  role: "",
                  department: "",
                  email: "",
                  avatar: "",
                  status: "Offline",
                  location: "",
                },
            }
          : item
      )
    );
    const backendProjectId = getBackendProjectId(project.id);
    const projectResponse = await fetch(`/api/projects/${backendProjectId}`, { cache: "no-store" });
    const projectData = await projectResponse.json();
    if (projectResponse.ok) {
      setProjectProgress(projectData.progress);
      setProjectTaskCounts({
        total: projectData.task_count,
        done: projectData.completed_task_count,
      });
    }
  }

  async function reviewTaskProgress(task: Task, approved: boolean) {
    if (!task.backendId) throw new Error("This task is not connected to the API.");
    const response = await fetch(`/api/tasks/${task.backendId}?action=review-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(typeof data.detail === "string" ? data.detail : "Could not review progress.");
    }
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              approvedProgress: data.approved_progress,
              reportedProgress: data.reported_progress,
              progressState: data.progress_state,
            }
          : item
      )
    );
    const backendProjectId = getBackendProjectId(project.id);
    const projectResponse = await fetch(`/api/projects/${backendProjectId}`, { cache: "no-store" });
    const projectData = await projectResponse.json();
    if (projectResponse.ok) setProjectProgress(projectData.progress);
    toast.success(approved ? "Progress approved" : "Progress rejected");
  }

  async function addProjectMember(userId: string, role: "lead" | "observer" | "member") {
    const backendProjectId = getBackendProjectId(project.id);
    if (!backendProjectId) throw new Error("This project is not connected to the API.");
    const response = await fetch("/api/project-memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: backendProjectId, user: Number(userId), role }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Could not add project member.");
    const member: TeamMember = {
      membershipId: data.id,
      id: String(data.user),
      name: data.user_name,
      role: data.role,
      department: "Project",
      email: data.user_email,
      avatar: "",
      status: "Active",
      location: "",
    };
    setRoster((current) => [...current, member]);
    setMemberCandidates((current) => current.filter((candidate) => candidate.id !== member.id));
    toast.success("Member added", { description: `${member.name} was added to this project.` });
  }

  async function removeProjectMember(member: TeamMember) {
    if (!member.membershipId) throw new Error("This project membership is not connected to the API.");
    const response = await fetch(`/api/project-memberships/${member.membershipId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(typeof data.detail === "string" ? data.detail : "Could not remove project member.");
    }
    setRoster((current) => current.filter((item) => item.id !== member.id));
    setTasks((current) => current.map((task) => task.assignee.id === member.id ? {
      ...task,
      assignee: {
        id: `unassigned-${task.backendId ?? task.id}`,
        name: "Unassigned",
        role: "",
        department: "",
        email: "",
        avatar: "",
        status: "Offline",
        location: "",
      },
    } : task));
    setMemberCandidates((current) => [...current, { id: member.id, name: member.name, email: member.email }]);
    toast.success("Member removed", { description: `${member.name} was removed from this project.` });
  }

  async function updateProjectMemberRole(member: TeamMember, role: "lead" | "observer" | "member") {
    if (!member.membershipId) throw new Error("This project membership is not connected to the API.");
    if (member.role === role) return;
    const response = await fetch(`/api/project-memberships/${member.membershipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (!response.ok) {
      const message = typeof data.role?.[0] === "string"
        ? data.role[0]
        : typeof data.detail === "string" ? data.detail : "Could not update the project role.";
      throw new Error(message);
    }
    setRoster((current) => current.map((item) =>
      item.membershipId === member.membershipId ? { ...item, role: data.role } : item
    ));
    toast.success("Project role updated", { description: `${member.name} is now ${data.role}.` });
  }

  const shown = roster.slice(0, 5);
  const extra = roster.length - shown.length;
  const projectWithProgress = {
    ...project,
    progress: projectProgress,
    taskCounts: projectTaskCounts,
  };

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
                  {projectTaskCounts.done}/{projectTaskCounts.total} tasks done
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center -space-x-2">
              {shown.map((m) => (
                <Tooltip key={m.id}>
                  <TooltipTrigger asChild>
                    <Link href={`/profile?user=${m.id}`} aria-label={`Open ${m.name}'s profile`}>
                      <Avatar className="size-8 ring-2 ring-background transition-transform hover:scale-110">
                        <AvatarImage src={m.avatar || "/avatars/default-young-man.png"} alt={m.name} />
                        <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{m.name} · {m.role}</TooltipContent>
                </Tooltip>
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
            <Button onClick={() => openAddTask("Todo")} disabled={!membersLoaded}>
              <IconPlus className="size-4" /> New task
            </Button>
          </div>
        </div>

        {/* Progress strip */}
        <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="tabular-nums">{projectWithProgress.progress}%</span>
            <span className="text-muted-foreground">complete</span>
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${projectWithProgress.progress}%` }}
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
        project={projectWithProgress}
        tasks={tasks}
        members={roster}
        actions={actions}
        canSubmitProgress={canSubmitProgress}
        canReviewProgress={canReviewProgress}
        onProgressChange={updateTaskProgress}
        onTaskDetailsChange={updateTaskDetails}
          onReviewProgress={reviewTaskProgress}
          onAddTask={(status) => openAddTask(status, true)}
          canManageMembers={canManageMembers}
          memberCandidates={memberCandidates}
          onAddMember={addProjectMember}
          onRemoveMember={removeProjectMember}
          onUpdateMemberRole={updateProjectMemberRole}
        />

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultStatus={addStatus}
        statusLocked={addStatusLocked}
        roster={roster}
        onCreate={createTask}
      />

      <EditTaskDialog
        task={editingTask}
        roster={roster}
        isSystemAdmin={isSystemAdmin}
        open={editingTask !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        onSave={async (task, input) => {
          await updateTaskDetails(task, {
            title: input.title,
            status: input.status,
            priority: input.priority,
            assigneeId: input.assigneeId,
            start: input.startDate,
            due: input.endDate,
            weight: input.weight,
          });
          if (input.progress !== (task.reportedProgress ?? task.approvedProgress ?? 0)) {
            await updateTaskProgress(task, input.progress);
          }
        }}
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
