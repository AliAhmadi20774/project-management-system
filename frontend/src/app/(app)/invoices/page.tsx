"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconSend,
  IconEye,
  IconTrash,
  IconFileInvoice,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoices, type Invoice } from "@/data";

const statusStyles: Record<Invoice["status"], string> = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Overdue: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const tabs = ["All", "Paid", "Pending", "Overdue", "Draft"] as const;

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>(invoices);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const outstanding = rows
      .filter((v) => v.status === "Pending" || v.status === "Overdue")
      .reduce((s, v) => s + v.amount, 0);
    const paid = rows
      .filter((v) => v.status === "Paid")
      .reduce((s, v) => s + v.amount, 0);
    const overdue = rows.filter((v) => v.status === "Overdue").length;
    const drafts = rows.filter((v) => v.status === "Draft").length;
    return { outstanding, paid, overdue, drafts };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((v) => {
      const matchesTab = tab === "All" || v.status === tab;
      const matchesSearch =
        !q ||
        v.client.toLowerCase().includes(q) ||
        v.clientEmail.toLowerCase().includes(q) ||
        v.number.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [rows, search, tab]);

  const pendingDelete = rows.find((v) => v.id === deleteId) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create, send and track your invoices."
      >
        <Button size="sm" asChild>
          <Link href="/invoices/new">
            <IconPlus className="size-4" /> New invoice
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          label="Outstanding"
          value={`$${stats.outstanding.toLocaleString()}`}
        />
        <SummaryTile label="Paid" value={`$${stats.paid.toLocaleString()}`} />
        <SummaryTile label="Overdue" value={stats.overdue.toLocaleString()} />
        <SummaryTile label="Drafts" value={stats.drafts.toLocaleString()} />
      </div>

      <Card>
        <CardContent className="space-y-4 px-0">
          <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="overflow-x-auto sm:overflow-visible">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  {tabs.map((t) => (
                    <TabsTrigger key={t} value={t}>
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="pl-6">
                      <Link
                        href={`/invoices/${v.id}`}
                        className="font-medium tabular-nums hover:underline"
                      >
                        {v.number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/invoices/${v.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="size-8">
                          <AvatarImage src={v.avatar} alt={v.client} />
                          <AvatarFallback>{v.client.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">{v.client}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {v.clientEmail}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {v.issued}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {v.due}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusStyles[v.status]}
                      >
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      ${v.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <IconDotsVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${v.id}`}>
                              <IconEye className="size-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success(`Invoice ${v.number} sent`, {
                                description: `Emailed to ${v.clientEmail}.`,
                              })
                            }
                          >
                            <IconSend className="size-4" /> Send
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteId(v.id)}
                          >
                            <IconTrash className="size-4" /> Delete
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
                      <IconFileInvoice className="mx-auto mb-2 size-6 opacity-50" />
                      No invoices match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        name={pendingDelete ? `invoice ${pendingDelete.number}` : "invoice"}
        description={
          pendingDelete
            ? `This will permanently remove invoice ${pendingDelete.number} for ${pendingDelete.client}. This action cannot be undone.`
            : undefined
        }
        onConfirm={() => {
          setRows((r) => r.filter((x) => x.id !== deleteId));
          setDeleteId(null);
        }}
      />
    </div>
  );
}
