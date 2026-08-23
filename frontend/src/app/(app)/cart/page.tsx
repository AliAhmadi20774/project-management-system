"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconArrowRight,
  IconMinus,
  IconPlus,
  IconTrash,
  IconShoppingCart,
  IconShoppingCartOff,
  IconTruck,
  IconTag,
  IconShieldCheck,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { productList, type Product } from "@/data";

type CartLine = Product & { qty: number };

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 12;
const TAX_RATE = 0.08;

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const initialCart: CartLine[] = productList
  .slice(0, 4)
  .map((p, i) => ({ ...p, qty: [1, 2, 1, 3][i] ?? 1 }));

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[]>(initialCart);
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(
    null
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    [lines]
  );
  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );
  const discount = applied ? subtotal * applied.rate : 0;
  const taxable = subtotal - discount;
  const shipping =
    lines.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = taxable * TAX_RATE;
  const total = taxable + shipping + tax;

  function setQty(id: string, next: number) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, next) } : l))
    );
  }

  function removeLine(id: string) {
    const line = lines.find((l) => l.id === id);
    setLines((prev) => prev.filter((l) => l.id !== id));
    if (line) {
      toast.success("Removed from cart", { description: line.name });
    }
  }

  function clearCart() {
    setLines([]);
    setApplied(null);
    toast.success("Cart cleared", {
      description: "All items were removed from your cart.",
    });
  }

  function applyPromo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code === "SAVE10" || code === "ORBYNADMIN10") {
      setApplied({ code, rate: 0.1 });
      toast.success("Promo code applied", {
        description: `${code} — 10% off your order.`,
      });
    } else {
      setApplied(null);
      toast.error("Invalid promo code", {
        description: `“${code}” is not a valid code.`,
      });
    }
    setPromo("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your cart"
        description={
          lines.length > 0
            ? `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`
            : "Your cart is currently empty"
        }
      >
        <Button variant="outline" asChild>
          <Link href="/products">
            <IconArrowLeft className="size-4" /> Continue shopping
          </Link>
        </Button>
      </PageHeader>

      {lines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <IconShoppingCartOff className="size-8" />
            </span>
            <div className="space-y-1">
              <p className="text-lg font-semibold tracking-tight">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground">
                Looks like you haven&apos;t added anything yet.
              </p>
            </div>
            <Button asChild>
              <Link href="/products">
                <IconShoppingCart className="size-4" /> Browse products
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT — line items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart items</CardTitle>
                <CardDescription>
                  Review your items before checking out.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y">
                  {lines.map((line) => (
                    <li
                      key={line.id}
                      className="flex gap-4 px-6 py-4 first:pt-0 last:pb-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={line.image}
                        alt={line.name}
                        width={80}
                        height={80}
                        className="size-16 shrink-0 rounded-lg border bg-muted object-cover sm:size-20"
                      />
                      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/products/${line.id}`}
                            className="font-medium hover:underline"
                          >
                            {line.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {line.category} · {line.id}
                          </p>
                          <p className="text-sm text-muted-foreground tabular-nums">
                            {currency(line.price)} each
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <div className="flex items-center rounded-lg border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-r-none"
                              onClick={() => setQty(line.id, line.qty - 1)}
                              disabled={line.qty <= 1}
                              aria-label={`Decrease quantity of ${line.name}`}
                            >
                              <IconMinus className="size-4" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium tabular-nums">
                              {line.qty}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-l-none"
                              onClick={() => setQty(line.id, line.qty + 1)}
                              aria-label={`Increase quantity of ${line.name}`}
                            >
                              <IconPlus className="size-4" />
                            </Button>
                          </div>
                          <span className="w-20 text-right font-medium tabular-nums">
                            {currency(line.price * line.qty)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 text-muted-foreground hover:text-destructive"
                            onClick={() => removeLine(line.id)}
                            aria-label={`Remove ${line.name}`}
                          >
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/products">
                    <IconArrowLeft className="size-4" /> Continue shopping
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={clearCart}
                >
                  <IconTrash className="size-4" /> Clear cart
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* RIGHT — order summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">
                      Subtotal · {itemCount} item{itemCount === 1 ? "" : "s"}
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {currency(subtotal)}
                    </dd>
                  </div>
                  {applied && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">
                        Discount ({applied.code})
                      </dt>
                      <dd className="font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                        −{currency(discount)}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="font-medium tabular-nums">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Free
                        </span>
                      ) : (
                        currency(shipping)
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Estimated tax (8%)</dt>
                    <dd className="font-medium tabular-nums">{currency(tax)}</dd>
                  </div>
                </dl>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-lg font-semibold tabular-nums">
                    {currency(total)}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    <IconTruck className="size-4 shrink-0" />
                    Add {currency(FREE_SHIPPING_THRESHOLD - subtotal)} more to
                    unlock free shipping.
                  </p>
                )}

                <form onSubmit={applyPromo} className="space-y-2">
                  <label
                    htmlFor="promo"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IconTag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="promo"
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        placeholder="SAVE10"
                        className="pl-9"
                      />
                    </div>
                    <Button type="submit" variant="outline">
                      Apply
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button size="lg" asChild>
                  <Link href="/checkout">
                    Proceed to checkout <IconArrowRight className="size-4" />
                  </Link>
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <IconShieldCheck className="size-3.5" /> Secure checkout · 256-bit
                  encryption
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
