"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconReceipt,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
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
import { orders, type Order } from "@/data";

const PAGE_SIZE = 10;

const statusStyles: Record<Order["status"], string> = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Refunded: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const tabs = ["All", "Paid", "Pending", "Refunded", "Failed"] as const;

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

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Order[]>(orders);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = rows.length;
    const revenue = rows
      .filter((o) => o.status === "Paid")
      .reduce((s, o) => s + o.amount, 0);
    const pending = rows.filter((o) => o.status === "Pending").length;
    const refunded = rows.filter((o) => o.status === "Refunded").length;
    return { total, revenue, pending, refunded };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((o) => {
      const matchesTab = tab === "All" || o.status === tab;
      const matchesSearch =
        !q ||
        o.customer.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [search, tab, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, filtered.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track and manage every transaction in your store."
      >
        <Button size="sm" asChild>
          <Link href="/orders/new">
            <IconPlus className="size-4" /> Create order
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Total orders" value={stats.total.toLocaleString()} />
        <SummaryTile
          label="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
        />
        <SummaryTile label="Pending" value={stats.pending.toLocaleString()} />
        <SummaryTile label="Refunded" value={stats.refunded.toLocaleString()} />
      </div>

      <Card>
        <CardContent className="space-y-4 px-0">
          <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="overflow-x-auto sm:overflow-visible">
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v);
                  setPage(1);
                }}
              >
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search orders…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-6 font-medium tabular-nums">
                      <Link
                        href={`/orders/${o.id.replace("#", "")}`}
                        className="text-primary hover:underline"
                      >
                        {o.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarImage src={o.avatar} alt={o.customer} />
                          <AvatarFallback>
                            {o.customer.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{o.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.product}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {o.date}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.method}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusStyles[o.status]}
                      >
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      ${o.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">Order actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/orders/${o.id.replace("#", "")}`}>
                              <IconEye className="size-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/orders/${o.id.replace("#", "")}`}>
                              <IconPencil className="size-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteId(o.id)}
                          >
                            <IconTrash className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <IconReceipt className="mx-auto mb-2 size-6 opacity-50" />
                      No orders match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {showingFrom}–{showingTo} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <IconChevronLeft className="size-4" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        name={deleteId ?? "order"}
        description={`This will permanently remove order ${deleteId ?? ""} and its line items. This action cannot be undone.`}
        onConfirm={() => {
          setRows((prev) => prev.filter((o) => o.id !== deleteId));
          setDeleteId(null);
        }}
      />
    </div>
  );
}
