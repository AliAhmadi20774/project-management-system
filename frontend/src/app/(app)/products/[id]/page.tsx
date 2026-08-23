import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft,
  IconStarFilled,
  IconStar,
  IconPencil,
  IconShoppingCart,
  IconHeart,
  IconMinus,
  IconPlus,
  IconTruck,
  IconShieldCheck,
  IconRefresh,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { getProductById, productList, type Product } from "@/data";

export const metadata = { title: "Product" };

export function generateStaticParams() {
  return productList.map((p) => ({ id: p.id }));
}

const statusStyles: Record<Product["status"], string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Low Stock": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Out of Stock": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const brands = [
  "Auralis",
  "Northbeam",
  "Kestrel",
  "Vantablack",
  "Meridian",
  "Halcyon",
  "Ironwood",
  "Cascade",
];
const colorways = ["Graphite", "Midnight Blue", "Sandstone", "Forest Green", "Arctic White", "Rose Gold"];
const materials: Record<string, string> = {
  Electronics: "Anodized aluminum & tempered glass",
  Apparel: "Organic cotton blend",
  Home: "Solid oak & brushed steel",
  Beauty: "Recyclable ABS",
  Sports: "Carbon-reinforced polymer",
};
const origins = ["Designed in California, US", "Assembled in Vietnam", "Made in Germany", "Crafted in Japan"];

