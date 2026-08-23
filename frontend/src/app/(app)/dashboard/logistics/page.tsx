"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label as ChartLabel,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconPlus,
  IconDownload,
  IconTruck,
  IconTruckDelivery,
  IconRoute,
  IconDotsVertical,
  IconArrowNarrowRight,
  IconCurrentLocation,
  IconRefresh,
  IconClockHour4,
  IconPackage,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- types & fake data (inline, deterministic) -----------------------------

type ShipmentStatus =
  | "In Transit"
  | "Delivered"
  | "Delayed"
  | "Pending"
  | "Returned";

type Shipment = {
  id: string;
  origin: string;
  destination: string;
  driver: string;
  seed: number;
  status: ShipmentStatus;
  eta: string;
};

type FleetStatus = "Available" | "On Route" | "Maintenance";

type Vehicle = {
  id: string;
  type: "Truck" | "Van" | "Semi";
  driver: string;
  status: FleetStatus;
};

const DRIVERS = [
  { name: "Marcus Bennett", seed: 11 },
  { name: "Priya Nair", seed: 24 },
  { name: "Diego Alvarez", seed: 32 },
  { name: "Sofia Rossi", seed: 41 },
  { name: "Chen Wei", seed: 8 },
  { name: "Amara Okafor", seed: 15 },
  { name: "Liam Nguyen", seed: 12 },
  { name: "Hannah Schmidt", seed: 47 },
];

const seedFor = (name: string) =>
  DRIVERS.find((d) => d.name === name)?.seed ?? 1;

const INITIAL_SHIPMENTS: Shipment[] = [
  { id: "SHP-4821", origin: "Chicago", destination: "Denver", driver: "Marcus Bennett", seed: 11, status: "In Transit", eta: "Jul 18, 2026" },
  { id: "SHP-4822", origin: "Seattle", destination: "Portland", driver: "Priya Nair", seed: 24, status: "Delivered", eta: "Jul 16, 2026" },
  { id: "SHP-4823", origin: "Austin", destination: "Houston", driver: "Diego Alvarez", seed: 32, status: "Delayed", eta: "Jul 19, 2026" },
  { id: "SHP-4824", origin: "Miami", destination: "Atlanta", driver: "Sofia Rossi", seed: 41, status: "In Transit", eta: "Jul 20, 2026" },
  { id: "SHP-4825", origin: "Boston", destination: "New York", driver: "Chen Wei", seed: 8, status: "Pending", eta: "Jul 21, 2026" },
  { id: "SHP-4826", origin: "Phoenix", destination: "Las Vegas", driver: "Amara Okafor", seed: 15, status: "In Transit", eta: "Jul 18, 2026" },
  { id: "SHP-4827", origin: "Dallas", destination: "Oklahoma City", driver: "Liam Nguyen", seed: 12, status: "Returned", eta: "Jul 15, 2026" },
  { id: "SHP-4828", origin: "Detroit", destination: "Cleveland", driver: "Hannah Schmidt", seed: 47, status: "Delivered", eta: "Jul 17, 2026" },
];

const FLEET: Vehicle[] = [
  { id: "TRK-12", type: "Truck", driver: "Marcus Bennett", status: "On Route" },
  { id: "VAN-07", type: "Van", driver: "Priya Nair", status: "Available" },
  { id: "SEM-21", type: "Semi", driver: "Diego Alvarez", status: "On Route" },
  { id: "TRK-33", type: "Truck", driver: "Sofia Rossi", status: "Maintenance" },
  { id: "VAN-18", type: "Van", driver: "Chen Wei", status: "Available" },
  { id: "SEM-09", type: "Semi", driver: "Amara Okafor", status: "On Route" },
];

const TOP_ROUTES = [
  { from: "Chicago", to: "Denver", loads: 428, pct: 92 },
  { from: "Los Angeles", to: "Phoenix", loads: 356, pct: 78 },
  { from: "Dallas", to: "Houston", loads: 312, pct: 68 },
  { from: "Seattle", to: "Portland", loads: 274, pct: 60 },
  { from: "Miami", to: "Atlanta", loads: 198, pct: 44 },
];

const DELIVERIES = [
  { day: "Jul 10", delivered: 182, delayed: 14 },
  { day: "Jul 11", delivered: 196, delayed: 11 },
  { day: "Jul 12", delivered: 168, delayed: 18 },
  { day: "Jul 13", delivered: 204, delayed: 9 },
  { day: "Jul 14", delivered: 221, delayed: 12 },
  { day: "Jul 15", delivered: 210, delayed: 16 },
  { day: "Jul 16", delivered: 234, delayed: 8 },
  { day: "Jul 17", delivered: 248, delayed: 13 },
];

