"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconCalendar,
  IconChevronDown,
  IconDownload,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconReportAnalytics,
  IconUsers,
  IconReceipt2,
  IconPackage,
  IconChartBar,
  IconDotsVertical,
  IconStar,
  IconPlayerPlay,
  IconShare,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { TrafficDonutChart } from "@/components/charts/traffic-donut-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  revenueByMonth,
  trafficSources,
  type StatCard as StatCardType,
} from "@/data";

const RANGES = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This quarter",
  "Year to date",
];

const barConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  profit: { label: "Profit", color: "var(--chart-2)" },
} satisfies ChartConfig;

const totalRevenue = revenueByMonth.reduce((a, b) => a + b.revenue, 0);
const totalOrders = revenueByMonth.reduce((a, b) => a + b.orders, 0);
const totalProfit = revenueByMonth.reduce((a, b) => a + b.profit, 0);
const totalRefunds = revenueByMonth.reduce(
  (a, b) => a + Math.round(b.revenue * 0.028),
  0
);

const kpis: StatCardType[] = [
  {
    label: "Total revenue",
    value: `$${totalRevenue.toLocaleString()}`,
    change: 14.2,
    trend: "up",
    hint: "vs. previous period",
  },
  {
    label: "Orders",
    value: totalOrders.toLocaleString(),
    change: 9.4,
    trend: "up",
    hint: "vs. previous period",
  },
  {
    label: "Net profit",
    value: `$${totalProfit.toLocaleString()}`,
    change: 11.8,
    trend: "up",
    hint: "vs. previous period",
  },
  {
    label: "Refund rate",
    value: "2.8%",
    change: 0.5,
    trend: "down",
    hint: "vs. previous period",
  },
];

const savedReports = [
  {
    id: "R-01",
    name: "Monthly revenue summary",
    description: "Revenue, orders and profit broken down by month",
    icon: IconReportAnalytics,
    cadence: "Monthly",
    updated: "Jul 1, 2026",
  },
  {
    id: "R-02",
    name: "Customer cohort retention",
    description: "Retention curves by signup cohort",
    icon: IconUsers,
    cadence: "Weekly",
    updated: "Jul 14, 2026",
  },
  {
    id: "R-03",
    name: "Refunds & disputes",
    description: "Refund volume, reasons and chargebacks",
    icon: IconReceipt2,
    cadence: "Weekly",
    updated: "Jul 12, 2026",
  },
  {
    id: "R-04",
    name: "Top products by margin",
    description: "Best sellers ranked by contribution profit",
    icon: IconPackage,
    cadence: "On demand",
    updated: "Jun 28, 2026",
  },
  {
    id: "R-05",
    name: "Traffic & conversion",
    description: "Sessions through the signup funnel",
    icon: IconChartBar,
    cadence: "Daily",
    updated: "Jul 16, 2026",
  },
];

const cadenceStyles: Record<string, string> = {
  Daily: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Weekly: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Monthly: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "On demand": "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export default function ReportsPage() {
  const [range, setRange] = useState("Last 90 days");

  const monthly = useMemo(
    () =>
      revenueByMonth.map((m) => {
        const refunds = Math.round(m.revenue * 0.028);
        return {
          month: m.month,
          revenue: m.revenue,
          orders: m.orders,
          refunds,
          profit: m.profit,
          margin: m.profit / m.revenue,
        };
      }),
    []
  );

  const totals = useMemo(
    () => ({
      revenue: totalRevenue,
      orders: totalOrders,
      refunds: totalRefunds,
      profit: totalProfit,
      margin: totalProfit / totalRevenue,
    }),
    []
  );

  function handleExport(format: "CSV" | "PDF") {
    toast.success(`Exported to ${format}`, {
      description: `Report for “${range}” is downloading.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Build, schedule and export reports across your business."
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconCalendar className="size-4" /> {range}
              <IconChevronDown className="size-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={range}
              onValueChange={(v) => {
                setRange(v);
                toast.success("Date range updated", { description: v });
              }}
            >
              {RANGES.map((r) => (
                <DropdownMenuRadioItem key={r} value={r}>
                  {r}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <IconDownload className="size-4" /> Export
              <IconChevronDown className="size-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleExport("CSV")}>
              <IconFileTypeCsv className="size-4" /> Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport("PDF")}>
              <IconFileTypePdf className="size-4" /> Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs. profit</CardTitle>
            <CardDescription>
              Monthly gross revenue and net profit for {range.toLowerCase()}
            </CardDescription>
            <CardAction>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                +14.2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <BarChart data={revenueByMonth} margin={{ left: 4, right: 8, top: 8 }}>
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
                  width={44}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by source</CardTitle>
            <CardDescription>Attributed channel mix</CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficDonutChart />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            {trafficSources.map((t) => (
              <div key={t.source} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: t.fill }}
                />
                <span className="text-muted-foreground">{t.source}</span>
                <span className="ml-auto font-medium tabular-nums">
                  {t.value.toLocaleString()}
                </span>
              </div>
            ))}
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Saved reports */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Saved reports</CardTitle>
            <CardDescription>Pinned and scheduled reports</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() =>
                  toast.success("New report", {
                    description: "Starting from a blank template.",
                  })
                }
              >
                <IconStar className="size-4" />
                <span className="sr-only">Create report</span>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-1">
            {savedReports.map((r) => (
              <div
                key={r.id}
                className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <r.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cadenceStyles[r.cadence]}
                  >
                    {r.cadence}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <IconDotsVertical className="size-4" />
                        <span className="sr-only">{r.name} options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() =>
                          toast.success("Running report", {
                            description: `${r.name} · ${range}`,
                          })
                        }
                      >
                        <IconPlayerPlay className="size-4" /> Run now
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          toast.success("Exported to CSV", {
                            description: r.name,
                          })
                        }
                      >
                        <IconDownload className="size-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() =>
                          toast.success("Share link copied", {
                            description: r.name,
                          })
                        }
                      >
                        <IconShare className="size-4" /> Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detailed monthly breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly breakdown</CardTitle>
            <CardDescription>
              Revenue, orders, refunds and profit per month
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Month</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Refunds</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="pr-6 text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthly.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell className="pl-6 font-medium">{m.month}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        ${m.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {m.orders.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        ${m.refunds.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        ${m.profit.toLocaleString()}
                      </TableCell>
                      <TableCell className="pr-6 text-right tabular-nums text-muted-foreground">
                        {(m.margin * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 bg-muted/40 font-medium hover:bg-muted/40">
                    <TableCell className="pl-6">Total</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${totals.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {totals.orders.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${totals.refunds.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${totals.profit.toLocaleString()}
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">
                      {(totals.margin * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
