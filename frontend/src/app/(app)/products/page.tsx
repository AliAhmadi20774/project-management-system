"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  IconPlus,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconLayoutGrid,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DataTable, SortableHeader } from "@/components/data-table";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { productList, type Product } from "@/data";

const statusStyles: Record<Product["status"], string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Low Stock": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Out of Stock": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
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

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>(productList);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const inStock = items.filter((p) => p.status === "In Stock").length;
    const lowStock = items.filter((p) => p.status === "Low Stock").length;
    const unitsSold = items.reduce((s, p) => s + p.sold, 0);
    return { total, inStock, lowStock, unitsSold };
  }, [items]);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Product" />,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={p.name}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-md border bg-muted object-cover"
            />
            <div className="min-w-0">
              <Link
                href={`/products/${p.id}`}
                className="font-medium whitespace-nowrap transition-colors hover:text-primary"
              >
                {p.name}
              </Link>
              <p className="text-xs text-muted-foreground">{p.id}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => <SortableHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        >
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <SortableHeader column={column} title="Price" />,
      cell: ({ row }) => (
        <span className="tabular-nums">
          ${row.original.price.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => <SortableHeader column={column} title="Stock" />,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.stock}</span>
      ),
    },
    {
      accessorKey: "sold",
      header: ({ column }) => <SortableHeader column={column} title="Sold" />,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.sold.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className={statusStyles[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">Product actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/products/${p.id}`}>
                    <IconEye className="size-4" /> View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/products/${p.id}/edit`}>
                    <IconPencil className="size-4" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteTarget(p)}
                >
                  <IconTrash className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog."
      >
        <Button variant="outline" asChild>
          <Link href="/storefront">
            <IconLayoutGrid className="size-4" /> Storefront
          </Link>
        </Button>
        <Button asChild>
          <Link href="/products/new">
            <IconPlus className="size-4" /> Add product
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Total products" value={stats.total.toLocaleString()} />
        <SummaryTile label="In stock" value={stats.inStock.toLocaleString()} />
        <SummaryTile label="Low stock" value={stats.lowStock.toLocaleString()} />
        <SummaryTile label="Units sold" value={stats.unitsSold.toLocaleString()} />
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="name"
        searchPlaceholder="Search products…"
      />

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        name={deleteTarget?.name ?? "product"}
        description={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.name} (${deleteTarget.id}) from your catalog. This action cannot be undone.`
            : undefined
        }
        onConfirm={() => {
          if (deleteTarget) {
            setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
          }
        }}
      />
    </div>
  );
}
