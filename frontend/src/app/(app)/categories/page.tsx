"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconDeviceLaptop,
  IconShirt,
  IconHome,
  IconSparkles,
  IconBallFootball,
  IconPlant2,
  IconGift,
  IconHeart,
  IconCategory,
  IconLayoutGrid,
  IconList,
  IconPackage,
  IconArrowUpRight,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { productList } from "@/data";

type IconType = React.ComponentType<{ className?: string }>;

type Category = {
  id: string;
  name: string;
  description: string;
  products: number;
  icon: IconType;
  color: string;
};

const tint: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};
const colorCycle = Object.keys(tint);

// Product counts pulled live from the catalog.
const catalogCounts = productList.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

const categorySeed: Omit<Category, "products">[] = [
  {
    id: "CAT-01",
    name: "Electronics",
    description: "Phones, laptops, audio and smart home devices.",
    icon: IconDeviceLaptop,
    color: "blue",
  },
  {
    id: "CAT-02",
    name: "Apparel",
    description: "Clothing, footwear and everyday accessories.",
    icon: IconShirt,
    color: "violet",
  },
  {
    id: "CAT-03",
    name: "Home",
    description: "Furniture, decor and kitchen essentials.",
    icon: IconHome,
    color: "amber",
  },
  {
    id: "CAT-04",
    name: "Beauty",
    description: "Skincare, makeup and fragrance.",
    icon: IconSparkles,
    color: "rose",
  },
  {
    id: "CAT-05",
    name: "Sports",
    description: "Fitness gear, apparel and outdoor equipment.",
    icon: IconBallFootball,
    color: "emerald",
  },
  {
    id: "CAT-06",
    name: "Garden",
    description: "Plants, tools and outdoor living.",
    icon: IconPlant2,
    color: "teal",
  },
  {
    id: "CAT-07",
    name: "Toys & Games",
    description: "Toys, board games and hobby kits.",
    icon: IconGift,
    color: "sky",
  },
  {
    id: "CAT-08",
    name: "Wellness",
    description: "Supplements, self-care and recovery.",
    icon: IconHeart,
    color: "orange",
  },
];

// Fallback counts for categories not represented in the catalog data.
const fallbackCounts: Record<string, number> = {
  Garden: 9,
  "Toys & Games": 14,
  Wellness: 7,
};

const initialCategories: Category[] = categorySeed.map((c) => ({
  ...c,
  products: catalogCounts[c.name] ?? fallbackCounts[c.name] ?? 0,
}));

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: IconType;
}) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>(initialCategories);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const stats = useMemo(() => {
    const totalCats = cats.length;
    const totalProducts = cats.reduce((s, c) => s + c.products, 0);
    const largest =
      cats.length > 0
        ? cats.reduce((a, b) => (b.products > a.products ? b : a))
        : null;
    const avg = totalCats > 0 ? Math.round(totalProducts / totalCats) : 0;
    return { totalCats, totalProducts, largest, avg };
  }, [cats]);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = ((data.get("name") as string) ?? "").trim();
    const description = ((data.get("description") as string) ?? "").trim();
    if (!name) return;

    if (editing) {
      setCats((prev) =>
        prev.map((c) =>
          c.id === editing.id ? { ...c, name, description } : c
        )
      );
      toast.success("Category updated", { description: name });
    } else {
      setCats((prev) => {
        const color = colorCycle[prev.length % colorCycle.length];
        const next: Category = {
          id: `CAT-${(prev.length + 1).toString().padStart(2, "0")}-${Date.now()
            .toString()
            .slice(-4)}`,
          name,
          description: description || "No description provided.",
          products: 0,
          icon: IconCategory,
          color,
        };
        return [...prev, next];
      });
      toast.success("Category created", { description: name });
    }
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your catalog into browsable collections."
      >
        <div className="hidden items-center rounded-lg border p-0.5 sm:flex">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <IconLayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <IconList className="size-4" />
          </Button>
        </div>
        <Button onClick={openAdd}>
          <IconPlus className="size-4" /> Add category
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total categories"
          value={stats.totalCats.toLocaleString()}
          icon={IconCategory}
        />
        <StatTile
          label="Total products"
          value={stats.totalProducts.toLocaleString()}
          icon={IconPackage}
        />
        <StatTile
          label="Largest category"
          value={stats.largest?.name ?? "—"}
          icon={IconArrowUpRight}
        />
        <StatTile
          label="Avg. per category"
          value={stats.avg.toLocaleString()}
          icon={IconLayoutGrid}
        />
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cats.map((cat) => (
            <Card key={cat.id} className="group">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      tint[cat.color] ?? tint.blue
                    )}
                  >
                    <cat.icon className="size-5" />
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                      >
                        <IconDotsVertical className="size-4" />
                        <span className="sr-only">Category actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(cat)}>
                        <IconPencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteTarget(cat)}
                      >
                        <IconTrash className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="pt-2 text-base">{cat.name}</CardTitle>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {cat.description}
                </p>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    {cat.products.toLocaleString()}
                  </span>{" "}
                  product{cat.products === 1 ? "" : "s"}
                </span>
                <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                  Manage <IconArrowUpRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="w-10 pr-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cats.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg",
                              tint[cat.color] ?? tint.blue
                            )}
                          >
                            <cat.icon className="size-4" />
                          </span>
                          <span className="font-medium">{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm text-muted-foreground">
                        <span className="line-clamp-1">{cat.description}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {cat.products.toLocaleString()}
                      </TableCell>
                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">Category actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(cat)}>
                              <IconPencil className="size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDeleteTarget(cat)}
                            >
                              <IconTrash className="size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add / edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <form key={editing?.id ?? "new"} onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit category" : "Add category"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the details for this category."
                  : "Create a new collection to group your products."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  name="name"
                  placeholder="e.g. Electronics"
                  defaultValue={editing?.name ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-description">Description</Label>
                <Textarea
                  id="cat-description"
                  name="description"
                  placeholder="A short summary of what belongs in this category."
                  defaultValue={editing?.description ?? ""}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-parent">Parent category</Label>
                <Select name="parent" defaultValue="none">
                  <SelectTrigger id="cat-parent" className="w-full">
                    <SelectValue placeholder="Select a parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top level)</SelectItem>
                    {cats
                      .filter((c) => c.id !== editing?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
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
                {editing ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        name={deleteTarget?.name ?? "category"}
        description={
          deleteTarget
            ? `This will permanently remove the ${deleteTarget.name} category (${deleteTarget.products} products will be uncategorized). This action cannot be undone.`
            : undefined
        }
        onConfirm={() => {
          if (deleteTarget) {
            setCats((prev) => prev.filter((c) => c.id !== deleteTarget.id));
          }
        }}
      />
    </div>
  );
}