const STATUS_BREAKDOWN = [
  { status: "In Transit", count: 486, fill: "var(--chart-1)" },
  { status: "Delivered", count: 612, fill: "var(--chart-2)" },
  { status: "Delayed", count: 74, fill: "var(--chart-3)" },
  { status: "Pending", count: 92, fill: "var(--chart-4)" },
  { status: "Returned", count: 20, fill: "var(--chart-5)" },
];

const STATS = [
  { label: "Active Shipments", value: "1,284", change: 4.2, trend: "up" as const, hint: "18 dispatched today" },
  { label: "On-time Delivery", value: "94.6%", change: 1.8, trend: "up" as const, hint: "vs. 92.8% last month" },
  { label: "Fleet Utilization", value: "82%", change: 3.1, trend: "up" as const, hint: "142 of 173 vehicles active" },
  { label: "Fuel Cost", value: "$48,920", change: 2.4, trend: "down" as const, hint: "$3.98 avg per gallon · July" },
];

const shipmentBadge: Record<ShipmentStatus, string> = {
  "In Transit": "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Delayed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Returned: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const fleetBadge: Record<FleetStatus, { cls: string; dot: string }> = {
  Available: { cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  "On Route": { cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
  Maintenance: { cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
};

const vehicleIcon: Record<Vehicle["type"], typeof IconTruck> = {
  Truck: IconTruck,
  Van: IconTruckDelivery,
  Semi: IconPackage,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatEta(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const deliveriesConfig = {
  delivered: { label: "Delivered", color: "var(--chart-1)" },
  delayed: { label: "Delayed", color: "var(--chart-3)" },
} satisfies ChartConfig;

const statusConfig = {
  count: { label: "Shipments" },
  "In Transit": { label: "In Transit", color: "var(--chart-1)" },
  Delivered: { label: "Delivered", color: "var(--chart-2)" },
  Delayed: { label: "Delayed", color: "var(--chart-3)" },
  Pending: { label: "Pending", color: "var(--chart-4)" },
  Returned: { label: "Returned", color: "var(--chart-5)" },
} satisfies ChartConfig;

// --- inline charts ---------------------------------------------------------

function DeliveriesChart() {
  return (
    <ChartContainer config={deliveriesConfig} className="aspect-auto h-[280px] w-full">
      <AreaChart data={DELIVERIES} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillDelayed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Area dataKey="delivered" type="monotone" fill="url(#fillDelivered)" stroke="var(--chart-1)" strokeWidth={2} stackId="a" />
        <Area dataKey="delayed" type="monotone" fill="url(#fillDelayed)" stroke="var(--chart-3)" strokeWidth={2} stackId="a" />
      </AreaChart>
    </ChartContainer>
  );
}

function StatusDonut({ total }: { total: number }) {
  return (
    <ChartContainer config={statusConfig} className="mx-auto aspect-square h-[220px]">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel formatter={(v, name) => `${name}  ${Number(v).toLocaleString()}`} />}
        />
        <Pie data={STATUS_BREAKDOWN} dataKey="count" nameKey="status" innerRadius={62} strokeWidth={4} paddingAngle={2}>
          <ChartLabel
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-semibold">
                      {total.toLocaleString()}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                      Shipments
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

// --- page ------------------------------------------------------------------

export default function LogisticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [driver, setDriver] = useState("");
  const [eta, setEta] = useState("2026-07-24");
  const nextId = useRef(4829);

  const statusTotal = useMemo(
    () => STATUS_BREAKDOWN.reduce((s, r) => s + r.count, 0),
    []
  );

  function resetForm() {
    setOrigin("");
    setDestination("");
    setDriver("");
    setEta("2026-07-24");
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const from = origin.trim();
    const to = destination.trim();
    if (!from || !to) return toast.error("Enter an origin and destination");
    if (!driver) return toast.error("Assign a driver to continue");
    const ship: Shipment = {
      id: `SHP-${nextId.current++}`,
      origin: from,
      destination: to,
      driver,
      seed: seedFor(driver),
      status: "Pending",
      eta: formatEta(eta),
    };
    setShipments((prev) => [ship, ...prev]);
    setOpen(false);
    resetForm();
    toast.success("Shipment created", {
      description: `${ship.id} · ${from} to ${to}, assigned to ${driver}.`,
    });
  }

  function handleExport() {
    toast.success("Export started", {
      description: `Preparing ${shipments.length} shipments as a CSV file.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics"
        description="Shipments, fleet and delivery performance in real time."
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <IconDownload className="size-4" /> Export
        </Button>
        <Button size="sm" onClick={() => setOpen(true)}>
          <IconPlus className="size-4" /> New shipment
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
            <CardTitle>Deliveries</CardTitle>
            <CardDescription>Delivered vs delayed, last 8 days</CardDescription>
            <CardAction>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} />
                  Delivered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-3)" }} />
                  Delayed
                </span>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <DeliveriesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipment Status</CardTitle>
            <CardDescription>Active fleet-wide breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusDonut total={statusTotal} />
            <div className="space-y-2.5">
              {STATUS_BREAKDOWN.map((r) => (
                <div key={r.status} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.fill }} />
                  <span className="font-medium">{r.status}</span>
                  <span className="ms-auto text-muted-foreground tabular-nums">
                    {((r.count / statusTotal) * 100).toFixed(1)}%
                  </span>
                  <span className="w-12 text-right font-medium tabular-nums">
                    {r.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
          <CardDescription>Live loads across the network</CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.success("Shipments refreshed", {
                  description: "Showing the latest tracking data.",
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
                <TableHead className="pl-6">Shipment</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-6 font-medium tabular-nums whitespace-nowrap">
                    {s.id}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="font-medium">{s.origin}</span>
                      <IconArrowNarrowRight className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{s.destination}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${s.seed}`}
                          alt={s.driver}
                        />
                        <AvatarFallback>{initials(s.driver)}</AvatarFallback>
                      </Avatar>
                      <span className="whitespace-nowrap">{s.driver}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={shipmentBadge[s.status]}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">
                    {s.eta}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">{s.id} actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{s.id}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() =>
                            toast(`Tracking ${s.id}`, {
                              description: `${s.origin} to ${s.destination} · ETA ${s.eta}.`,
                            })
                          }
                        >
                          <IconCurrentLocation className="size-4" /> Track
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.success("Status update requested", {
                              description: `Driver ${s.driver} was pinged for ${s.id}.`,
                            })
                          }
                        >
                          <IconRefresh className="size-4" /> Update status
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Vehicles and assigned drivers</CardDescription>
            <CardAction>
              <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 dark:text-sky-400">
                {FLEET.filter((v) => v.status === "On Route").length} on route
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-1">
            {FLEET.map((v) => {
              const VIcon = vehicleIcon[v.type];
              const badge = fleetBadge[v.status];
              return (
                <div
                  key={v.id}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <VIcon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium tabular-nums">
                      {v.id}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {v.type}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{v.driver}</p>
                  </div>
                  <Badge variant="secondary" className={`gap-1.5 ${badge.cls}`}>
                    <span className={`size-1.5 rounded-full ${badge.dot}`} />
                    {v.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Routes</CardTitle>
            <CardDescription>By load volume this month</CardDescription>
            <CardAction>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IconRoute className="size-4.5" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {TOP_ROUTES.map((r) => (
              <div key={`${r.from}-${r.to}`} className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-medium">{r.from}</span>
                  <IconArrowNarrowRight className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{r.to}</span>
                  <span className="ms-auto text-muted-foreground tabular-nums">
                    {r.loads.toLocaleString()} loads
                  </span>
                </div>
                <Progress value={r.pct} className="h-1.5" />
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <IconClockHour4 className="size-4" /> Avg transit time
              </span>
              <span className="font-medium tabular-nums">2.4 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New shipment dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>New shipment</DialogTitle>
              <DialogDescription>
                Create a load and assign it to an available driver.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ship-origin">Origin</Label>
                  <Input
                    id="ship-origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Chicago"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-destination">Destination</Label>
                  <Input
                    id="ship-destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Denver"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ship-driver">Driver</Label>
                <Select value={driver} onValueChange={setDriver}>
                  <SelectTrigger id="ship-driver" className="w-full">
                    <SelectValue placeholder="Assign a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRIVERS.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        <Avatar className="size-5">
                          <AvatarImage
                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${d.seed}`}
                            alt={d.name}
                          />
                          <AvatarFallback>{initials(d.name)}</AvatarFallback>
                        </Avatar>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ship-eta">Estimated arrival</Label>
                <Input
                  id="ship-eta"
                  type="date"
                  value={eta}
                  min="2026-07-17"
                  onChange={(e) => setEta(e.target.value)}
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
                <IconTruckDelivery className="size-4" /> Create shipment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
