"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { customers, productList } from "@/data";

const customerOptions = customers.slice(0, 8);
const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"];
const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany"];

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

type LineItem = { key: number; productId: string; qty: string; price: string };

export default function NewOrderPage() {
  const router = useRouter();
  const nextKey = useRef(3);

  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { key: 1, productId: "", qty: "1", price: "" },
    { key: 2, productId: "", qty: "1", price: "" },
  ]);
  const [method, setMethod] = useState("Visa");

  const [shipName, setShipName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");

  function updateItem(key: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function onProductChange(key: number, productId: string) {
    const product = productList.find((p) => p.id === productId);
    updateItem(key, {
      productId,
      price: product ? String(product.price) : "",
    });
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = customerOptions.find((c) => c.id === customer)?.name;
    toast.success("Order created", {
      description: `${name ? `${name}'s order` : "New order"} for ${usd(total)} has been placed.`,
    });
    router.push("/orders");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 gap-2 text-muted-foreground"
        >
          <Link href="/orders">
            <IconArrowLeft className="size-4" /> Back to orders
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create Order</h1>
          <p className="text-sm text-muted-foreground">
            Add a new order manually and send it straight to fulfilment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/orders">Cancel</Link>
          </Button>
          <Button type="submit" className="gap-2">
            <IconDeviceFloppy className="size-4" /> Save order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Customer */}
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
              <p className="text-xs text-muted-foreground">
                Can&apos;t find them? Create the customer first, then add the order.
              </p>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>
                Add the products included in this order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Column labels (sm+) */}
              <div className="hidden gap-3 sm:grid sm:grid-cols-[1fr_5rem_7rem_2.25rem]">
                <Label className="text-xs text-muted-foreground">Product</Label>
                <Label className="text-xs text-muted-foreground">Qty</Label>
                <Label className="text-xs text-muted-foreground">Unit price</Label>
                <span />
              </div>

              {items.map((it) => {
                const lineTotal =
                  (Number(it.qty) || 0) * (Number(it.price) || 0);
                return (
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
                          onChange={(e) =>
                            updateItem(it.key, { price: e.target.value })
                          }
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

                    {lineTotal > 0 && (
                      <p className="text-xs text-muted-foreground tabular-nums sm:hidden">
                        Line total: {usd(lineTotal)}
                      </p>
                    )}
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="gap-2"
              >
                <IconPlus className="size-4" /> Add item
              </Button>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
              <CardDescription>Where should this order be delivered?</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ship-name">Recipient name</Label>
                <Input
                  id="ship-name"
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                  placeholder="e.g. Emma Carter"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address1">Address line 1</Label>
                <Input
                  id="address1"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="123 Maple Avenue"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address2">Address line 2</Label>
                <Input
                  id="address2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apt, suite, unit (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Austin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">State / Region</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="TX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP / Postal code</Label>
                <Input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="78701"
                  className="tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Payment + summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>How is the customer paying?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="method">Payment method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method" className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <IconDeviceFloppy className="size-4" /> Save order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
