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
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconBed,
  IconBath,
  IconMapPin,
  IconCalendarEvent,
  IconClock,
  IconRefresh,
  IconTrophy,
  IconArrowUpRight,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";

// --- types -----------------------------------------------------------------

type PropertyType = "House" | "Apartment" | "Condo" | "Townhouse" | "Land";
type ListingStatus = "For Sale" | "Under Offer" | "Sold" | "Pending";

type Listing = {
  id: string;
  address: string;
  city: string;
  type: PropertyType;
  price: number;
  status: ListingStatus;
  agent: string;
  beds: number;
  baths: number;
  seed: string;
};

type Agent = {
  name: string;
  seed: string;
  deals: number;
  volume: number;
};

type Viewing = {
  id: string;
  property: string;
  client: string;
  date: string;
  time: string;
};

// --- inline demo data (deterministic) --------------------------------------

const PROPERTY_TYPES: PropertyType[] = [
  "House",
  "Apartment",
  "Condo",
  "Townhouse",
  "Land",
];

const AGENTS: Agent[] = [
  { name: "Ava Bennett", seed: "Ava", deals: 24, volume: 18_420_000 },
  { name: "Liam Carter", seed: "Liam", deals: 19, volume: 14_180_000 },
  { name: "Sofia Reyes", seed: "Sofia", deals: 17, volume: 12_760_000 },
  { name: "Noah Fisher", seed: "Noah", deals: 14, volume: 9_640_000 },
  { name: "Maya Patel", seed: "Maya", deals: 11, volume: 7_910_000 },
  { name: "Ethan Brooks", seed: "Ethan", deals: 9, volume: 6_120_000 },
];

const INITIAL_LISTINGS: Listing[] = [
  { id: "L-1042", address: "128 Maple Avenue", city: "Portland, OR", type: "House", price: 845_000, status: "For Sale", agent: "Ava Bennett", beds: 4, baths: 3, seed: "Maple" },
  { id: "L-1043", address: "42 Harbor View Loft", city: "Seattle, WA", type: "Apartment", price: 612_000, status: "Under Offer", agent: "Liam Carter", beds: 2, baths: 2, seed: "Harbor" },
  { id: "L-1044", address: "7 Birchwood Court", city: "Austin, TX", type: "House", price: 1_240_000, status: "For Sale", agent: "Sofia Reyes", beds: 5, baths: 4, seed: "Birch" },
  { id: "L-1045", address: "305 Sunset Condo #12", city: "Miami, FL", type: "Condo", price: 498_000, status: "Pending", agent: "Noah Fisher", beds: 2, baths: 2, seed: "Sunset" },
  { id: "L-1046", address: "19 Oakridge Townhomes", city: "Denver, CO", type: "Townhouse", price: 735_000, status: "Sold", agent: "Maya Patel", beds: 3, baths: 3, seed: "Oak" },
  { id: "L-1047", address: "Lot 8 Cedar Ridge", city: "Boise, ID", type: "Land", price: 265_000, status: "For Sale", agent: "Ethan Brooks", beds: 0, baths: 0, seed: "Cedar" },
  { id: "L-1048", address: "214 Willow Street", city: "Nashville, TN", type: "House", price: 689_000, status: "Under Offer", agent: "Ava Bennett", beds: 4, baths: 2, seed: "Willow" },
  { id: "L-1049", address: "88 Marina Bay Apt 5B", city: "San Diego, CA", type: "Apartment", price: 920_000, status: "For Sale", agent: "Liam Carter", beds: 3, baths: 2, seed: "Marina" },
  { id: "L-1050", address: "51 Aspen Grove", city: "Salt Lake City, UT", type: "Condo", price: 410_000, status: "Sold", agent: "Sofia Reyes", beds: 1, baths: 1, seed: "Aspen" },
];

const INITIAL_VIEWINGS: Viewing[] = [
  { id: "V-1", property: "128 Maple Avenue", client: "Grace Holloway", date: "Jul 18, 2026", time: "10:00 AM" },
  { id: "V-2", property: "42 Harbor View Loft", client: "Daniel Ortega", date: "Jul 18, 2026", time: "2:30 PM" },
  { id: "V-3", property: "7 Birchwood Court", client: "Priya Nair", date: "Jul 19, 2026", time: "11:15 AM" },
  { id: "V-4", property: "88 Marina Bay Apt 5B", client: "Marcus Lee", date: "Jul 20, 2026", time: "4:00 PM" },
  { id: "V-5", property: "214 Willow Street", client: "Chloe Adams", date: "Jul 21, 2026", time: "9:30 AM" },
];

// Sales volume closed per month across 2026 (dollars).
const SALES_VOLUME = [
  { month: "Jan", value: 2_140_000 },
  { month: "Feb", value: 2_580_000 },
  { month: "Mar", value: 3_120_000 },
  { month: "Apr", value: 2_860_000 },
  { month: "May", value: 3_610_000 },
  { month: "Jun", value: 4_240_000 },
  { month: "Jul", value: 3_920_000 },
];

