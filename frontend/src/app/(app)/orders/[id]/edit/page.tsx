"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconShoppingBag,
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customers, productList, getOrderById } from "@/data";

const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"];
const statuses = ["Paid", "Pending", "Refunded", "Failed"];

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

type LineItem = { key: number; productId: string; qty: string; price: string };

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const order = getOrderById(params.id);
  const slug = params.id;
  const backHref = `/orders/${slug}`;

  const matchedProduct = order
    ? productList.find((p) => p.name === order.product)
    : undefined;
  const matchedCustomer = order
    ? customers.find((c) => c.name === order.customer)
    : undefined;

  // Customer options always include the order's customer.
  const customerOptions = useMemo(() => {
    const base = customers.slice(0, 8);
    if (matchedCustomer && !base.some((c) => c.id === matchedCustomer.id)) {
      return [matchedCustomer, ...base];
    }
    return base;
  }, [matchedCustomer]);

  const nextKey = useRef(2);
  const [customer, setCustomer] = useState(matchedCustomer?.id ?? "");
  const [status, setStatus] = useState(order?.status ?? "Paid");
  const [method, setMethod] = useState(order?.method ?? "Visa");
  const [items, setItems] = useState<LineItem[]>([
    {
      key: 1,
      productId: matchedProduct?.id ?? "",
      qty: "1",
      price: matchedProduct ? String(matchedProduct.price) : String(order?.amount ?? ""),
    },
  ]);

  function updateItem(key: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }
  function onProductChange(key: number, productId: string) {
    const product = productList.find((p) => p.id === productId);
    updateItem(key, { productId, price: product ? String(product.price) : "" });
  }
  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: nextKey.current++, productId: "", qty: "1", price: "" },
    ]);
  }
  function removeItem(key: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));
  }

  const { subtotal, shipping, tax, total } = useMemo(() => {
    const sub = items.reduce(
      (s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0),
      0
    );
    const ship = sub === 0 ? 0 : sub >= 100 ? 0 : 9;
    const t = Math.round(sub * 0.08);
    return { subtotal: sub, shipping: ship, tax: t, total: sub + ship + t };
  }, [items]);

  if (!order) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Order not found</h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t find that order. It may have been removed.
        </p>
        <Button asChild>
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Order updated", {
      description: `${order!.id} was saved with a total of ${usd(total)}.`,
    });
    router.push(backHref);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          asChild
          className="-ml-2 gap-2 text-muted-foreground"
        >
          <Link href={backHref}>
            <IconArrowLeft className="size-4" /> Back to order
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Order {order.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the customer, line items, status and shipping details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={backHref}>Cancel</Link>
          </Button>
          <Button type="submit" className="gap-2">
            <IconDeviceFloppy className="size-4" /> Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Who is this order for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger id="customer" className="w-full">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customerOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>Products included in this order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="hidden gap-3 sm:grid sm:grid-cols-[1fr_5rem_7rem_2.25rem]">
                <Label className="text-xs text-muted-foreground">Product</Label>
                <Label className="text-xs text-muted-foreground">Qty</Label>
                <Label className="text-xs text-muted-foreground">Unit price</Label>
                <span />
              </div>

              {items.map((it) => (
                <div
                  key={it.key}
                  className="grid gap-3 sm:grid-cols-[1fr_5rem_7rem_2.25rem] sm:items-center"
                >
                  <div className="space-y-1.5">
                    <Label className="sm:hidden">Product</Label>
                    <Select
                      value={it.productId}
                      onValueChange={(v) => onProductChange(it.key, v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {productList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="sm:hidden">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={it.qty}
                      onChange={(e) => updateItem(it.key, { qty: e.target.value })}
                      className="tabular-nums"
                      aria-label="Quantity"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="sm:hidden">Unit price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={it.price}
                        onChange={(e) => updateItem(it.key, { price: e.target.value })}
                        placeholder="0.00"
                        className="pl-7 tabular-nums"
                        aria-label="Unit price"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 justify-self-end text-muted-foreground hover:text-foreground"
                    onClick={() => removeItem(it.key)}
                    disabled={items.length === 1}
                    aria-label="Remove item"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem} className="gap-2">
                <IconPlus className="size-4" /> Add item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & payment</CardTitle>
              <CardDescription>Fulfilment and billing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconShoppingBag className="size-4" /> Order summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{usd(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium tabular-nums">
                  {shipping === 0 ? "Free" : usd(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium tabular-nums">{usd(tax)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-semibold tracking-tight tabular-nums">
                  {usd(total)}
                </span>
              </div>
              <Button type="submit" className="mt-2 w-full gap-2">
                <IconDeviceFloppy className="size-4" /> Save changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
