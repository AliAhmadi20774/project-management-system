"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconUpload,
  IconAlertTriangle,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProductById, productList } from "@/data";

const categories = Array.from(new Set(productList.map((p) => p.category))).sort();

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const product = getProductById(id);

  const seed = Number((product?.id ?? id).replace(/\D/g, "")) || 1;
  const compareAtDefault = product ? Math.round(product.price * 1.25) : 0;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(
    product
      ? `The ${product.name} is a standout in our ${product.category.toLowerCase()} lineup — premium materials, thoughtful engineering, and reliable everyday performance.`
      : ""
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [compareAt, setCompareAt] = useState(compareAtDefault ? String(compareAtDefault) : "");
  const [sku, setSku] = useState(product?.id ?? id);
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [status, setStatus] = useState(product?.status ?? "In Stock");
  const [trackQty, setTrackQty] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Changes saved", {
      description: `${name || "Product"} has been updated.`,
    });
    router.push(`/products/${id}`);
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground">
          <Link href="/products">
            <IconArrowLeft className="size-4" /> Back to products
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <IconAlertTriangle className="size-8 text-amber-500" />
            <div className="space-y-1">
              <p className="font-medium">Product not found</p>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t find a product with the id{" "}
                <span className="font-mono">{id}</span>.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/products">Return to products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground">
          <Link href={`/products/${id}`}>
            <IconArrowLeft className="size-4" /> Back to product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
          <p className="text-sm text-muted-foreground">
            Update details for{" "}
            <span className="font-medium text-foreground">{product.name}</span> ·{" "}
            <span className="tabular-nums">{product.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/products/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" className="gap-2">
            <IconDeviceFloppy className="size-4" /> Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* General */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Basic information about the product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aurora Wireless Headphones"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product, its materials, and what makes it special…"
                  className="min-h-32"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set the price and product identifier.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 tabular-nums"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAt">Compare-at price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="compareAt"
                    type="number"
                    min="0"
                    step="0.01"
                    value={compareAt}
                    onChange={(e) => setCompareAt(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 tabular-nums"
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PRD-200"
                  className="tabular-nums"
                />
                <p className="text-xs text-muted-foreground">
                  A unique stock-keeping unit used across your catalog.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Update product images or paste an image URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {/* plain img to avoid next/image remote config */}
                  <img
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                </div>
                <label
                  htmlFor="media-upload"
                  className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 px-6 py-6 text-center transition-colors hover:bg-muted/70"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <IconUpload className="size-4" />
                  </span>
                  <span className="text-sm font-medium">Replace image</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 5MB</span>
                  <input id="media-upload" type="file" accept="image/*" multiple className="hidden" />
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input id="image-url" type="url" defaultValue={product.image} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Track stock levels and availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Availability</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="track-qty">Track quantity</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically reduce stock as orders come in.
                  </p>
                </div>
                <Switch id="track-qty" checked={trackQty} onCheckedChange={setTrackQty} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1 py-5 text-sm">
              <p className="font-medium">Units sold</p>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {product.sold.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Lifetime · SKU {product.id}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={`/products/${id}`}>Cancel</Link>
        </Button>
        <Button type="submit" className="gap-2">
          <IconDeviceFloppy className="size-4" /> Save changes
        </Button>
      </div>
    </form>
  );
}
