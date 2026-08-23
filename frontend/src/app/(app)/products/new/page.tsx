"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconArrowLeft, IconDeviceFloppy, IconUpload } from "@tabler/icons-react";

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
import { productList } from "@/data";

const categories = Array.from(new Set(productList.map((p) => p.category))).sort();

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("In Stock");
  const [trackQty, setTrackQty] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Product created", {
      description: `${name || "New product"} has been added to your catalog.`,
    });
    router.push("/products");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground">
          <Link href="/products">
            <IconArrowLeft className="size-4" /> Back to products
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
          <p className="text-sm text-muted-foreground">
            Create a new product and publish it to your catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/products">Cancel</Link>
          </Button>
          <Button type="submit" className="gap-2">
            <IconDeviceFloppy className="size-4" /> Save product
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
                  A unique stock-keeping unit. Leave blank to auto-generate.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Upload product images or paste an image URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                htmlFor="media-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted/70"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <IconUpload className="size-5" />
                </span>
                <span className="text-sm font-medium">
                  Drag &amp; drop images here, or click to browse
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG or WEBP up to 5MB
                </span>
                <input id="media-upload" type="file" accept="image/*" multiple className="hidden" />
              </label>
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://cdn.orbynadmin.com/products/aurora.png"
                />
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
                <Select value={status} onValueChange={setStatus}>
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
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/products">Cancel</Link>
        </Button>
        <Button type="submit" className="gap-2">
          <IconDeviceFloppy className="size-4" /> Save product
        </Button>
      </div>
    </form>
  );
}
