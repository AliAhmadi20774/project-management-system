"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconSearch,
  IconPlus,
  IconMinus,
  IconUpload,
  IconDownload,
  IconPackage,
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
  IconAdjustments,
  IconBox,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productList, type Product } from "@/data";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

type InventoryRow = Product & { reorderPoint: number };

const statusStyles: Record<StockStatus, string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Low Stock": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Out of Stock": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function statusFor(stock: number, reorderPoint: number): StockStatus {
  if (stock === 0) return "Out of Stock";
  if (stock <= reorderPoint) return "Low Stock";
  return "In Stock";
}

const initialRows: InventoryRow[] = productList.map((p) => {
  const num = parseInt(p.id.replace(/\D/g, ""), 10) || 0;
  return { ...p, reorderPoint: 10 + (num % 3) * 5 };
});

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-5" />
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AdjustStock({
  name,
  stock,
  onApply,
}: {
  name: string;
  stock: number;
  onApply: (next: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(stock);
  const delta = draft - stock;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(stock);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <IconAdjustments className="size-4" /> Adjust
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-3">
          <div className="space-y-0.5">
            <p className="font-medium">Adjust stock</p>
            <p className="truncate text-xs text-muted-foreground">{name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9 shrink-0"
              onClick={() => setDraft((d) => Math.max(0, d - 1))}
              aria-label="Decrease stock"
            >
              <IconMinus className="size-4" />
            </Button>
            <Input
              type="number"
              min={0}
              value={draft}
              onChange={(e) =>
                setDraft(Math.max(0, Math.floor(Number(e.target.value) || 0)))
              }
              className="text-center tabular-nums"
            />
            <Button
              variant="outline"
              size="icon"
              className="size-9 shrink-0"
              onClick={() => setDraft((d) => d + 1)}
              aria-label="Increase stock"
            >
              <IconPlus className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {delta === 0
              ? "No change"
              : delta > 0
                ? `+${delta} units`
                : `${delta} units`}{" "}
            · new level {draft}
          </p>
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              onApply(draft);
              toast.success("Stock updated", {
                description: `${name} set to ${draft} units.`,
              });
              setOpen(false);
            }}
          >
            Update stock
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const stats = useMemo(() => {
    let inStock = 0;
    let low = 0;
    let out = 0;
    for (const r of rows) {
      const s = statusFor(r.stock, r.reorderPoint);
      if (s === "In Stock") inStock++;
      else if (s === "Low Stock") low++;
      else out++;
    }
    return { total: rows.length, inStock, low, out };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchesStatus =
        status === "all" || statusFor(r.stock, r.reorderPoint) === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  function setStock(id: string, next: number) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, stock: next } : r))
    );
  }

  function handleAddStock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = data.get("product") as string;
    const qty = Math.max(0, Math.floor(Number(data.get("qty")) || 0));
    const target = rows.find((r) => r.id === id);
    if (target && qty > 0) {
      setStock(id, target.stock + qty);
      toast.success("Stock added", {
        description: `Added ${qty} units to ${target.name}.`,
      });
    }
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels, reorder points and SKU status."
      >
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Import started", {
              description: "Upload a CSV to bulk-update stock levels.",
            })
          }
        >
          <IconUpload className="size-4" /> Import
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Export ready", {
              description: "Your inventory report is downloading as CSV.",
            })
          }
        >
          <IconDownload className="size-4" /> Export
        </Button>
        <Button onClick={() => setAddOpen(true)}>
          <IconPlus className="size-4" /> Add stock
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total SKUs"
          value={stats.total.toLocaleString()}
          icon={IconBox}
          tone="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatTile
          label="In stock"
          value={stats.inStock.toLocaleString()}
          icon={IconCircleCheck}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatTile
          label="Low stock"
          value={stats.low.toLocaleString()}
          icon={IconAlertTriangle}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatTile
          label="Out of stock"
          value={stats.out.toLocaleString()}
          icon={IconCircleX}
          tone="bg-rose-500/10 text-rose-600 dark:text-rose-400"
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by product or SKU…"
                  className="pl-9"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} SKU{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[840px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Reorder point</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const s = statusFor(r.stock, r.reorderPoint);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.image}
                            alt={r.name}
                            width={36}
                            height={36}
                            className="size-9 shrink-0 rounded-md border bg-muted object-cover"
                          />
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground tabular-nums">
                        {r.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.category}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {r.stock.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {r.reorderPoint.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusStyles[s]}>
                          {s}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <AdjustStock
                          name={r.name}
                          stock={r.stock}
                          onApply={(next) => setStock(r.id, next)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <IconPackage className="mx-auto mb-2 size-6 opacity-50" />
                      No SKUs match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add stock dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleAddStock}>
            <DialogHeader>
              <DialogTitle>Add stock</DialogTitle>
              <DialogDescription>
                Receive inventory and top up a SKU&apos;s stock level.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stock-product">Product</Label>
                <Select name="product" defaultValue={rows[0]?.id}>
                  <SelectTrigger id="stock-product" className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {rows.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} · {r.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-qty">Quantity to add</Label>
                <Input
                  id="stock-qty"
                  name="qty"
                  type="number"
                  min={1}
                  defaultValue={10}
                  className="tabular-nums"
                  required
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
                <IconPlus className="size-4" /> Add stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
