"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconAt,
  IconMessage2,
  IconArrowRight,
  IconUserPlus,
  IconRocket,
  IconCircleCheck,
  IconStar,
  IconPlus,
  IconReceipt,
  IconLogin,
  IconFlag,
  IconCreditCard,
  IconAlertTriangle,
  IconSearch,
  IconChecks,
  IconActivity,
  IconTrendingUp,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { team } from "@/data";

type TablerIcon = React.ComponentType<{ className?: string }>;
type Category = "comment" | "task" | "billing" | "system";
type Group = "today" | "yesterday" | "week";

type Actor = { name: string; avatar: string };

type Event = {
  id: string;
  group: Group;
  category: Category;
  actor?: Actor;
  lead?: string;
  icon: TablerIcon;
  message: string;
  target?: string;
  href?: string;
  meta?: string;
  time: string;
};

const categoryMeta: Record<
  Category,
  { label: string; dot: string; icon: string; badge: string; text: string }
> = {
  comment: {
    label: "Comments",
    dot: "bg-violet-500",
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500 text-white",
    text: "text-violet-600 dark:text-violet-400",
  },
  task: {
    label: "Tasks",
    dot: "bg-blue-500",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500 text-white",
    text: "text-blue-600 dark:text-blue-400",
  },
  billing: {
    label: "Billing",
    dot: "bg-emerald-500",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500 text-white",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  system: {
    label: "System",
    dot: "bg-slate-400 dark:bg-slate-500",
    icon: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    badge: "bg-slate-500 text-white",
    text: "text-slate-600 dark:text-slate-400",
  },
};

