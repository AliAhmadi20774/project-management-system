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
  IconEye,
  IconCalendarEvent,
  IconClock,
  IconX,
  IconStethoscope,
  IconPhoneCall,
  IconRefresh,
  IconUserPlus,
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// --- demo data (inline, deterministic) -------------------------------------

type Status = "Confirmed" | "Pending" | "Checked-in" | "Cancelled";

type Appointment = {
  id: string;
  patient: string;
  avatar: string;
  doctor: string;
  department: string;
  date: string; // display, e.g. "Jul 18, 2026"
  time: string; // display, e.g. "09:30 AM"
  status: Status;
};

const avatar = (seed: number) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

// Shared department metadata drives the bar chart, the load bars and the
// dialog select so every surface stays in sync.
const DEPARTMENTS = [
  { name: "Cardiology", color: "var(--chart-1)", appts: 42, load: 78 },
  { name: "Pediatrics", color: "var(--chart-2)", appts: 38, load: 64 },
  { name: "Orthopedics", color: "var(--chart-3)", appts: 31, load: 52 },
  { name: "Neurology", color: "var(--chart-4)", appts: 24, load: 41 },
  { name: "General", color: "var(--chart-5)", appts: 47, load: 88 },
] as const;

const DEPT_DOCTOR: Record<string, string> = {
  Cardiology: "Dr. Alan Reyes",
  Pediatrics: "Dr. Priya Nadar",
  Orthopedics: "Dr. Marcus Bell",
  Neurology: "Dr. Lena Fischer",
  General: "Dr. Omar Haddad",
};

// Weekly patient visits across the last 12 weeks of 2026.
const VISITS = [
  { week: "Apr 27", outpatient: 412, inpatient: 96 },
  { week: "May 4", outpatient: 438, inpatient: 102 },
  { week: "May 11", outpatient: 401, inpatient: 88 },
  { week: "May 18", outpatient: 469, inpatient: 110 },
  { week: "May 25", outpatient: 452, inpatient: 105 },
  { week: "Jun 1", outpatient: 498, inpatient: 118 },
  { week: "Jun 8", outpatient: 521, inpatient: 124 },
  { week: "Jun 15", outpatient: 486, inpatient: 112 },
  { week: "Jun 22", outpatient: 544, inpatient: 131 },
  { week: "Jun 29", outpatient: 567, inpatient: 138 },
  { week: "Jul 6", outpatient: 592, inpatient: 142 },
  { week: "Jul 13", outpatient: 618, inpatient: 149 },
];

const STAFF = [
  { name: "Dr. Alan Reyes", specialty: "Cardiology", seed: 12, onCall: true },
  { name: "Dr. Priya Nadar", specialty: "Pediatrics", seed: 24, onCall: false },
  { name: "Dr. Marcus Bell", specialty: "Orthopedics", seed: 31, onCall: true },
  { name: "Dr. Lena Fischer", specialty: "Neurology", seed: 45, onCall: false },
  { name: "Dr. Omar Haddad", specialty: "General Medicine", seed: 7, onCall: false },
  { name: "Dr. Sofia Marin", specialty: "Cardiology", seed: 53, onCall: true },
];

