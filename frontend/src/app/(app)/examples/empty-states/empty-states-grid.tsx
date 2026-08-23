"use client";

import { toast } from "sonner";
import {
  IconSearch,
  IconFolderPlus,
  IconInbox,
  IconBellOff,
  IconServerOff,
  IconPlugConnected,
  IconPlus,
  IconRefresh,
  IconMessageCircle,
  IconSettings,
  IconLifebuoy,
  IconArrowRight,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Action = { label: string; icon?: React.ComponentType<{ className?: string }> };

type EmptyStateDef = {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  title: string;
  description: string;
  primary: Action;
  secondary?: Action;
};

const states: EmptyStateDef[] = [
  {
    icon: IconSearch,
    tint: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    title: "No results found",
    description:
      "We couldn't find anything matching “quarterly-forecast”. Try a different term or clear your filters.",
    primary: { label: "Clear search", icon: IconRefresh },
    secondary: { label: "Browse all" },
  },
  {
    icon: IconFolderPlus,
    tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    title: "No projects yet",
    description:
      "Projects keep your tasks, files and milestones together. Create your first one to get started.",
    primary: { label: "New project", icon: IconPlus },
    secondary: { label: "Import" },
  },
  {
    icon: IconInbox,
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    title: "Inbox zero",
    description:
      "You're all caught up — there are no messages that need your attention right now. Nice work.",
    primary: { label: "Compose", icon: IconMessageCircle },
    secondary: { label: "View archive" },
  },
  {
    icon: IconBellOff,
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    title: "No notifications",
    description:
      "When something needs your attention — mentions, assignments or deploys — it'll show up here.",
    primary: { label: "Notification settings", icon: IconSettings },
  },
  {
    icon: IconServerOff,
    tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    title: "Something went wrong",
    description:
      "We couldn't load this data. This is usually temporary — try again in a moment.",
    primary: { label: "Try again", icon: IconRefresh },
    secondary: { label: "Contact support", icon: IconLifebuoy },
  },
  {
    icon: IconPlugConnected,
    tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    title: "No integrations connected",
    description:
      "Connect your favorite tools to sync data automatically and keep everything in one place.",
    primary: { label: "Browse integrations", icon: IconArrowRight },
    secondary: { label: "Learn more" },
  },
];

export function EmptyStatesGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {states.map((s) => (
        <EmptyState key={s.title} {...s} />
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  tint,
  title,
  description,
  primary,
  secondary,
}: EmptyStateDef) {
  const fire = (label: string) => () =>
    toast(label, { description: "Demo action — wired for preview." });

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-full ${tint}`}
        >
          <Icon className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-medium tracking-tight">{title}</h3>
          <p className="mx-auto max-w-[30ch] text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button size="sm" onClick={fire(primary.label)}>
            {primary.icon && <primary.icon className="size-4" />}
            {primary.label}
          </Button>
          {secondary && (
            <Button size="sm" variant="outline" onClick={fire(secondary.label)}>
              {secondary.icon && <secondary.icon className="size-4" />}
              {secondary.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
