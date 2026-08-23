"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconPlus,
  IconSearch,
  IconTicket,
  IconClockPause,
  IconCircleCheck,
  IconClockHour4,
  IconInbox,
  IconDotsVertical,
  IconEye,
  IconUserPlus,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/data";
import {
  tickets as seedTickets,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "./tickets-data";

const TODAY = "2026-07-17";

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
    month: "short",
    day: "numeric",
  });
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

const TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Pending", label: "Pending" },
  { value: "Resolved", label: "Resolved" },
];

export default function SupportPage() {
  const [rows, setRows] = useState<Ticket[]>(seedTickets);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newSeq, setNewSeq] = useState(0);

  const stats = useMemo(() => {
    const openCount = rows.filter((t) => t.status === "Open").length;
    const pendingCount = rows.filter((t) => t.status === "Pending").length;
    const resolvedToday = rows.filter(
      (t) => t.status === "Resolved" && t.updated === TODAY
    ).length;
    return { openCount, pendingCount, resolvedToday };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((t) => {
      const matchesTab = tab === "all" || t.status === tab;
      const matchesSearch =
        !q ||
        t.subject.toLowerCase().includes(q) ||
        t.requester.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [rows, tab, search]);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = (data.get("subject") as string)?.trim() || "New request";
    const priority = (data.get("priority") as TicketPriority) || "Medium";
    const category = (data.get("category") as string) || "General";
    const description = (data.get("description") as string)?.trim() || "";
    const seq = newSeq + 1;
    setNewSeq(seq);
    const id = `TKT-${2058 + newSeq}`;

    const ticket: Ticket = {
      id,
      subject,
      requester: currentUser.name,
      requesterEmail: currentUser.email,
      requesterAvatar: currentUser.avatar,
      company: "OrbynAdmin",
      priority,
      status: "Open",
      category,
      assignee: "Unassigned",
      assigneeAvatar: "",
      created: TODAY,
      updated: TODAY,
      tags: [category.toLowerCase()],
      messages: description
        ? [
            {
              id: `${id}-M1`,
              author: currentUser.name,
              avatar: currentUser.avatar,
              role: "requester",
              time: "Just now",
              body: description,
            },
          ]
        : [],
    };

    setRows((prev) => [ticket, ...prev]);
    setOpen(false);
    setTab("all");
    toast.success("Ticket created", {
      description: `${id} · “${subject}” was added to the queue.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Track, triage and resolve customer conversations."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="size-4" /> New ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>New ticket</DialogTitle>
                <DialogDescription>
                  Open a support conversation on behalf of a customer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Briefly describe the issue"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue="Medium">
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue="Bug">
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="Billing">Billing</SelectItem>
                        <SelectItem value="How-to">How-to</SelectItem>
                        <SelectItem value="Feature Request">
                          Feature Request
                        </SelectItem>
                        <SelectItem value="Account">Account</SelectItem>
                        <SelectItem value="API">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Add any context that will help your team…"
                    rows={4}
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
                  <IconPlus className="size-4" /> Create ticket
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Open"
          value={stats.openCount.toLocaleString()}
          hint="Awaiting first action"
          icon={IconInbox}
        />
        <StatTile
          label="Pending"
          value={stats.pendingCount.toLocaleString()}
          hint="Waiting on customer"
          icon={IconClockPause}
        />
        <StatTile
          label="Resolved today"
          value={stats.resolvedToday.toLocaleString()}
          hint="Closed in the last 24h"
          icon={IconCircleCheck}
        />
        <StatTile
          label="Avg. response"
          value="1.8h"
          hint="First reply this week"
          icon={IconClockHour4}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 px-0">
          <div className="flex flex-col gap-3 px-6 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:max-w-xs">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Ticket</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-6">
                      <div className="min-w-0">
                        <Link
                          href={`/support/${t.id}`}
                          className="font-medium hover:underline"
                        >
                          {t.subject}
                        </Link>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {t.id} · {t.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={t.requesterAvatar}
                            alt={t.requester}
                          />
                          <AvatarFallback>
                            {t.requester.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {t.requester}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.company}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={priorityStyles[t.priority]}
                      >
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusStyles[t.status]}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.assignee === "Unassigned" ? (
                        <span className="text-sm text-muted-foreground">
                          Unassigned
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage
                              src={t.assigneeAvatar}
                              alt={t.assignee}
                            />
                            <AvatarFallback>
                              {t.assignee.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-sm">
                            {t.assignee}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {formatDate(t.updated)}
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">Ticket actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/support/${t.id}`}>
                              <IconEye className="size-4" /> View ticket
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success("Ticket assigned to you", {
                                description: `${t.id} is now yours.`,
                              })
                            }
                          >
                            <IconUserPlus className="size-4" /> Assign to me
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              setRows((prev) =>
                                prev.map((x) =>
                                  x.id === t.id
                                    ? { ...x, status: "Resolved", updated: TODAY }
                                    : x
                                )
                              );
                              toast.success("Ticket resolved", {
                                description: `${t.id} was marked as resolved.`,
                              });
                            }}
                          >
                            <IconCircleCheckFilled className="size-4" /> Mark
                            resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <IconTicket className="mx-auto mb-2 size-6 opacity-50" />
                      No tickets match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-6">
            <p className="text-sm text-muted-foreground">
              {filtered.length} ticket{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
