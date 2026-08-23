"use client";

import { useState } from "react";
import {
  IconPlus,
  IconListCheck,
  IconCircleCheck,
  IconProgress,
  IconAlertTriangle,
  IconCalendar,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { customers } from "@/data";

type Priority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  title: string;
  due: string;
  overdue?: boolean;
  priority: Priority;
  tag: { text: string; className: string };
  assigneeIndex: number;
  done: boolean;
};

const tags = {
  design: { text: "Design", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  eng: { text: "Engineering", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  marketing: { text: "Marketing", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ops: { text: "Ops", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  sales: { text: "Sales", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

const priorityStyles: Record<Priority, string> = {
  High: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Low: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const seedTasks: Task[] = [
  { id: "k1", title: "Finalize Q3 marketing budget", due: "Jul 15", overdue: true, priority: "High", tag: tags.marketing, assigneeIndex: 3, done: false },
  { id: "k2", title: "Review pull request #487", due: "Jul 17", priority: "Medium", tag: tags.eng, assigneeIndex: 1, done: false },
  { id: "k3", title: "Ship dark mode contrast fixes", due: "Jul 18", priority: "Medium", tag: tags.design, assigneeIndex: 5, done: false },
  { id: "k4", title: "Prepare board deck", due: "Jul 19", priority: "High", tag: tags.ops, assigneeIndex: 0, done: false },
  { id: "k5", title: "Onboard new enterprise account", due: "Jul 20", priority: "High", tag: tags.sales, assigneeIndex: 7, done: false },
  { id: "k6", title: "Update API documentation", due: "Jul 21", priority: "Low", tag: tags.eng, assigneeIndex: 2, done: false },
  { id: "k7", title: "Draft weekly product digest", due: "Jul 22", priority: "Low", tag: tags.marketing, assigneeIndex: 9, done: false },
  { id: "k8", title: "Kickoff analytics redesign", due: "Jul 14", overdue: true, priority: "Medium", tag: tags.design, assigneeIndex: 4, done: true },
  { id: "k9", title: "Migrate search index", due: "Jul 12", priority: "High", tag: tags.eng, assigneeIndex: 6, done: true },
  { id: "k10", title: "Publish new pricing page", due: "Jul 11", priority: "Low", tag: tags.marketing, assigneeIndex: 8, done: true },
  { id: "k11", title: "Renew SSL certificates", due: "Jul 10", priority: "Medium", tag: tags.ops, assigneeIndex: 10, done: true },
  { id: "k12", title: "Send Q2 retrospective notes", due: "Jul 9", priority: "Low", tag: tags.ops, assigneeIndex: 11, done: true },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(seedTasks);
  const [draft, setDraft] = useState("");

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const inProgress = total - completed;
  const overdue = tasks.filter((t) => t.overdue && !t.done).length;

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask() {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: `k${Date.now()}`,
        title,
        due: "No date",
        priority: "Medium",
        tag: tags.ops,
        assigneeIndex: 0,
        done: false,
      },
      ...prev,
    ]);
    setDraft("");
  }

  const tiles = [
    { label: "Total", value: total, icon: IconListCheck, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Completed", value: completed, icon: IconCircleCheck, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "In progress", value: inProgress, icon: IconProgress, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Overdue", value: overdue, icon: IconAlertTriangle, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ];

  function list(filter: "all" | "active" | "completed") {
    const items = tasks.filter((t) =>
      filter === "all" ? true : filter === "active" ? !t.done : t.done,
    );
    if (items.length === 0) {
      return (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No tasks here yet.
        </div>
      );
    }
    return (
      <div className="divide-y">
        {items.map((t) => {
          const assignee = customers[t.assigneeIndex];
          return (
            <div key={t.id} className="flex items-center gap-3 py-3">
              <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    t.done && "text-muted-foreground line-through",
                  )}
                >
                  {t.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className={t.tag.className}>
                    {t.tag.text}
                  </Badge>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      t.overdue && !t.done ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground",
                    )}
                  >
                    <IconCalendar className="size-3" />
                    {t.due}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className={priorityStyles[t.priority]}>
                {t.priority}
              </Badge>
              <Avatar className="size-7">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback>{assignee.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Keep track of everything your team needs to do." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  tile.className,
                )}
              >
                <tile.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold tabular-nums tracking-tight">{tile.value}</p>
                <p className="text-xs text-muted-foreground">{tile.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) addTask();
              }}
              placeholder="Add a task and press Enter…"
            />
            <Button onClick={addTask}>
              <IconPlus className="size-4" /> Add
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({total})</TabsTrigger>
              <TabsTrigger value="active">Active ({inProgress})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completed})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{list("all")}</TabsContent>
            <TabsContent value="active">{list("active")}</TabsContent>
            <TabsContent value="completed">{list("completed")}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
