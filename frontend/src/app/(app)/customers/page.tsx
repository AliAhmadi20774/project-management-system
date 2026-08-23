"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconSearch,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconUsers,
  IconDownload,
  IconMail,
  IconX,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { customers, type Customer } from "@/data";

const PAGE_SIZE = 10;

const statusStyles: Record<Customer["status"], string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Inactive: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const planStyles: Record<Customer["plan"], string> = {
  Free: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Pro: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Enterprise: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

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

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Customer[]>(customers);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const deleting = rows.find((c) => c.id === deleteId) ?? null;

  function toggleRow(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((c) => c.status === "Active").length;
    const newThisMonth = rows.filter((c) => {
      const d = new Date(c.joined);
      return d.getMonth() === 5; // June cohort — illustrative "new this month"
    }).length;
    const avgSpend =
      rows.reduce((sum, c) => sum + c.spent, 0) / (total || 1);
    return { total, active, newThisMonth, avgSpend };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesStatus = status === "all" || c.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, filtered.length);

  const pageIds = pageRows.map((c) => c.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const someSelected = pageIds.some((id) => selected.includes(id));
  const headerChecked: boolean | "indeterminate" = allSelected
    ? true
    : someSelected
      ? "indeterminate"
      : false;

  function toggleAllOnPage(checked: boolean) {
    setSelected((prev) =>
      checked
        ? Array.from(new Set([...prev, ...pageIds]))
        : prev.filter((id) => !pageIds.includes(id))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer directory, plans and activity."
      >
        <Button size="sm" asChild>
          <Link href="/customers/new">
            <IconPlus className="size-4" /> Add customer
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Total customers" value={stats.total.toLocaleString()} />
        <SummaryTile label="Active" value={stats.active.toLocaleString()} />
        <SummaryTile label="New this month" value={stats.newThisMonth.toLocaleString()} />
        <SummaryTile
          label="Avg. spend"
          value={`$${Math.round(stats.avgSpend).toLocaleString()}`}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 px-0">
          <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name or email…"
                  className="pl-9"
                />
              </div>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} customer{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-col gap-3 border-y bg-muted/40 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setSelected([])}
                >
                  <IconX className="size-4" />
                  <span className="sr-only">Clear selection</span>
                </Button>
                {selected.length} selected
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success(
                      `Exported ${selected.length} customer${selected.length === 1 ? "" : "s"} to CSV`
                    )
                  }
                >
                  <IconDownload className="size-4" /> Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success("Email queued", {
                      description: `A message will be sent to ${selected.length} customer${selected.length === 1 ? "" : "s"}.`,
                    })
                  }
                >
                  <IconMail className="size-4" /> Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <IconTrash className="size-4" /> Delete
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-6">
                    <Checkbox
                      aria-label="Select all"
                      checked={headerChecked}
                      onCheckedChange={(v) => toggleAllOnPage(v === true)}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6">
                      <Checkbox
                        aria-label={`Select ${c.name}`}
                        checked={selected.includes(c.id)}
                        onCheckedChange={() => toggleRow(c.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={c.avatar} alt={c.name} />
                          <AvatarFallback>{c.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            href={`/customers/${c.id}`}
                            className="font-medium hover:underline"
                          >
                            {c.name}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.company}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={planStyles[c.plan]}>
                        {c.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusStyles[c.status]}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      ${c.spent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.location}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {c.joined}
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
                            <Link href={`/customers/${c.id}`}>
                              <IconEye className="size-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${c.id}/edit`}>
                              <IconPencil className="size-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteId(c.id)}
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
                      colSpan={9}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <IconUsers className="mx-auto mb-2 size-6 opacity-50" />
                      No customers match your filters.
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
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        name={deleting?.name ?? "customer"}
        onConfirm={() => {
          setRows((prev) => prev.filter((c) => c.id !== deleteId));
          setSelected((prev) => prev.filter((id) => id !== deleteId));
        }}
      />

      <DeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        name={`${selected.length} customer${selected.length === 1 ? "" : "s"}`}
        description={`This will permanently remove ${selected.length} selected customer${selected.length === 1 ? "" : "s"}. This action cannot be undone.`}
        onConfirm={() => {
          setRows((prev) => prev.filter((c) => !selected.includes(c.id)));
          setSelected([]);
          setBulkDeleteOpen(false);
        }}
      />
    </div>
  );
}
