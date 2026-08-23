"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconPlus,
  IconDownload,
  IconDotsVertical,
  IconUserCircle,
  IconUserPlus,
  IconUsers,
  IconMessage,
  IconCheck,
  IconBriefcase,
  IconCalendarEvent,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StatCard as StatCardType } from "@/data";

// --- demo data (inline, deterministic) -------------------------------------

const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Support",
  "Operations",
  "Design",
] as const;
type Department = (typeof DEPARTMENTS)[number];

type EmploymentType = "Full-time" | "Contract" | "Intern";
type TimeOffType = "Vacation" | "Sick" | "Remote";

type Hire = {
  id: string;
  name: string;
  role: string;
  dept: Department;
  start: string;
  type: EmploymentType;
  avatar: string;
};

type TimeOff = {
  id: string;
  name: string;
  type: TimeOffType;
  dates: string;
  avatar: string;
  approved: boolean;
};

const avatarUrl = (seed: number) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

// Headcount across the months of 2026 (area trend).
const HEADCOUNT_GROWTH = [
  { month: "Jan", headcount: 248 },
  { month: "Feb", headcount: 256 },
  { month: "Mar", headcount: 261 },
  { month: "Apr", headcount: 270 },
  { month: "May", headcount: 279 },
  { month: "Jun", headcount: 288 },
  { month: "Jul", headcount: 294 },
];

const CHART_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Headcount by department (bar breakdown). Sums to the current headcount.
const DEPARTMENT_HEADCOUNT = [
  { name: "Engineering", value: 96 },
  { name: "Sales", value: 58 },
  { name: "Support", value: 44 },
  { name: "Marketing", value: 34 },
  { name: "Operations", value: 34 },
  { name: "Design", value: 28 },
].map((d, i) => ({ ...d, fill: CHART_TOKENS[i % CHART_TOKENS.length] }));

const INITIAL_HIRES: Hire[] = [
  { id: "EMP-8041", name: "Ava Reynolds", role: "Senior Frontend Engineer", dept: "Engineering", start: "Jul 14, 2026", type: "Full-time", avatar: avatarUrl(21) },
  { id: "EMP-8039", name: "Marcus Lee", role: "Account Executive", dept: "Sales", start: "Jul 9, 2026", type: "Full-time", avatar: avatarUrl(34) },
  { id: "EMP-8036", name: "Priya Nair", role: "Product Designer", dept: "Design", start: "Jul 2, 2026", type: "Full-time", avatar: avatarUrl(5) },
  { id: "EMP-8031", name: "Diego Alvarez", role: "Support Specialist", dept: "Support", start: "Jun 24, 2026", type: "Contract", avatar: avatarUrl(12) },
  { id: "EMP-8028", name: "Hannah Kim", role: "Marketing Analyst", dept: "Marketing", start: "Jun 18, 2026", type: "Full-time", avatar: avatarUrl(45) },
  { id: "EMP-8024", name: "Tomas Silva", role: "DevOps Engineer", dept: "Engineering", start: "Jun 11, 2026", type: "Contract", avatar: avatarUrl(8) },
  { id: "EMP-8019", name: "Grace Obi", role: "People Ops Intern", dept: "Operations", start: "Jun 3, 2026", type: "Intern", avatar: avatarUrl(52) },
  { id: "EMP-8015", name: "Noah Bennett", role: "Backend Engineer", dept: "Engineering", start: "May 27, 2026", type: "Full-time", avatar: avatarUrl(17) },
];

const PIPELINE = [
  { stage: "Applied", count: 482, color: "var(--chart-1)" },
  { stage: "Screening", count: 214, color: "var(--chart-2)" },
  { stage: "Interview", count: 96, color: "var(--chart-3)" },
  { stage: "Offer", count: 32, color: "var(--chart-4)" },
  { stage: "Hired", count: 12, color: "var(--chart-5)" },
];