const TYPE_COLORS: Record<PropertyType, string> = {
  House: "var(--chart-1)",
  Apartment: "var(--chart-2)",
  Condo: "var(--chart-3)",
  Townhouse: "var(--chart-4)",
  Land: "var(--chart-5)",
};

const STATUS_BADGE: Record<ListingStatus, string> = {
  "For Sale": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Under Offer": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Pending: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Sold: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

// Default room counts applied to a freshly added listing, by type.
const TYPE_DEFAULTS: Record<PropertyType, { beds: number; baths: number }> = {
  House: { beds: 3, baths: 2 },
  Apartment: { beds: 2, baths: 1 },
  Condo: { beds: 1, baths: 1 },
  Townhouse: { beds: 3, baths: 2 },
  Land: { beds: 0, baths: 0 },
};

// --- helpers ---------------------------------------------------------------

const salesConfig = {
  value: { label: "Sales", color: "var(--chart-1)" },
} satisfies ChartConfig;

const typeConfig = {
  value: { label: "Listings" },
} satisfies ChartConfig;

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
const propertyUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`;

const fmtFull = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtCompact = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${Math.round(n / 1_000)}K`
      : `$${n}`;

// --- page ------------------------------------------------------------------

export default function RealEstatePage() {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [addOpen, setAddOpen] = useState(false);

  const [address, setAddress] = useState("");
  const [ptype, setPtype] = useState<PropertyType>("House");
  const [price, setPrice] = useState("");
  const [agent, setAgent] = useState<string>(AGENTS[0].name);

  const nextId = useRef(1);

  const activeCount = useMemo(
    () => listings.filter((l) => l.status === "For Sale").length,
    [listings]
  );
  const underOfferCount = useMemo(
    () => listings.filter((l) => l.status === "Under Offer").length,
    [listings]
  );
  const avgPrice = useMemo(
    () =>
      listings.length
        ? listings.reduce((s, l) => s + l.price, 0) / listings.length
        : 0,
    [listings]
  );

  const salesThisMonth = SALES_VOLUME[SALES_VOLUME.length - 1].value;

  const typeBreakdown = useMemo(
    () =>
      PROPERTY_TYPES.map((t) => ({
        name: t,
        value: listings.filter((l) => l.type === t).length,
        fill: TYPE_COLORS[t],
      })).filter((d) => d.value > 0),
    [listings]
  );

  const stats = [
    {
      label: "Active Listings",
      value: String(activeCount),
      change: 6.4,
      trend: "up" as const,
      hint: "currently on market",
    },
    {
      label: "Under Offer",
      value: String(underOfferCount),
      change: 3.1,
      trend: "up" as const,
      hint: "in negotiation",
    },
    {
      label: "Avg. Price",
      value: fmtCompact(avgPrice),
      change: 2.8,
      trend: "up" as const,
      hint: "across all listings",
    },
    {
      label: "Sales (this month)",
      value: fmtCompact(salesThisMonth),
      change: 11.2,
      trend: "up" as const,
      hint: "July 2026",
    },
  ];

  const agentByName = useMemo(
    () => Object.fromEntries(AGENTS.map((a) => [a.name, a])),
    []
  );

  function openAdd() {
    setAddress("");
    setPtype("House");
    setPrice("");
    setAgent(AGENTS[0].name);
    setAddOpen(true);
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const addr = address.trim();
    const value = Math.max(0, Number(price) || 0);
    if (!addr) return toast.error("Enter a property address");
    if (value <= 0) return toast.error("Enter an asking price");
    const defaults = TYPE_DEFAULTS[ptype];
    const listing: Listing = {
      id: `L-N${nextId.current++}`,
      address: addr,
      city: "New listing",
      type: ptype,
      price: value,
      status: "For Sale",
      agent,
      beds: defaults.beds,
      baths: defaults.baths,
      seed: addr.replace(/\s+/g, "-").slice(0, 24) || "new",
    };
    setListings((prev) => [listing, ...prev]);
    setAddOpen(false);
    toast.success("Listing added", {
      description: `${addr} listed at ${fmtFull(value)}.`,
    });
  }

  function handleExport() {
    toast.success("Export started", {
      description: `Preparing ${listings.length} listings as CSV.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Real Estate"
        description="Listings, deals and agent performance."
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <IconDownload className="size-4" /> Export
        </Button>
        <Button size="sm" onClick={openAdd}>
          <IconPlus className="size-4" /> Add listing
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sales volume trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Volume</CardTitle>
            <CardDescription>Closed deal value by month, 2026</CardDescription>
            <CardAction>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                <IconArrowUpRight className="size-3.5" /> 11.2%
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={salesConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <AreaChart data={SALES_VOLUME} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
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
                  width={48}
                  domain={[0, "dataMax + 500000"]}
                  tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(v) => fmtFull(Number(v))}
                    />
                  }
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#fillSales)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Listings by type donut */}
        <Card>
          <CardHeader>
            <CardTitle>Listings by Type</CardTitle>
            <CardDescription>Portfolio mix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              config={typeConfig}
              className="mx-auto aspect-square h-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(v, name) =>
                        `${name}  ${v} listing${Number(v) === 1 ? "" : "s"}`
                      }
                    />
                  }
                />
                <Pie
                  data={typeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  strokeWidth={4}
                  paddingAngle={2}
                >
                  <ChartLabel
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {listings.length}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              Listings
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-2.5">
              {typeBreakdown.map((t) => (
                <div key={t.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.fill }}
                  />
                  <span className="font-medium">{t.name}</span>
                  <span className="ms-auto text-muted-foreground tabular-nums">
                    {((t.value / listings.length) * 100).toFixed(0)}%
                  </span>
                  <span className="w-8 text-right font-medium tabular-nums">
                    {t.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings table */}
      <Card>
        <CardHeader>
          <CardTitle>Listings</CardTitle>
          <CardDescription>{listings.length} properties on the books</CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.success("Listings refreshed", {
                  description: "Showing the latest market data.",
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
                <TableHead className="pl-6">Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Beds / Baths</TableHead>
                <TableHead className="pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((l) => {
                const ag = agentByName[l.agent];
                return (
                  <TableRow key={l.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={propertyUrl(l.seed)}
                          alt={l.address}
                          className="size-10 shrink-0 rounded-md border bg-muted object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-medium whitespace-nowrap">
                            {l.address}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <IconMapPin className="size-3" /> {l.city}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-slate-500/10 text-slate-600 dark:text-slate-400"
                      >
                        {l.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                      {fmtFull(l.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={STATUS_BADGE[l.status]}
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarImage
                            src={avatarUrl(ag?.seed ?? l.agent)}
                            alt={l.agent}
                          />
                          <AvatarFallback>{l.agent.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm whitespace-nowrap">
                          {l.agent}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {l.type === "Land" ? (
                        <span className="text-muted-foreground">n/a</span>
                      ) : (
                        <span className="inline-flex items-center justify-end gap-2.5 text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <IconBed className="size-4" /> {l.beds}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <IconBath className="size-4" /> {l.baths}
                          </span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">{l.address} actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              toast("Opening listing", {
                                description: l.address,
                              })
                            }
                          >
                            <IconEye className="size-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast("Editing listing", {
                                description: `${l.address} · ${fmtFull(l.price)}`,
                              })
                            }
                          >
                            <IconPencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success("Viewing scheduled", {
                                description: `Book a tour for ${l.address}.`,
                              })
                            }
                          >
                            <IconCalendarEvent className="size-4" /> Schedule viewing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top agents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Agents</CardTitle>
            <CardDescription>Ranked by closed volume this quarter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {AGENTS.map((a, i) => (
              <div
                key={a.name}
                className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                    i === 0
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i === 0 ? <IconTrophy className="size-3.5" /> : i + 1}
                </span>
                <Avatar>
                  <AvatarImage src={avatarUrl(a.seed)} alt={a.name} />
                  <AvatarFallback>{a.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground tabular-nums">
                    {a.deals} deals closed
                  </p>
                </div>
                <span className="shrink-0 text-right text-sm font-medium tabular-nums">
                  {fmtCompact(a.volume)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming viewings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Viewings</CardTitle>
            <CardDescription>Scheduled property tours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {INITIAL_VIEWINGS.map((v, i) => (
              <div key={v.id}>
                {i > 0 && <Separator className="my-1" />}
                <button
                  type="button"
                  onClick={() =>
                    toast("Viewing details", {
                      description: `${v.property} · ${v.client}`,
                    })
                  }
                  className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/40 text-[10px] leading-none text-muted-foreground">
                    <IconCalendarEvent className="size-4 text-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.property}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {v.client}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium whitespace-nowrap">
                      {v.date}
                    </p>
                    <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
                      <IconClock className="size-3" /> {v.time}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add listing dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle>Add listing</DialogTitle>
              <DialogDescription>
                List a new property on the market. It will appear as For Sale.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-address">Address</Label>
                <Input
                  id="add-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="128 Maple Avenue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-type">Type</Label>
                  <Select
                    value={ptype}
                    onValueChange={(v) => setPtype(v as PropertyType)}
                  >
                    <SelectTrigger id="add-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-price">Price (USD)</Label>
                  <Input
                    id="add-price"
                    type="number"
                    min={0}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="750000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-agent">Listing agent</Label>
                <Select value={agent} onValueChange={setAgent}>
                  <SelectTrigger id="add-agent" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENTS.map((a) => (
                      <SelectItem key={a.name} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <IconPlus className="size-4" /> Add listing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