const SEED_APPOINTMENTS: Appointment[] = [
  { id: "AP-2041", patient: "Hannah Mills", avatar: avatar(3), doctor: "Dr. Alan Reyes", department: "Cardiology", date: "Jul 18, 2026", time: "09:00 AM", status: "Confirmed" },
  { id: "AP-2042", patient: "Diego Alvarez", avatar: avatar(9), doctor: "Dr. Priya Nadar", department: "Pediatrics", date: "Jul 18, 2026", time: "09:30 AM", status: "Checked-in" },
  { id: "AP-2043", patient: "Grace Okoro", avatar: avatar(17), doctor: "Dr. Marcus Bell", department: "Orthopedics", date: "Jul 18, 2026", time: "10:15 AM", status: "Pending" },
  { id: "AP-2044", patient: "Ethan Wright", avatar: avatar(22), doctor: "Dr. Lena Fischer", department: "Neurology", date: "Jul 19, 2026", time: "11:00 AM", status: "Confirmed" },
  { id: "AP-2045", patient: "Aisha Khan", avatar: avatar(28), doctor: "Dr. Omar Haddad", department: "General", date: "Jul 19, 2026", time: "01:30 PM", status: "Confirmed" },
  { id: "AP-2046", patient: "Tomas Vidal", avatar: avatar(34), doctor: "Dr. Sofia Marin", department: "Cardiology", date: "Jul 20, 2026", time: "02:00 PM", status: "Cancelled" },
  { id: "AP-2047", patient: "Nina Petrova", avatar: avatar(41), doctor: "Dr. Priya Nadar", department: "Pediatrics", date: "Jul 20, 2026", time: "03:15 PM", status: "Pending" },
  { id: "AP-2048", patient: "Liam Foster", avatar: avatar(48), doctor: "Dr. Marcus Bell", department: "Orthopedics", date: "Jul 21, 2026", time: "09:45 AM", status: "Confirmed" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_CLS: Record<Status, string> = {
  Confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Checked-in": "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function formatTime(t: string) {
  const [h, min] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(min)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(min).padStart(2, "0")} ${ampm}`;
}

// --- charts (inline recharts) ----------------------------------------------

const visitsConfig = {
  outpatient: { label: "Outpatient", color: "var(--chart-1)" },
  inpatient: { label: "Inpatient", color: "var(--chart-2)" },
} satisfies ChartConfig;

function PatientVisitsChart() {
  return (
    <ChartContainer config={visitsConfig} className="aspect-auto h-[280px] w-full">
      <AreaChart data={VISITS} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillOutpatient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillInpatient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={24}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          domain={[0, "dataMax + 120"]}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="outpatient"
          type="monotone"
          fill="url(#fillOutpatient)"
          stroke="var(--chart-1)"
          strokeWidth={2}
          stackId="v"
        />
        <Area
          dataKey="inpatient"
          type="monotone"
          fill="url(#fillInpatient)"
          stroke="var(--chart-2)"
          strokeWidth={2}
          stackId="v"
        />
      </AreaChart>
    </ChartContainer>
  );
}

const deptConfig = {
  appts: { label: "Appointments" },
} satisfies ChartConfig;

function DepartmentBarChart() {
  const data = DEPARTMENTS.map((d) => ({ dept: d.name, appts: d.appts, fill: d.color }));
  return (
    <ChartContainer config={deptConfig} className="aspect-auto h-[260px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 24, top: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="dept"
          tickLine={false}
          axisLine={false}
          width={82}
          tickMargin={4}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="appts" radius={5} barSize={22}>
          {data.map((d) => (
            <Cell key={d.dept} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

// --- page ------------------------------------------------------------------

export default function HealthcarePage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SEED_APPOINTMENTS);

  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState("");
  const [dept, setDept] = useState("Cardiology");
  const [date, setDate] = useState("2026-07-22");
  const [time, setTime] = useState("09:30");
  const nextId = useRef(2049);

  const stats = useMemo(() => {
    const added = appointments.length - SEED_APPOINTMENTS.length;
    return [
      {
        label: "Patients Today",
        value: "148",
        change: 6.2,
        trend: "up" as const,
        hint: "vs 139 yesterday",
      },
      {
        label: "Appointments",
        value: String(72 + added),
        change: 3.1,
        trend: "up" as const,
        hint: "scheduled today",
      },
      {
        label: "Bed Occupancy",
        value: "84%",
        change: 2.4,
        trend: "down" as const,
        hint: "212 of 252 beds",
      },
      {
        label: "Revenue",
        value: "$486K",
        change: 9.4,
        trend: "up" as const,
        hint: "July 2026, month to date",
      },
    ];
  }, [appointments.length]);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = patient.trim();
    if (!name) {
      toast.error("Enter the patient name to continue");
      return;
    }
    if (!date || !time) {
      toast.error("Pick a date and time for the visit");
      return;
    }
    const appt: Appointment = {
      id: `AP-${nextId.current++}`,
      patient: name,
      avatar: avatar((name.charCodeAt(0) + name.length * 7) % 70),
      doctor: DEPT_DOCTOR[dept] ?? "Dr. Omar Haddad",
      department: dept,
      date: formatDate(date),
      time: formatTime(time),
      status: "Confirmed",
    };
    setAppointments((prev) => [appt, ...prev]);
    setOpen(false);
    setPatient("");
    toast.success("Appointment booked", {
      description: `${name} with ${appt.doctor} on ${appt.date} at ${appt.time}.`,
    });
  }

  const totalAppts = DEPARTMENTS.reduce((s, d) => s + d.appts, 0);
  const onCall = STAFF.filter((s) => s.onCall).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Healthcare"
        description="Patients, appointments and clinic operations at a glance."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast.success("Export started", {
              description: "Your clinic report will download shortly.",
            })
          }
        >
          <IconDownload className="size-4" /> Export
        </Button>
        <Button size="sm" onClick={() => setOpen(true)}>
          <IconPlus className="size-4" /> New appointment
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient Visits</CardTitle>
            <CardDescription>Outpatient and inpatient volume, last 12 weeks</CardDescription>
            <CardAction>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: "var(--chart-1)" }} />
                  Outpatient
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: "var(--chart-2)" }} />
                  Inpatient
                </span>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <PatientVisitsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments by Department</CardTitle>
            <CardDescription>
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {totalAppts}
              </span>{" "}
              booked this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentBarChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Next visits across all departments</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toast.success("Schedule refreshed", {
                    description: "Showing the latest bookings.",
                  })
                }
              >
                <IconRefresh className="size-4" /> Refresh
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date &amp; Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={a.avatar} alt={a.patient} />
                          <AvatarFallback>{a.patient.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium whitespace-nowrap">{a.patient}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">{a.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {a.doctor}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{a.department}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      <span className="font-medium">{a.date}</span>
                      <span className="text-muted-foreground"> · {a.time}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={STATUS_CLS[a.status]}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">{a.patient} actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              toast("Opening patient record", {
                                description: `${a.patient} · ${a.department}`,
                              })
                            }
                          >
                            <IconEye className="size-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success("Reschedule requested", {
                                description: `We will email ${a.patient} with new slots.`,
                              })
                            }
                          >
                            <IconCalendarEvent className="size-4" /> Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() =>
                              toast("Appointment cancelled", {
                                description: `${a.id} was released from the schedule.`,
                              })
                            }
                          >
                            <IconX className="size-4" /> Cancel visit
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
              <CardTitle>Staff on Duty</CardTitle>
              <CardDescription>{onCall} clinicians on call right now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0.5">
              {STAFF.map((s) => (
                <div
                  key={s.name}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={avatar(s.seed)} alt={s.name} />
                    <AvatarFallback>{s.name.slice(4, 6)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <IconStethoscope className="size-3.5" /> {s.specialty}
                    </p>
                  </div>
                  {s.onCall ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    >
                      <IconPhoneCall className="size-3" /> On call
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-slate-500/10 text-slate-600 dark:text-slate-400"
                    >
                      Available
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Load</CardTitle>
              <CardDescription>Current capacity utilisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEPARTMENTS.map((d) => (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span
                      className={`font-medium tabular-nums ${
                        d.load >= 85
                          ? "text-rose-600 dark:text-rose-400"
                          : d.load >= 70
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {d.load}%
                    </span>
                  </div>
                  <Progress value={d.load} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New appointment dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>New appointment</DialogTitle>
              <DialogDescription>
                Book a patient into the clinic schedule. A clinician is assigned
                by department.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="appt-patient">Patient name</Label>
                <div className="relative">
                  <IconUserPlus className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="appt-patient"
                    value={patient}
                    onChange={(e) => setPatient(e.target.value)}
                    placeholder="Jordan Avery"
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appt-dept">Department</Label>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger id="appt-dept" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Assigned to {DEPT_DOCTOR[dept]}.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appt-date">Date</Label>
                  <div className="relative">
                    <IconCalendarEvent className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="appt-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appt-time">Time</Label>
                  <div className="relative">
                    <IconClock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="appt-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <IconCalendarEvent className="size-4" /> Book appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
