"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconCalendar,
  IconChevronDown,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDownload,
  IconDotsVertical,
  IconRefresh,
  IconPhoto,
  IconReportAnalytics,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { AnalyticsLineChart } from "@/components/charts/analytics-line-chart";
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
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trafficSources, type StatCard as StatCardType } from "@/data";

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"];

function ChartMenu({ title }: { title: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">{title} options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() =>
            toast.success(`${title} refreshed`, {
              description: "Showing the latest available data.",
            })
          }
        >
          <IconRefresh className="size-4" /> Refresh
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            toast.success("Chart exported", {
              description: `${title} was saved as a PNG image.`,
            })
          }
        >
          <IconPhoto className="size-4" /> Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            toast("Opening full report", {
              description: `Preparing a detailed ${title.toLowerCase()} report.`,
            })
          }
        >
          <IconReportAnalytics className="size-4" /> View full report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const stats: StatCardType[] = [
  { label: "Sessions", value: "94,271", change: 11.4, trend: "up", hint: "vs. last 30 days" },
  { label: "Users", value: "62,840", change: 7.8, trend: "up", hint: "vs. last 30 days" },
  { label: "Bounce Rate", value: "38.2%", change: 2.1, trend: "down", hint: "vs. last 30 days" },
  { label: "Avg. Session", value: "3m 42s", change: 4.6, trend: "up", hint: "vs. last 30 days" },
];

const topPages = [
  { path: "/", views: 28412, unique: 21048, bounce: "32%" },
  { path: "/pricing", views: 18934, unique: 14620, bounce: "41%" },
  { path: "/blog/scaling-teams", views: 12760, unique: 10380, bounce: "28%" },
  { path: "/features", views: 9840, unique: 7210, bounce: "45%" },
  { path: "/docs/getting-started", views: 8120, unique: 6540, bounce: "22%" },
  { path: "/changelog", views: 5310, unique: 4180, bounce: "36%" },
];

const devices = [
  { label: "Desktop", value: 54, icon: IconDeviceDesktop },
  { label: "Mobile", value: 38, icon: IconDeviceMobile },
  { label: "Tablet", value: 8, icon: IconDeviceTablet },
];

const countries = [
  { name: "United States", flag: "🇺🇸", share: 42, visitors: "26,392" },
  { name: "United Kingdom", flag: "🇬🇧", share: 18, visitors: "11,311" },
  { name: "Germany", flag: "🇩🇪", share: 12, visitors: "7,540" },
  { name: "Canada", flag: "🇨🇦", share: 9, visitors: "5,655" },
  { name: "Australia", flag: "🇦🇺", share: 7, visitors: "4,398" },
  { name: "France", flag: "🇫🇷", share: 6, visitors: "3,770" },
  { name: "Japan", flag: "🇯🇵", share: 6, visitors: "3,774" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("Last 30 days");

  function handleExport() {
    toast.success("Exported to CSV", {
      description: `Analytics for “${range}” is downloading.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Traffic and engagement across your web properties."
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
        <Button size="sm" onClick={handleExport}>
          <IconDownload className="size-4" /> Export
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
            <CardTitle>Visitors Trend</CardTitle>
            <CardDescription>
              Daily visitors and page views over the last 30 days
            </CardDescription>
            <CardAction>
              <ChartMenu title="Visitors Trend" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <AnalyticsLineChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages this period</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Page</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Unique</TableHead>
                  <TableHead className="pr-6 text-right">Bounce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.map((p) => (
                  <TableRow key={p.path}>
                    <TableCell className="pl-6 font-medium">{p.path}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {p.unique.toLocaleString()}
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums text-muted-foreground">
                      {p.bounce}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Sessions by device type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {devices.map((d) => (
              <div key={d.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <d.icon className="size-4 text-muted-foreground" />
                    {d.label}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {d.value}%
                  </span>
                </div>
                <Progress value={d.value} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitors by Country</CardTitle>
          <CardDescription>Top locations by session volume</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {countries.map((c) => (
            <div key={c.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-base leading-none">{c.flag}</span>
                  {c.name}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {c.visitors}
                </span>
              </div>
              <Progress value={c.share} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