const INITIAL_TIMEOFF: TimeOff[] = [
  { id: "TO-1", name: "Elena Fischer", type: "Vacation", dates: "Jul 21 - Jul 28, 2026", avatar: avatarUrl(9), approved: false },
  { id: "TO-2", name: "Sam Turner", type: "Sick", dates: "Jul 17 - Jul 18, 2026", avatar: avatarUrl(14), approved: false },
  { id: "TO-3", name: "Yuki Tanaka", type: "Remote", dates: "Jul 20 - Jul 24, 2026", avatar: avatarUrl(27), approved: false },
  { id: "TO-4", name: "Omar Haddad", type: "Vacation", dates: "Aug 3 - Aug 10, 2026", avatar: avatarUrl(33), approved: false },
];

const STATS: StatCardType[] = [
  { label: "Headcount", value: "294", change: 3.5, trend: "up", hint: "12 new hires this quarter" },
  { label: "Open Positions", value: "18", change: 5.0, trend: "up", hint: "6 roles in final stage" },
  { label: "Attrition Rate", value: "4.2%", change: 0.6, trend: "down", hint: "trailing 12 months" },
  { label: "Avg. Tenure", value: "3.4 yrs", change: 2.1, trend: "up", hint: "up from 3.2 yrs" },
];

const growthConfig = {
  headcount: { label: "Headcount", color: "var(--chart-1)" },
} satisfies ChartConfig;