// Actors sourced from the team directory (deterministic — no Math.random).
const tm = (i: number): Actor => ({ name: team[i].name, avatar: team[i].avatar });
const olivia: Actor = { name: "Olivia Patel", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5" };
const ava: Actor = { name: "Ava Brooks", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9" };

const events: Event[] = [
  // ---- Today ----
  {
    id: "e1",
    group: "today",
    category: "comment",
    actor: tm(3),
    icon: IconAt,
    message: "mentioned you in",
    target: "Mobile App Revamp",
    href: "/apps",
    time: "12 min ago",
  },
  {
    id: "e2",
    group: "today",
    category: "task",
    actor: tm(2),
    icon: IconArrowRight,
    message: "moved to In Review —",
    target: "Implement metered usage events",
    href: "/apps",
    time: "40 min ago",
  },
  {
    id: "e3",
    group: "today",
    category: "billing",
    lead: "Payment received",
    icon: IconCreditCard,
    message: "for",
    target: "INV-2043",
    href: "/invoices",
    meta: "from Northwind · $1,296.00",
    time: "1 hour ago",
  },
  {
    id: "e4",
    group: "today",
    category: "task",
    actor: tm(0),
    icon: IconUserPlus,
    message: "assigned Emma Novak to",
    target: "Add SSO / SAML provisioning",
    href: "/apps",
    time: "2 hours ago",
  },
  {
    id: "e5",
    group: "today",
    category: "system",
    lead: "Deployment succeeded",
    icon: IconRocket,
    message: "",
    target: "web-app v2.14.0",
    href: "#",
    meta: "deployed to production · 3m 12s",
    time: "2 hours ago",
  },
  {
    id: "e6",
    group: "today",
    category: "comment",
    actor: tm(1),
    icon: IconMessage2,
    message: "commented on",
    target: "Website Redesign",
    href: "/apps",
    time: "3 hours ago",
  },
  {
    id: "e7",
    group: "today",
    category: "task",
    actor: tm(5),
    icon: IconCircleCheck,
    message: "completed",
    target: "Audit accessibility (WCAG AA)",
    href: "/apps",
    time: "4 hours ago",
  },
  // ---- Yesterday ----
  {
    id: "e8",
    group: "yesterday",
    category: "comment",
    actor: olivia,
    icon: IconStar,
    message: "left a 5-star review on",
    target: "Pulse Watch",
    href: "/products",
    time: "4:20 PM",
  },
  {
    id: "e9",
    group: "yesterday",
    category: "task",
    actor: tm(6),
    icon: IconPlus,
    message: "created",
    target: "Set up dbt staging models",
    href: "/apps",
    meta: "in Data Warehouse",
    time: "2:10 PM",
  },
  {
    id: "e10",
    group: "yesterday",
    category: "billing",
    lead: "Invoice sent",
    icon: IconReceipt,
    message: "",
    target: "INV-2048",
    href: "/invoices",
    meta: "to Aperture · due Aug 12",
    time: "11:05 AM",
  },
  {
    id: "e11",
    group: "yesterday",
    category: "system",
    lead: "New sign-in detected",
    icon: IconLogin,
    message: "from Chrome on macOS in San Francisco",
    time: "9:30 AM",
  },
  {
    id: "e12",
    group: "yesterday",
    category: "task",
    actor: tm(4),
    icon: IconFlag,
    message: "closed milestone",
    target: "Design sign-off",
    href: "/apps",
    meta: "in Billing Platform v2",
    time: "8:15 AM",
  },
  // ---- This week ----
  {
    id: "e13",
    group: "week",
    category: "comment",
    actor: tm(2),
    icon: IconMessage2,
    message: "commented on",
    target: "Add SSO / SAML provisioning",
    href: "/apps",
    time: "Mon 5:42 PM",
  },
  {
    id: "e14",
    group: "week",
    category: "task",
    actor: tm(8),
    icon: IconArrowRight,
    message: "moved to In Progress —",
    target: "Write API rate-limit middleware",
    href: "/apps",
    time: "Mon 1:18 PM",
  },
  {
    id: "e15",
    group: "week",
    category: "billing",
    lead: "Payment received",
    icon: IconCreditCard,
    message: "for",
    target: "INV-2045",
    href: "/invoices",
    meta: "from Vertex Labs · $2,430.00",
    time: "Sun 6:02 PM",
  },
  {
    id: "e16",
    group: "week",
    category: "system",
    lead: "Storage at 82%",
    icon: IconAlertTriangle,
    message: "your workspace is approaching its storage limit",
    time: "Sun 10:11 AM",
  },
  {
    id: "e17",
    group: "week",
    category: "comment",
    actor: tm(5),
    icon: IconAt,
    message: "mentioned you about the",
    target: "Q3 roadmap",
    href: "/apps",
    time: "Sat 3:26 PM",
  },
  {
    id: "e18",
    group: "week",
    category: "task",
    actor: ava,
    icon: IconUserPlus,
    message: "invited a teammate to",
    target: "Vertex Labs",
    href: "/team",
    time: "Sat 9:04 AM",
  },
];

const groupLabels: Record<Group, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
};
const groupOrder: Group[] = ["today", "yesterday", "week"];

const filters: { value: "all" | Category; label: string; icon?: TablerIcon }[] = [
  { value: "all", label: "All" },
  { value: "comment", label: "Comments", icon: IconMessage2 },
  { value: "task", label: "Tasks", icon: IconCircleCheck },
  { value: "billing", label: "Billing", icon: IconCreditCard },
  { value: "system", label: "System", icon: IconAlertTriangle },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [search, setSearch] = useState("");
  const [allRead, setAllRead] = useState(false);

  const markAllRead = () => {
    setAllRead(true);
    toast.success("You're all caught up", {
      description: "All activity has been marked as read.",
    });
  };

  const counts = useMemo(() => {
    const base: Record<"all" | Category, number> = {
      all: events.length,
      comment: 0,
      task: 0,
      billing: 0,
      system: 0,
    };
    for (const e of events) base[e.category] += 1;
    return base;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchesFilter = filter === "all" || e.category === filter;
      const haystack = [e.actor?.name, e.lead, e.message, e.target, e.meta]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const grouped = useMemo(
    () =>
      groupOrder
        .map((g) => ({
          group: g,
          items: filtered.filter((e) => e.group === g),
        }))
        .filter((g) => g.items.length > 0),
    [filtered]
  );

  const contributors = useMemo(() => {
    const map = new Map<string, { actor: Actor; count: number }>();
    for (const e of events) {
      if (!e.actor) continue;
      const existing = map.get(e.actor.name);
      if (existing) existing.count += 1;
      else map.set(e.actor.name, { actor: e.actor, count: 1 });
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Everything happening across your workspace, in one feed."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          disabled={allRead}
        >
          <IconChecks className="size-4" /> {allRead ? "All read" : "Mark all read"}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* MAIN */}
        <div className="space-y-4 lg:col-span-2">
          {/* Toolbar */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => {
                const active = filter === f.value;
                return (
                  <Button
                    key={f.value}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f.value)}
                  >
                    {f.icon && <f.icon className="size-4" />}
                    {f.label}
                    <span
                      className={cn(
                        "ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                        active ? "bg-primary-foreground/15" : "bg-muted"
                      )}
                    >
                      {counts[f.value]}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <Card>
            <CardContent className="space-y-8">
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <IconActivity className="mb-3 size-8 text-muted-foreground opacity-50" />
                  <p className="text-sm font-medium">No activity found</p>
                  <p className="text-sm text-muted-foreground">
                    Try a different filter or search term.
                  </p>
                </div>
              ) : (
                grouped.map(({ group, items }) => (
                  <div key={group} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {groupLabels[group]}
                      </h2>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {items.length}
                      </span>
                      <Separator className="flex-1" />
                    </div>

                    <ol className="relative space-y-6 border-l pl-8">
                      {items.map((e) => {
                        const meta = categoryMeta[e.category];
                        const Icon = e.icon;
                        return (
                          <li key={e.id} className="relative">
                            {/* Node */}
                            <span className="absolute -left-12 top-0">
                              {e.actor ? (
                                <span className="relative inline-flex">
                                  <Avatar className="size-8 ring-4 ring-card">
                                    <AvatarImage
                                      src={e.actor.avatar}
                                      alt={e.actor.name}
                                    />
                                    <AvatarFallback>
                                      {initials(e.actor.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span
                                    className={cn(
                                      "absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full ring-2 ring-card",
                                      meta.badge
                                    )}
                                  >
                                    <Icon className="size-2.5" />
                                  </span>
                                </span>
                              ) : (
                                <span
                                  className={cn(
                                    "flex size-8 items-center justify-center rounded-full ring-4 ring-card",
                                    meta.icon
                                  )}
                                >
                                  <Icon className="size-4" />
                                </span>
                              )}
                            </span>

                            {/* Body */}
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                              <p className="text-sm leading-relaxed">
                                <span className="font-medium">
                                  {e.actor ? e.actor.name : e.lead}
                                </span>{" "}
                                {e.message && (
                                  <span className="text-muted-foreground">
                                    {e.message}{" "}
                                  </span>
                                )}
                                {e.target &&
                                  (e.href ? (
                                    <Link
                                      href={e.href}
                                      className="font-medium text-foreground hover:underline"
                                    >
                                      {e.target}
                                    </Link>
                                  ) : (
                                    <span className="font-medium">
                                      {e.target}
                                    </span>
                                  ))}
                                {e.meta && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    {e.meta}
                                  </span>
                                )}
                              </p>
                              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                {e.time}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconActivity className="size-4" /> Activity summary
              </CardTitle>
              <CardDescription>Last 7 days across your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {events.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total events</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <IconTrendingUp className="size-3.5" />
                  18%
                </span>
              </div>

              <Separator />

              <div className="space-y-4">
                {(Object.keys(categoryMeta) as Category[]).map((c) => {
                  const meta = categoryMeta[c];
                  const value = counts[c];
                  const pct = Math.round((value / events.length) * 100);
                  return (
                    <div key={c} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={cn("size-2.5 rounded-full", meta.dot)} />
                        <span className="text-muted-foreground">
                          {meta.label}
                        </span>
                        <span className="ml-auto font-medium tabular-nums">
                          {value}
                        </span>
                        <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
                          {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top contributors</CardTitle>
              <CardDescription>Most active teammates this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contributors.map(({ actor, count }) => (
                <div key={actor.name} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={actor.avatar} alt={actor.name} />
                    <AvatarFallback>{initials(actor.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{actor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "action" : "actions"}
                    </p>
                  </div>
                  <Progress
                    value={(count / contributors[0].count) * 100}
                    className="h-1.5 w-16"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
