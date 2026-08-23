"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconDotsVertical,
  IconCopy,
  IconPencil,
  IconTrash,
  IconTicket,
  IconCalendarEvent,
  IconReceipt,
  IconCurrencyDollar,
  IconDiscount2,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  used: number;
  limit: number;
  status: "Active" | "Scheduled" | "Expired";
  start: string;
  end: string;
};

const initialCoupons: Coupon[] = [
  { id: "DSC-1001", code: "SUMMER25", type: "percentage", value: 25, used: 412, limit: 1000, status: "Active", start: "2026-06-01", end: "2026-08-31" },
  { id: "DSC-1002", code: "WELCOME10", type: "percentage", value: 10, used: 1240, limit: 5000, status: "Active", start: "2026-01-01", end: "2026-12-31" },
  { id: "DSC-1003", code: "FREESHIP", type: "fixed", value: 10, used: 883, limit: 2000, status: "Active", start: "2026-05-15", end: "2026-09-30" },
  { id: "DSC-1004", code: "BFCM40", type: "percentage", value: 40, used: 0, limit: 3000, status: "Scheduled", start: "2026-11-24", end: "2026-12-02" },
  { id: "DSC-1005", code: "SPRING15", type: "percentage", value: 15, used: 640, limit: 1500, status: "Expired", start: "2026-03-01", end: "2026-05-31" },
  { id: "DSC-1006", code: "FLASH20", type: "percentage", value: 20, used: 486, limit: 500, status: "Active", start: "2026-07-10", end: "2026-07-24" },
  { id: "DSC-1007", code: "VIP30", type: "percentage", value: 30, used: 96, limit: 200, status: "Active", start: "2026-04-01", end: "2026-12-31" },
  { id: "DSC-1008", code: "STUDENT15", type: "percentage", value: 15, used: 512, limit: 1000, status: "Active", start: "2026-01-15", end: "2026-12-31" },
  { id: "DSC-1009", code: "NEWYEAR50", type: "fixed", value: 50, used: 1500, limit: 1500, status: "Expired", start: "2026-01-01", end: "2026-01-07" },
  { id: "DSC-1010", code: "AUTUMN20", type: "percentage", value: 20, used: 0, limit: 2500, status: "Scheduled", start: "2026-09-15", end: "2026-11-15" },
];

const statusStyles: Record<Coupon["status"], string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Scheduled: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Expired: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

function formatValue(c: Coupon) {
  return c.type === "percentage" ? `${c.value}% off` : `$${c.value} off`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Tile({
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

export default function DiscountsPage() {
  const [rows, setRows] = useState<Coupon[]>(initialCoupons);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleting = rows.find((c) => c.id === deleteId) ?? null;

  const stats = useMemo(() => {
    const active = rows.filter((c) => c.status === "Active").length;
    const scheduled = rows.filter((c) => c.status === "Scheduled").length;
    const redemptions = rows.reduce((s, c) => s + c.used, 0);
    const revenueImpact = rows.reduce((s, c) => {
      const perRedemption = c.type === "percentage" ? 85 * (c.value / 100) : c.value;
      return s + c.used * perRedemption;
    }, 0);
    return { active, scheduled, redemptions, revenueImpact };
  }, [rows]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setFormOpen(true);
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code).catch(() => {});
    toast.success("Code copied", { description: `“${code}” is on your clipboard.` });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = ((fd.get("code") as string) || "").trim().toUpperCase();
    const type = (fd.get("type") as Coupon["type"]) || "percentage";
    const value = Number(fd.get("value")) || 0;
    const limit = Number(fd.get("limit")) || 0;
    const start = (fd.get("start") as string) || "";
    const end = (fd.get("end") as string) || "";
    const status = (fd.get("status") as Coupon["status"]) || "Active";

    if (editing) {
      setRows((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, code, type, value, limit, start, end, status }
            : c
        )
      );
      toast.success("Discount updated", { description: `“${code}” was saved.` });
    } else {
      const newCoupon: Coupon = {
        id: `DSC-${Date.now()}`,
        code,
        type,
        value,
        used: 0,
        limit,
        start,
        end,
        status,
      };
      setRows((prev) => [newCoupon, ...prev]);
      toast.success("Discount created", { description: `“${code}” is now live.` });
    }
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts"
        description="Create and manage coupon codes and promotional offers."
      >
        <Button onClick={openCreate}>
          <IconPlus className="size-4" /> Create discount
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Active"
          value={stats.active.toLocaleString()}
          hint="Currently redeemable"
          icon={IconDiscount2}
        />
        <Tile
          label="Scheduled"
          value={stats.scheduled.toLocaleString()}
          hint="Launching soon"
          icon={IconCalendarEvent}
        />
        <Tile
          label="Redemptions"
          value={stats.redemptions.toLocaleString()}
          hint="All-time uses"
          icon={IconReceipt}
        />
        <Tile
          label="Revenue impact"
          value={`$${Math.round(stats.revenueImpact).toLocaleString()}`}
          hint="Estimated discount given"
          icon={IconCurrencyDollar}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 px-0">
          <div className="flex items-center justify-between px-6">
            <p className="text-sm font-medium">All discounts</p>
            <p className="text-sm text-muted-foreground">
              {rows.length} code{rows.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-48">Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => {
                  const pct =
                    c.limit > 0
                      ? Math.min(100, Math.round((c.used / c.limit) * 100))
                      : 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <IconTicket className="size-4" />
                          </span>
                          <span className="font-mono text-sm font-semibold">
                            {c.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {c.type}
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {formatValue(c)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs tabular-nums">
                            <span className="font-medium">
                              {c.used.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              / {c.limit.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusStyles[c.status]}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        <span className="whitespace-nowrap">
                          {formatDate(c.start)} – {formatDate(c.end)}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(c)}>
                              <IconPencil className="size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => copyCode(c.code)}>
                              <IconCopy className="size-4" /> Copy code
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
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <IconTicket className="mx-auto mb-2 size-6 opacity-50" />
                      No discounts yet. Create your first code.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} key={editing?.id ?? "new"}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit discount" : "Create discount"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the details of this coupon code."
                  : "Set up a new coupon code and its redemption rules."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g. SUMMER25"
                  defaultValue={editing?.code}
                  className="font-mono uppercase"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editing?.type ?? "percentage"}>
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    min={0}
                    placeholder="25"
                    defaultValue={editing?.value}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Usage limit</Label>
                <Input
                  id="limit"
                  name="limit"
                  type="number"
                  min={0}
                  placeholder="1000"
                  defaultValue={editing?.limit}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start">Start date</Label>
                  <Input
                    id="start"
                    name="start"
                    type="date"
                    defaultValue={editing?.start ?? "2026-07-01"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End date</Label>
                  <Input
                    id="end"
                    name="end"
                    type="date"
                    defaultValue={editing?.end ?? "2026-12-31"}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editing?.status ?? "Active"}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
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
                {editing ? "Save changes" : "Create discount"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        name={deleting?.code ?? "discount"}
        onConfirm={() => setRows((prev) => prev.filter((c) => c.id !== deleteId))}
      />
    </div>
  );
}