const deptConfig = {
  value: { label: "Employees", color: "var(--chart-1)" },
} satisfies ChartConfig;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// yyyy-mm-dd -> "Jul 14, 2026" without touching timezones.
function formatDate(value: string) {
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${MONTHS[Number(m) - 1] ?? m} ${Number(d)}, ${y}`;
}

const EMPLOYMENT_BADGE: Record<EmploymentType, string> = {
  "Full-time": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Contract: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Intern: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const TIMEOFF_BADGE: Record<TimeOffType, string> = {
  Vacation: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Sick: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Remote: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

// --- page ------------------------------------------------------------------

export default function HRPage() {
  const [hires, setHires] = useState<Hire[]>(INITIAL_HIRES);
  const [timeOff, setTimeOff] = useState<TimeOff[]>(INITIAL_TIMEOFF);

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [dept, setDept] = useState<Department>("Engineering");
  const [type, setType] = useState<EmploymentType>("Full-time");
  const [start, setStart] = useState("2026-07-17");

  const nextSeed = useRef(70);
  const nextId = useRef(8042);

  const pipelineTop = PIPELINE[0].count;
  const deptTotal = useMemo(
    () => DEPARTMENT_HEADCOUNT.reduce((s, d) => s + d.value, 0),
    []
  );

  function handleExport() {
    toast.success("Export started", {
      description: "Your people report (CSV) is being prepared for download.",
    });
  }

  function resetForm() {
    setName("");
    setRole("");
    setDept("Engineering");
    setType("Full-time");
    setStart("2026-07-17");
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanRole = role.trim();
    if (!cleanName) return toast.error("Enter the employee's name");
    if (!cleanRole) return toast.error("Enter a role or job title");

    const seed = nextSeed.current++;
    const hire: Hire = {
      id: `EMP-${nextId.current++}`,
      name: cleanName,
      role: cleanRole,
      dept,
      type,
      start: formatDate(start),
      avatar: avatarUrl(seed),
    };
    setHires((prev) => [hire, ...prev]);
    setAddOpen(false);
    resetForm();
    toast.success("Employee added", {
      description: `${cleanName} joins ${dept} as ${cleanRole}.`,
    });
  }

  function approveTimeOff(item: TimeOff) {
    setTimeOff((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, approved: true } : t))
    );
    toast.success("Time-off approved", {
      description: `${item.name} · ${item.type} (${item.dates}).`,
    });
  }

  const pendingTimeOff = timeOff.filter((t) => !t.approved).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resources"
        description="Headcount, hiring and people operations."
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <IconDownload className="size-4" /> Export
        </Button>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <IconPlus className="size-4" /> Add employee
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Headcount Growth</CardTitle>
            <CardDescription>Total employees over 2026</CardDescription>
            <CardAction>
              <Badge
                variant="secondary"
                className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <IconUsers className="size-3.5" /> +18.5% YTD
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={growthConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <AreaChart
                data={HEADCOUNT_GROWTH}
                margin={{ left: 4, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="fillHeadcount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={36}
                  domain={["dataMin - 12", "dataMax + 8"]}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(v) => `${Number(v).toLocaleString()} people`}
                    />
                  }
                />
                <Area
                  dataKey="headcount"
                  type="monotone"
                  fill="url(#fillHeadcount)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Headcount by Department</CardTitle>
            <CardDescription>{deptTotal} employees across 6 teams</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={deptConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <BarChart
                data={DEPARTMENT_HEADCOUNT}
                layout="vertical"
                margin={{ left: 8, right: 20, top: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={82}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(v, n) => `${n}  ${v}`}
                    />
                  }
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {DEPARTMENT_HEADCOUNT.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Hires</CardTitle>
            <CardDescription>People who joined most recently</CardDescription>
            <CardAction>
              <Badge variant="secondary" className="tabular-nums">
                {hires.length} total
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {hires.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={h.avatar} alt={h.name} />
                          <AvatarFallback>{h.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium whitespace-nowrap">{h.name}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {h.role}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {h.dept}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">
                      {h.start}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={EMPLOYMENT_BADGE[h.type]}
                      >
                        {h.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">{h.name} actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              toast(`Opening ${h.name}'s profile`, {
                                description: `${h.role} · ${h.dept}`,
                              })
                            }
                          >
                            <IconUserCircle className="size-4" /> View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success("Message started", {
                                description: `Draft to ${h.name} is ready.`,
                              })
                            }
                          >
                            <IconMessage className="size-4" /> Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() =>
                              toast("Assigned to onboarding", {
                                description: `${h.name} added to the day-one checklist.`,
                              })
                            }
                          >
                            <IconBriefcase className="size-4" /> Start onboarding
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Pipeline</CardTitle>
              <CardDescription>Candidates by stage this quarter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PIPELINE.map((s) => {
                const pct = Math.round((s.count / pipelineTop) * 100);
                return (
                  <div key={s.stage} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="font-medium">{s.stage}</span>
                      <span className="ms-auto tabular-nums text-muted-foreground">
                        {s.count.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time-off Requests</CardTitle>
              <CardDescription>
                {pendingTimeOff > 0
                  ? `${pendingTimeOff} awaiting your approval`
                  : "All caught up"}
              </CardDescription>
              <CardAction>
                <IconCalendarEvent className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-1">
              {timeOff.map((t, i) => (
                <div key={t.id}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex items-center gap-3 py-1.5">
                    <Avatar className="size-9">
                      <AvatarImage src={t.avatar} alt={t.name} />
                      <AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{t.name}</p>
                        <Badge
                          variant="secondary"
                          className={TIMEOFF_BADGE[t.type]}
                        >
                          {t.type}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground tabular-nums">
                        {t.dates}
                      </p>
                    </div>
                    {t.approved ? (
                      <Badge
                        variant="secondary"
                        className="shrink-0 gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        <IconCheck className="size-3.5" /> Approved
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => approveTimeOff(t)}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add employee dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent>
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle>Add employee</DialogTitle>
              <DialogDescription>
                Create a record for a new team member. They will appear at the
                top of Recent Hires.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="emp-name">Full name</Label>
                <Input
                  id="emp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Blake"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-role">Role</Label>
                <Input
                  id="emp-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Product Manager"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emp-dept">Department</Label>
                  <Select
                    value={dept}
                    onValueChange={(v) => setDept(v as Department)}
                  >
                    <SelectTrigger id="emp-dept" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-type">Employment type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as EmploymentType)}
                  >
                    <SelectTrigger id="emp-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-start">Start date</Label>
                <Input
                  id="emp-start"
                  type="date"
                  value={start}
                  min="2026-01-01"
                  max="2026-12-31"
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <IconUserPlus className="size-4" /> Add employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
