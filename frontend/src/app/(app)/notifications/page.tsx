"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconAt,
  IconMessageCircle,
  IconUserPlus,
  IconShieldCheck,
  IconCreditCard,
  IconRocket,
  IconChecks,
  IconSettings,
  IconDots,
  IconCircleCheck,
  IconCircleDot,
  IconTrash,
  IconBellRinging,
  IconBellOff,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { notifications, type Notification, type NotificationKind } from "@/data";

const kindConfig: Record<
  NotificationKind,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  mention: {
    icon: IconAt,
    tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  comment: {
    icon: IconMessageCircle,
    tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  assign: {
    icon: IconUserPlus,
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  system: {
    icon: IconShieldCheck,
    tint: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
  billing: {
    icon: IconCreditCard,
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  deploy: {
    icon: IconRocket,
    tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

type TabValue = "all" | "unread" | "mentions" | "system";

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tint)}>
          <Icon className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(notifications);
  const [tab, setTab] = useState<TabValue>("all");

  const counts = useMemo(() => {
    return {
      all: items.length,
      unread: items.filter((n) => !n.read).length,
      mentions: items.filter((n) => n.kind === "mention").length,
      system: items.filter((n) => n.kind === "system").length,
    };
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((n) => {
      if (tab === "unread") return !n.read;
      if (tab === "mentions") return n.kind === "mention";
      if (tab === "system") return n.kind === "system";
      return true;
    });
  }, [items, tab]);

  const markAll = () => {
    if (counts.unread === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const setRead = (id: string, read: boolean) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));

  const remove = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification removed");
  };

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "unread", label: "Unread", count: counts.unread },
    { value: "mentions", label: "Mentions", count: counts.mentions },
    { value: "system", label: "System", count: counts.system },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Mentions, comments and system activity across your workspace."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={markAll}
          disabled={counts.unread === 0}
        >
          <IconChecks className="size-4" /> Mark all as read
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notification settings"
          asChild
        >
          <Link href="/settings">
            <IconSettings className="size-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={IconBellRinging}
          label="Unread"
          value={counts.unread}
          tint="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatTile
          icon={IconAt}
          label="Mentions"
          value={counts.mentions}
          tint="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatTile
          icon={IconShieldCheck}
          label="System"
          value={counts.system}
          tint="bg-slate-500/10 text-slate-600 dark:text-slate-400"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="overflow-x-auto">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
              <TabsList>
                {tabs.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                    <span className="ml-1 rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">
                      {t.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="px-2">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <IconBellOff className="size-7 opacity-50" />
              <p className="text-sm">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {visible.map((n) => {
                const cfg = kindConfig[n.kind];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "group relative flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50",
                      !n.read && "bg-muted/40"
                    )}
                  >
                    {!n.read && (
                      <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                    )}

                    <div className="relative shrink-0">
                      {n.actor ? (
                        <>
                          <Avatar className="size-9">
                            <AvatarImage src={n.actor.avatar} alt={n.actor.name} />
                            <AvatarFallback>{initials(n.actor.name)}</AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              "absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full ring-2 ring-card",
                              cfg.tint
                            )}
                          >
                            <Icon className="size-3" />
                          </span>
                        </>
                      ) : (
                        <span
                          className={cn(
                            "grid size-9 place-items-center rounded-full",
                            cfg.tint
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm",
                            n.read ? "font-medium" : "font-semibold"
                          )}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {n.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.time}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                        >
                          <IconDots className="size-4" />
                          <span className="sr-only">Notification actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {n.read ? (
                          <DropdownMenuItem onSelect={() => setRead(n.id, false)}>
                            <IconCircleDot className="size-4" /> Mark as unread
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onSelect={() => setRead(n.id, true)}>
                            <IconCircleCheck className="size-4" /> Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => remove(n.id)}
                        >
                          <IconTrash className="size-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
