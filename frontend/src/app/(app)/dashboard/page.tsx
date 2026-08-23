"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconArrowUpRight,
  IconDownload,
  IconPlus,
  IconDotsVertical,
  IconRefresh,
  IconPhoto,
  IconReportAnalytics,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  overviewStats,
  recentActivity,
  topProducts,
  trafficSources,
  orders,
} from "@/data";

function ChartMenu({ title }: { title: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">{title} options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false);

  function handleExport() {
    toast.success("Exported to CSV", {
      description: "Your dashboard summary is downloading.",
    });
  }

  function handleAddWidget(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = (data.get("name") as string)?.trim() || "New widget";
    setAddOpen(false);
    toast.success("Widget added", {
      description: `“${name}” was pinned to your dashboard.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Alex 👋"
        description="Here's what's happening with your business today."
      >
        <Button variant="outline" onClick={handleExport}>
          <IconDownload className="size-4" /> Export
        </Button>
        <Button onClick={() => setAddOpen(true)}>
          <IconPlus className="size-4" /> Add widget
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue and profit for the past year
            </CardDescription>
            <CardAction>
              <ChartMenu title="Revenue Overview" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart />
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
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions from your store</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders">
                  View all <IconArrowUpRight className="size-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 6).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarImage src={o.avatar} alt={o.customer} />
                          <AvatarFallback>{o.customer.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{o.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.product}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium tabular-nums">
                      ${o.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best sellers by revenue this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {topProducts
              .map((p) => ({ ...p, revenue: p.price * p.sold }))
              .sort((a, b) => b.revenue - a.revenue)
              .map((p, i) => {
              const trend = [18.2, 12.4, 9.6, 6.1, 4.3][i] ?? 3;
              return (
                <div
                  key={p.id}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <span className="w-4 shrink-0 text-center text-sm font-medium text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-md border bg-muted object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.category} · {p.sold.toLocaleString()} sold
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium tabular-nums">
                      ${p.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                      +{trend}%
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>What your team has been up to</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-5 border-l pl-6">
            {recentActivity.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[31px] top-0.5">
                  <Avatar className="size-6 ring-4 ring-background">
                    <AvatarImage src={a.avatar} alt={a.user} />
                    <AvatarFallback>{a.user.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </span>
                <p className="text-sm">
                  <span className="font-medium">{a.user}</span> {a.action}{" "}
                  {a.target && <span className="font-medium">{a.target}</span>}
                </p>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleAddWidget}>
            <DialogHeader>
              <DialogTitle>Add a widget</DialogTitle>
              <DialogDescription>
                Choose a widget to pin to your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="widget-name">Widget name</Label>
                <Input
                  id="widget-name"
                  name="name"
                  placeholder="e.g. Weekly signups"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widget-type">Type</Label>
                <Select name="type" defaultValue="metric">
                  <SelectTrigger id="widget-type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric card</SelectItem>
                    <SelectItem value="line">Line chart</SelectItem>
                    <SelectItem value="bar">Bar chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
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
                <IconPlus className="size-4" /> Add widget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Refunded: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    Failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <Badge variant="secondary" className={map[status]}>
      {status}
    </Badge>
  );
}
