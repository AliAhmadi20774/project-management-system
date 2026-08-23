"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconDotsVertical,
  IconMessageCircle,
  IconPaperclip,
  IconFlag,
  IconPencil,
  IconCopy,
  IconTrash,
  IconArchive,
  IconFilter,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { customers } from "@/data";

type Priority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  title: string;
  description: string;
  label: { text: string; className: string };
  priority: Priority;
  assignee: (typeof customers)[number];
  comments: number;
  attachments: number;
};

type Column = { id: string; name: string; accent: string; tasks: Task[] };

const labels = {
  design: { text: "Design", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  feature: { text: "Feature", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  bug: { text: "Bug", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  research: { text: "Research", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  infra: { text: "Infra", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

type LabelKey = keyof typeof labels;

const priorityStyles: Record<Priority, string> = {
  High: "text-rose-600 dark:text-rose-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Low: "text-slate-500 dark:text-slate-400",
};

const priorities: Priority[] = ["Low", "Medium", "High"];

function task(
  id: string,
  title: string,
  description: string,
  label: Task["label"],
  priority: Priority,
  assigneeIndex: number,
  comments: number,
  attachments: number,
): Task {
  return {
    id,
    title,
    description,
    label,
    priority,
    assignee: customers[assigneeIndex],
    comments,
    attachments,
  };
}

const initialColumns: Column[] = [
  {
    id: "backlog",
    name: "Backlog",
    accent: "bg-slate-400",
    tasks: [
      task("t1", "Audit onboarding funnel", "Identify drop-off points in the signup flow and document friction.", labels.research, "Medium", 3, 4, 0),
      task("t2", "Dark mode contrast pass", "Fix low-contrast tokens on settings and billing pages.", labels.bug, "Low", 7, 2, 1),
      task("t3", "SSO for Enterprise plan", "Scope SAML + SCIM provisioning requirements.", labels.feature, "High", 11, 5, 3),
    ],
  },
  {
    id: "progress",
    name: "In Progress",
    accent: "bg-blue-500",
    tasks: [
      task("t4", "Redesign analytics dashboard", "New layout with saved views and comparison mode.", labels.design, "High", 1, 8, 6),
      task("t5", "Rate limit public API", "Add token-bucket limiting with per-key quotas.", labels.infra, "Medium", 9, 3, 1),
      task("t6", "Bulk CSV import", "Allow customers to import contacts from a CSV file.", labels.feature, "Medium", 4, 2, 0),
    ],
  },
  {
    id: "review",
    name: "In Review",
    accent: "bg-amber-500",
    tasks: [
      task("t7", "Billing webhook refactor", "Consolidate Stripe event handlers and add retries.", labels.infra, "High", 6, 4, 2),
      task("t8", "Notification center UI", "Grouped notifications with read/unread states.", labels.design, "Medium", 13, 6, 4),
    ],
  },
  {
    id: "done",
    name: "Done",
    accent: "bg-emerald-500",
    tasks: [
      task("t9", "Fix auth redirect loop", "Resolve infinite redirect after session expiry.", labels.bug, "High", 2, 9, 0),
      task("t10", "Faster global search", "Index migration cut query latency by 3x.", labels.feature, "Medium", 8, 1, 2),
      task("t11", "Update pricing page", "Refresh copy and add the annual toggle.", labels.design, "Low", 5, 3, 1),
    ],
  },
];

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  // Add-task dialog state.
  const [addOpen, setAddOpen] = useState(false);
  const [addColumn, setAddColumn] = useState<string>(initialColumns[0].id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [labelKey, setLabelKey] = useState<LabelKey>("feature");

  function openAdd(columnId: string) {
    setAddColumn(columnId);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setLabelKey("feature");
    setAddOpen(true);
  }

  function submitTask() {
    const t = title.trim();
    if (!t) return;
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: t,
      description: description.trim() || "No description yet.",
      label: labels[labelKey],
      priority,
      assignee: customers[0],
      comments: 0,
      attachments: 0,
    };
    setColumns((prev) =>
      prev.map((c) =>
        c.id === addColumn ? { ...c, tasks: [newTask, ...c.tasks] } : c,
      ),
    );
    setAddOpen(false);
    const columnName = columns.find((c) => c.id === addColumn)?.name ?? "board";
    toast.success("Task added", { description: `“${t}” added to ${columnName}.` });
  }

  function duplicateTask(columnId: string, source: Task) {
    const copy: Task = { ...source, id: `t-${Date.now()}`, title: `${source.title} (copy)` };
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId ? { ...c, tasks: [copy, ...c.tasks] } : c,
      ),
    );
    toast.success("Task duplicated");
  }

  function deleteTask(columnId: string, taskId: string) {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c,
      ),
    );
    toast.success("Task deleted");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Board" description="Track work across your team's pipeline.">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast("Filters", { description: "Filter presets aren't available in the demo." })
          }
        >
          <IconFilter className="size-4" /> Filter
        </Button>
        <Button size="sm" onClick={() => openAdd(columns[0].id)}>
          <IconPlus className="size-4" /> New task
        </Button>
      </PageHeader>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex w-80 shrink-0 flex-col rounded-xl bg-muted/50 p-3">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={cn("size-2.5 rounded-full", col.accent)} />
              <h2 className="text-sm font-semibold">{col.name}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {col.tasks.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-7"
                onClick={() => openAdd(col.id)}
                aria-label={`Add task to ${col.name}`}
              >
                <IconPlus className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7" aria-label={`${col.name} list actions`}>
                    <IconDotsVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => openAdd(col.id)}>
                    <IconPlus className="size-4" /> Add task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast("Rename list", { description: `Renaming “${col.name}”.` })}
                  >
                    <IconPencil className="size-4" /> Rename list
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.success(`“${col.name}” archived`)}
                  >
                    <IconArchive className="size-4" /> Archive list
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-2.5">
              {col.tasks.map((t) => (
                <Card key={t.id} className="gap-2.5 p-3 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={t.label.className}>
                      {t.label.text}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6 -mr-1" aria-label="Task actions">
                          <IconDotsVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => toast("Edit task", { description: t.title })}
                        >
                          <IconPencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTask(col.id, t)}>
                          <IconCopy className="size-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => deleteTask(col.id, t.id)}
                        >
                          <IconTrash className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-snug">{t.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className={cn("flex items-center gap-1 font-medium", priorityStyles[t.priority])}>
                        <IconFlag className="size-3.5" />
                        {t.priority}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconMessageCircle className="size-3.5" />
                        {t.comments}
                      </span>
                      {t.attachments > 0 && (
                        <span className="flex items-center gap-1">
                          <IconPaperclip className="size-3.5" />
                          {t.attachments}
                        </span>
                      )}
                    </div>
                    <Avatar className="size-6">
                      <AvatarImage src={t.assignee.avatar} alt={t.assignee.name} />
                      <AvatarFallback>{t.assignee.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                </Card>
              ))}

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={() => openAdd(col.id)}
              >
                <IconPlus className="size-4" /> Add task
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Add a card to your board.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) submitTask();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more detail…"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Column</Label>
                <Select value={addColumn} onValueChange={setAddColumn}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Select value={labelKey} onValueChange={(v) => setLabelKey(v as LabelKey)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(labels) as LabelKey[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {labels[k].text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTask} disabled={!title.trim()}>
              Add task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
