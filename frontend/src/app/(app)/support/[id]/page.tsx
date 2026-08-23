import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft,
  IconMessageCircle,
  IconMail,
  IconBuilding,
  IconFlag,
  IconProgress,
  IconCategory,
  IconUser,
  IconCalendarPlus,
  IconClockHour4,
  IconTag,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  tickets,
  getTicketById,
  type TicketPriority,
  type TicketStatus,
} from "../tickets-data";
import { ReplyBox } from "./reply-box";

export const metadata = { title: "Ticket" };

const priorityStyles: Record<TicketPriority, string> = {
  Low: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Medium: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  High: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Urgent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Closed: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateStaticParams() {
  return tickets.map((t) => ({ id: t.id }));
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = getTicketById(id);
  if (!ticket) notFound();

  const details: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: React.ReactNode;
  }[] = [
    {
      icon: IconFlag,
      label: "Priority",
      value: (
        <Badge variant="secondary" className={priorityStyles[ticket.priority]}>
          {ticket.priority}
        </Badge>
      ),
    },
    {
      icon: IconProgress,
      label: "Status",
      value: (
        <Badge variant="secondary" className={statusStyles[ticket.status]}>
          {ticket.status}
        </Badge>
      ),
    },
    { icon: IconCategory, label: "Category", value: ticket.category },
    { icon: IconUser, label: "Assignee", value: ticket.assignee },
    {
      icon: IconCalendarPlus,
      label: "Created",
      value: formatDate(ticket.created),
    },
    {
      icon: IconClockHour4,
      label: "Last updated",
      value: formatDate(ticket.updated),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link href="/support">
          <IconArrowLeft className="size-4" /> Back to support
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {ticket.subject}
            </h1>
            <Badge variant="secondary" className={priorityStyles[ticket.priority]}>
              {ticket.priority}
            </Badge>
            <Badge variant="secondary" className={statusStyles[ticket.status]}>
              {ticket.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">
            {ticket.id} · Opened {formatDate(ticket.created)} ·{" "}
            {ticket.category}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — conversation */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconMessageCircle className="size-4" /> Conversation
                <span className="text-sm font-normal text-muted-foreground">
                  · {ticket.messages.length} messages
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.messages.map((m) => {
                const isAgent = m.role === "agent";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-3",
                      isAgent && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={m.avatar} alt={m.author} />
                      <AvatarFallback>{m.author.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "min-w-0 max-w-[85%] space-y-1.5",
                        isAgent && "flex flex-col items-end"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.author}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-1.5 py-0 text-[10px] font-medium",
                            isAgent
                              ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {isAgent ? "Agent" : "Customer"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {m.time}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed",
                          isAgent
                            ? "rounded-tr-sm bg-primary/5 border-primary/10"
                            : "rounded-tl-sm bg-muted/50"
                        )}
                      >
                        {m.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <ReplyBox
            ticketId={ticket.id}
            agentName={
              ticket.assignee === "Unassigned" ? "Support" : ticket.assignee
            }
            agentAvatar={ticket.assigneeAvatar}
          />
        </div>

        {/* RIGHT — meta */}
        <div className="space-y-6">
          {/* Requester */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Requester</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage
                    src={ticket.requesterAvatar}
                    alt={ticket.requester}
                  />
                  <AvatarFallback>{ticket.requester.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{ticket.requester}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {ticket.company}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <IconMail className="size-4 shrink-0" />
                  <span className="truncate">{ticket.requesterEmail}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <IconBuilding className="size-4 shrink-0" />
                  <span className="truncate">{ticket.company}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`mailto:${ticket.requesterEmail}`}>
                  <IconMail className="size-4" /> Email customer
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3.5">
                {details.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <d.icon className="size-4" /> {d.label}
                    </dt>
                    <dd className="text-sm font-medium">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconTag className="size-4" /> Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {ticket.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