function Stars({ rating, className = "size-4" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rounded ? (
          <IconStarFilled key={i} className={className} />
        ) : (
          <IconStar key={i} className={`${className} text-muted-foreground/40`} />
        )
      )}
    </span>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const seed = Number(product.id.replace(/\D/g, "")) || 1;
  const rating = Math.min(5, 4 + ((seed * 7) % 10) / 10);
  const reviewCount = 42 + ((seed * 53) % 880);
  const compareAt = Math.round(product.price * 1.25);
  const brand = brands[seed % brands.length];
  const color = colorways[seed % colorways.length];
  const material = materials[product.category] ?? "Premium composite";
  const origin = origins[seed % origins.length];
  const weight = (0.4 + ((seed * 3) % 40) / 10).toFixed(2);
  const dims = `${20 + (seed % 18)} × ${12 + (seed % 12)} × ${3 + (seed % 7)} cm`;
  const warranty = `${(seed % 2) + 1} year${(seed % 2) + 1 > 1 ? "s" : ""} limited`;
  const modelNo = `${brand.slice(0, 3).toUpperCase()}-${seed}${product.category.slice(0, 1)}`;

  const gallery = [
    `https://api.dicebear.com/9.x/shapes/svg?seed=${product.id}`,
    `https://api.dicebear.com/9.x/shapes/svg?seed=${product.id}-a`,
    `https://api.dicebear.com/9.x/shapes/svg?seed=${product.id}-b`,
    `https://api.dicebear.com/9.x/shapes/svg?seed=${product.id}-c`,
  ];

  const inStock = product.status !== "Out of Stock";

  const description = `The ${product.name} is engineered for people who refuse to compromise. Every detail — from its ${color.toLowerCase()} ${material.toLowerCase()} finish to the precision-tuned internals — has been obsessed over so it performs beautifully and lasts for years. A favorite in our ${product.category.toLowerCase()} lineup, it ships ready to use out of the box and is backed by our ${warranty.toLowerCase()} warranty.`;

  const specs: { label: string; value: string }[] = [
    { label: "Brand", value: brand },
    { label: "SKU", value: product.id },
    { label: "Model number", value: modelNo },
    { label: "Category", value: product.category },
    { label: "Color", value: color },
    { label: "Material", value: material },
    { label: "Weight", value: `${weight} kg` },
    { label: "Dimensions", value: dims },
    { label: "Warranty", value: warranty },
    { label: "Origin", value: origin },
  ];

  const reviews = [
    {
      name: "Emma Carter",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1",
      rating: 5,
      date: "2 weeks ago",
      title: "Exceeded my expectations",
      body: `Genuinely impressed. The build quality feels premium and it slotted right into my daily routine. Worth every cent — I'd buy the ${product.name} again in a heartbeat.`,
    },
    {
      name: "Liam Nguyen",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=12",
      rating: 4,
      date: "1 month ago",
      title: "Great value, minor nitpicks",
      body: "Does exactly what it promises and the finish is gorgeous. Took a day to get used to, but now I can't imagine going back. Shipping was fast too.",
    },
    {
      name: "Olivia Patel",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5",
      rating: 5,
      date: "1 month ago",
      title: "My new favorite",
      body: `Bought one for myself and immediately ordered a second as a gift. The ${color.toLowerCase()} option is stunning in person. Highly recommend.`,
    },
  ];

  const ratingBreakdown = [
    { stars: 5, pct: 72 },
    { stars: 4, pct: 18 },
    { stars: 3, pct: 6 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground">
          <Link href="/products">
            <IconArrowLeft className="size-4" /> Back to products
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-muted">
            {/* plain img to avoid next/image remote config */}
            <img
              src={gallery[0]}
              alt={product.name}
              width={900}
              height={900}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((src, i) => (
              <div
                key={src}
                className={`overflow-hidden rounded-lg border bg-muted ${
                  i === 0 ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                <img
                  src={src}
                  alt={`${product.name} view ${i + 1}`}
                  width={300}
                  height={300}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            >
              {product.category}
            </Badge>
            <Badge variant="secondary" className={statusStyles[product.status]}>
              {product.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              by <span className="font-medium text-foreground">{brand}</span> · SKU {product.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Stars rating={rating} className="size-4.5" />
            <span className="text-sm font-medium tabular-nums">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              ${product.price.toLocaleString()}
            </span>
            <span className="pb-1 text-lg text-muted-foreground line-through tabular-nums">
              ${compareAt.toLocaleString()}
            </span>
            <Badge
              variant="secondary"
              className="mb-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              Save ${(compareAt - product.price).toLocaleString()}
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

          <div className="flex items-center gap-2 text-sm">
            {inStock ? (
              <>
                <IconCircleCheckFilled className="size-4 text-emerald-500" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {product.stock} in stock
                </span>
                <span className="text-muted-foreground">· ready to ship</span>
              </>
            ) : (
              <span className="font-medium text-rose-600 dark:text-rose-400">
                Currently out of stock
              </span>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border">
              <Button variant="ghost" size="icon" className="size-10 rounded-r-none" disabled={!inStock}>
                <IconMinus className="size-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">1</span>
              <Button variant="ghost" size="icon" className="size-10 rounded-l-none" disabled={!inStock}>
                <IconPlus className="size-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-1 gap-2" disabled={!inStock}>
              <IconShoppingCart className="size-4" /> Add to cart
            </Button>
            <Button size="lg" variant="outline" className="size-11 px-0">
              <IconHeart className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/products/${product.id}/edit`}>
                <IconPencil className="size-4" /> Edit product
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
              <IconTruck className="size-5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-medium">Free shipping</p>
                <p className="text-muted-foreground">Orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
              <IconRefresh className="size-5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-medium">30-day returns</p>
                <p className="text-muted-foreground">Hassle free</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
              <IconShieldCheck className="size-5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-medium">Warranty</p>
                <p className="text-muted-foreground">{warranty}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <Card>
            <CardContent className="space-y-4 py-6 text-sm leading-relaxed text-muted-foreground">
              <p>{description}</p>
              <p>
                Thoughtful engineering runs through the entire {product.name}. We started with
                premium {material.toLowerCase()} and refined every surface until it felt just
                right in the hand. The result is a product that looks as good as it performs —
                equally at home on a desk, a shelf, or in your bag.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {[
                  "Precision-machined housing with a scratch-resistant finish",
                  "Optimized for everyday reliability and long service life",
                  `Ships in fully recyclable packaging from ${origin.toLowerCase()}`,
                  `Backed by a ${warranty.toLowerCase()} manufacturer warranty`,
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground">
                    <IconCircleCheckFilled className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications">
          <Card>
            <CardContent className="px-0 py-2">
              <Table>
                <TableBody>
                  {specs.map((s) => (
                    <TableRow key={s.label}>
                      <TableCell className="w-1/3 py-3 pl-6 font-medium text-muted-foreground">
                        {s.label}
                      </TableCell>
                      <TableCell className="py-3 pr-6 tabular-nums">{s.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="space-y-4 py-6 text-center">
                <p className="text-5xl font-semibold tracking-tight tabular-nums">
                  {rating.toFixed(1)}
                </p>
                <div className="flex justify-center">
                  <Stars rating={rating} className="size-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {reviewCount.toLocaleString()} reviews
                </p>
                <Separator />
                <div className="space-y-2">
                  {ratingBreakdown.map((r) => (
                    <div key={r.stars} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-muted-foreground tabular-nums">{r.stars}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground tabular-nums">
                        {r.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 lg:col-span-2">
              {reviews.map((r) => (
                <Card key={r.name}>
                  <CardContent className="space-y-3 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={r.avatar} alt={r.name} />
                          <AvatarFallback>{r.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.date}</p>
                        </div>
                      </div>
                      <Stars rating={r.rating} className="size-3.5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
