"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconPackage,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconListDetails,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productList, type Product } from "@/data";

const statusStyles: Record<Product["status"], string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Low Stock": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Out of Stock": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function StorefrontPage() {
  const [items, setItems] = useState<Product[]>(productList);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(productList.map((p) => p.category))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesCategory = category === "all" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Storefront"
        description="Browse the catalog the way your customers see it."
      >
        <Button variant="outline" asChild>
          <Link href="/products">
            <IconListDetails className="size-4" /> List view
          </Link>
        </Button>
        <Button asChild>
          <Link href="/products/new">
            <IconPlus className="size-4" /> Add product
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <IconPackage className="mx-auto mb-2 size-6 opacity-50" />
            No products match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Card key={p.id} className="group overflow-hidden pt-0">
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                <Link href={`/products/${p.id}`} className="block size-full">
                  {/* plain img to avoid next/image remote config */}
                  <img
                    src={p.image}
                    alt={p.name}
                    width={200}
                    height={200}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 size-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                    >
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
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  >
                    {p.category}
                  </Badge>
                  <Badge variant="secondary" className={statusStyles[p.status]}>
                    {p.status}
                  </Badge>
                </div>
                <CardTitle className="pt-1 text-base">
                  <Link
                    href={`/products/${p.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {p.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardFooter className="mt-auto items-end justify-between">
                <span className="text-lg font-semibold tabular-nums">
                  ${p.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {p.sold.toLocaleString()} sold
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
