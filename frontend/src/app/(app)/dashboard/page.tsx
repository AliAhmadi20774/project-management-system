"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { IconArrowUpRight, IconBriefcase2, IconClock, IconFileDescription, IconFolders, IconTarget, IconX } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appDateKey } from "@/lib/timezone";

type TimeEntry = { id: number; task: number; task_name: string; project: number; project_name: string; work_date: string; duration_minutes: number; notes: string };
type WorkLog = { id: number; project?: number | null; project_name?: string | null; work_date: string; duration_minutes: number; notes: string };

const chartConfig = {
  time: { label: "Logged time", color: "var(--chart-1)" },
} satisfies ChartConfig;

function formatDuration(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const remaining = safe % 60;
  if (!hours) return `${remaining}m`;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof IconClock }) {
  return (
    <Card><CardContent className="flex items-center gap-3 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-5" /></span>
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p></div>
    </CardContent></Card>
  );
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordType, setRecordType] = useState<"all" | "task" | "general">("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [chartInterval, setChartInterval] = useState<"day" | "week" | "month">("month");
  const [todayKey, setTodayKey] = useState(() => appDateKey());

  useEffect(() => {
    const interval = window.setInterval(() => setTodayKey(appDateKey()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/time-entries", { cache: "no-store" }), fetch("/api/work-logs", { cache: "no-store" })])
      .then(async ([entriesResponse, workLogsResponse]) => {
        const entriesData = await entriesResponse.json();
        const logsData = await workLogsResponse.json();
        if (!entriesResponse.ok) throw new Error(entriesData.detail || "Could not load task time.");
        if (!workLogsResponse.ok) throw new Error(logsData.detail || "Could not load general time.");
        if (cancelled) return;
        setEntries(Array.isArray(entriesData) ? entriesData : entriesData.results ?? []);
        setWorkLogs(Array.isArray(logsData) ? logsData : logsData.results ?? []);
      })
      .catch((error) => { if (!cancelled) toast.error(error instanceof Error ? error.message : "Could not load time overview."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const projectOptions = useMemo(
    () => Array.from(new Map(entries.map((entry) => [entry.project, entry.project_name])).entries()),
    [entries],
  );
  const taskOptions = useMemo(() => {
    const source = projectFilter === "all" ? entries : entries.filter((entry) => String(entry.project) === projectFilter);
    return Array.from(new Map(source.map((entry) => [entry.task, entry.task_name])).entries());
  }, [entries, projectFilter]);
  const filteredEntries = useMemo(() => entries.filter((entry) =>
    (recordType === "all" || recordType === "task") &&
    (projectFilter === "all" || String(entry.project) === projectFilter) &&
    (taskFilter === "all" || String(entry.task) === taskFilter),
  ), [entries, projectFilter, recordType, taskFilter]);
  const filteredWorkLogs = useMemo(() => recordType === "task" ? [] : workLogs, [recordType, workLogs]);
  const generalMinutes = useMemo(() => filteredWorkLogs.reduce((total, log) => total + log.duration_minutes, 0), [filteredWorkLogs]);
  const taskMinutes = useMemo(() => filteredEntries.reduce((total, entry) => total + entry.duration_minutes, 0), [filteredEntries]);
  const totalMinutes = generalMinutes + taskMinutes;

  const projectBranches = useMemo(() => {
    const projects = new Map<number, { name: string; minutes: number; tasks: Map<number, { name: string; minutes: number }> }>();
    filteredEntries.forEach((entry) => {
      const project = projects.get(entry.project) ?? { name: entry.project_name, minutes: 0, tasks: new Map() };
      project.minutes += entry.duration_minutes;
      const task = project.tasks.get(entry.task) ?? { name: entry.task_name, minutes: 0 };
      task.minutes += entry.duration_minutes;
      project.tasks.set(entry.task, task);
      projects.set(entry.project, project);
    });
    return Array.from(projects.entries()).map(([id, project]) => ({
      id, ...project,
      tasks: Array.from(project.tasks.entries()).map(([taskId, task]) => ({ id: taskId, ...task })).sort((a, b) => b.minutes - a.minutes),
    })).sort((a, b) => b.minutes - a.minutes);
  }, [filteredEntries]);

  const chartData = useMemo(() => {
    const anchor = new Date(`${todayKey}T00:00:00Z`);
    const buckets = new Map<string, { period: string; time: number }>();
    const startOfWeek = (date: Date) => {
      const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const offset = (next.getUTCDay() + 6) % 7;
      next.setUTCDate(next.getUTCDate() - offset);
      return next;
    };
    if (chartInterval === "day") {
      for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate() - offset));
        const key = date.toISOString().slice(0, 10);
        buckets.set(key, { period: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date), time: 0 });
      }
    } else if (chartInterval === "week") {
      const weekAnchor = startOfWeek(anchor);
      for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date(weekAnchor);
        date.setUTCDate(date.getUTCDate() - offset * 7);
        const key = date.toISOString().slice(0, 10);
        buckets.set(key, { period: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date), time: 0 });
      }
    } else {
      for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - offset, 1));
        const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        buckets.set(key, { period: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date), time: 0 });
      }
    }
    const addToBucket = (workDate: string, duration: number) => {
      const date = new Date(`${workDate}T00:00:00Z`);
      const key = chartInterval === "day" ? workDate.slice(0, 10) : chartInterval === "week" ? startOfWeek(date).toISOString().slice(0, 10) : workDate.slice(0, 7);
      const point = buckets.get(key);
      if (point) point.time += duration;
    };
    filteredEntries.forEach((entry) => addToBucket(entry.work_date, entry.duration_minutes));
    filteredWorkLogs.forEach((log) => addToBucket(log.work_date, log.duration_minutes));
    return Array.from(buckets.values());
  }, [chartInterval, filteredEntries, filteredWorkLogs, todayKey]);

  return (
    <div className="space-y-6">
      <PageHeader title="My dashboard" description="Your personal work time across general work, projects, and tasks.">
        <Button variant="outline" asChild><Link href="/time">View time log <IconArrowUpRight className="size-4" /></Link></Button>
        <Button asChild><Link href="/time">Log time <IconClock className="size-4" /></Link></Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total recorded" value={formatDuration(totalMinutes)} detail="All personal time" icon={IconClock} />
        <Metric label="Without project" value={formatDuration(generalMinutes)} detail={`${filteredWorkLogs.length} general entries`} icon={IconFileDescription} />
        <Metric label="With projects" value={formatDuration(taskMinutes)} detail={`${filteredEntries.length} task entries`} icon={IconBriefcase2} />
        <Metric label="Projects touched" value={String(projectBranches.length)} detail={`${filteredEntries.length ? new Set(filteredEntries.map((entry) => entry.task)).size : 0} tasks logged`} icon={IconFolders} />
      </div>

      <Card><CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <Select value={recordType} onValueChange={(value) => { setRecordType(value as "all" | "task" | "general"); setProjectFilter("all"); setTaskFilter("all"); }}>
          <SelectTrigger className="w-full lg:w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All time</SelectItem><SelectItem value="general">General time</SelectItem><SelectItem value="task">Task time</SelectItem></SelectContent>
        </Select>
        {recordType === "task" && <Select value={projectFilter} onValueChange={(value) => { setProjectFilter(value); setTaskFilter("all"); }}>
          <SelectTrigger className="w-full lg:w-60"><SelectValue placeholder="All projects" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All projects</SelectItem>{projectOptions.map(([id, name]) => <SelectItem key={id} value={String(id)}>{name}</SelectItem>)}</SelectContent>
        </Select>}
        {recordType === "task" && <Select value={taskFilter} onValueChange={setTaskFilter}>
          <SelectTrigger className="w-full lg:w-60"><SelectValue placeholder="All tasks" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All tasks</SelectItem>{taskOptions.map(([id, name]) => <SelectItem key={id} value={String(id)}>{name}</SelectItem>)}</SelectContent>
        </Select>}
        {(recordType !== "all" || projectFilter !== "all" || taskFilter !== "all") && <Button variant="ghost" size="icon" className="self-end lg:self-auto" aria-label="Clear filters" onClick={() => { setRecordType("all"); setProjectFilter("all"); setTaskFilter("all"); }}><IconX className="size-4" /></Button>}
      </CardContent></Card>

      <div>
        <Card>
          <CardHeader><CardTitle>Time overview</CardTitle><CardDescription>{chartInterval === "month" ? "Monthly totals during the latest 12 recorded months." : chartInterval === "week" ? "Weekly totals during the latest 12 recorded weeks." : "Daily totals during the latest 12 recorded days."}</CardDescription><CardAction><Select value={chartInterval} onValueChange={(value) => setChartInterval(value as "day" | "week" | "month")}><SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="day">Daily</SelectItem><SelectItem value="week">Weekly</SelectItem><SelectItem value="month">Monthly</SelectItem></SelectContent></Select></CardAction></CardHeader>
          <CardContent><ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ left: 2, right: 8, top: 8 }}>
              <defs><linearGradient id="fillLoggedTime" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-time)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--color-time)" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={10} /><YAxis tickLine={false} axisLine={false} tickMargin={8} width={42} tickFormatter={(value) => `${Math.round(Number(value) / 60)}h`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => formatDuration(Number(value))} />} />
              <Area dataKey="time" type="monotone" fill="url(#fillLoggedTime)" stroke="var(--color-time)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer></CardContent>
        </Card>
      </div>

      <Card><CardHeader><CardTitle>Time tree</CardTitle><CardDescription>All time → work without project, then project → task.</CardDescription></CardHeader><CardContent className="space-y-2">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm"><IconClock className="size-4 text-muted-foreground" /><span className="font-medium">All recorded time</span><span className="ml-auto font-semibold tabular-nums">{formatDuration(totalMinutes)}</span></div>
        <div className="ml-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm"><IconFileDescription className="size-4 text-emerald-500" /><span>Without project</span><span className="ml-auto font-medium tabular-nums">{formatDuration(generalMinutes)}</span></div>
        <div className="ml-4 space-y-1 border-l pl-3">
          {projectBranches.map((project) => <div key={project.id} className="rounded-lg border bg-card"><div className="flex items-center gap-3 px-3 py-2.5 text-sm"><IconBriefcase2 className="size-4 text-sky-500" /><span className="font-medium">{project.name}</span><span className="ml-auto font-semibold tabular-nums">{formatDuration(project.minutes)}</span></div><div className="border-t px-3 py-1.5">{project.tasks.map((task) => <div key={task.id} className="flex items-center gap-2 py-1.5 pl-6 text-sm text-muted-foreground"><IconTarget className="size-3.5" /><span className="truncate">{task.name}</span><span className="ml-auto shrink-0 font-medium tabular-nums text-foreground">{formatDuration(task.minutes)}</span></div>)}</div></div>)}
          {!projectBranches.length && !loading && <p className="px-3 py-2 text-sm text-muted-foreground">No task time has been recorded yet.</p>}
        </div>
      </CardContent></Card>
    </div>
  );
}
