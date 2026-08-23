import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft,
  IconReceipt,
  IconShoppingBag,
  IconCreditCard,
  IconCalendar,
  IconMail,
  IconMapPin,
  IconTruck,
  IconPackage,
  IconCheck,
  IconX,
  IconClock,
  IconBrandPaypal,
  IconBrandApple,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { orders, getOrderById, type Order } from "@/data";
import { OrderActions } from "./order-actions";

export const metadata = { title: "Order" };

export function generateStaticParams() {
  return orders.map((o) => ({ id: o.id.replace("#", "") }));
}

const orderStatusStyles: Record<Order["status"], string> = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Refunded: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

const longDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
}

// Deterministic synthesized data (no Math.random at render).
const emailDomains = ["gmail.com", "outlook.com", "icloud.com", "proton.me", "fastmail.com"];

const streets = [
  "Maple Avenue",
  "Oakwood Drive",
  "Cedar Grove",
  "Birch Street",
  "Willow Court",
  "Riverside Lane",
  "Highland Road",
  "Bayview Terrace",
  "Sunset Boulevard",
  "Park Place",
];

const cities = [
  { city: "Austin", state: "TX", zip: "78701" },
  { city: "Denver", state: "CO", zip: "80202" },
  { city: "Seattle", state: "WA", zip: "98101" },
  { city: "Brooklyn", state: "NY", zip: "11201" },
  { city: "Portland", state: "OR", zip: "97201" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "Miami", state: "FL", zip: "33139" },
  { city: "Boston", state: "MA", zip: "02116" },
];

const accessoryCatalog = [
  { name: "Extended warranty (2 yr)", unitPrice: 39 },
  { name: "Express delivery upgrade", unitPrice: 18 },
  { name: "Gift wrapping", unitPrice: 9 },
  { name: "USB-C charging cable", unitPrice: 15 },
  { name: "Protective carry case", unitPrice: 24 },
  { name: "Setup & installation", unitPrice: 45 },
];

const timelineSteps = [
  { label: "Order placed", desc: "We received the order", offset: 0, icon: IconShoppingBag },
  { label: "Payment confirmed", desc: "Payment authorized", offset: 0, icon: IconCreditCard },
  { label: "Processing", desc: "Preparing your items", offset: 1, icon: IconPackage },
  { label: "Shipped", desc: "Handed to the carrier", offset: 2, icon: IconTruck },
  { label: "Delivered", desc: "Arrived at destination", offset: 4, icon: IconCheck },
] as const;

// How many steps are complete for each order status.
const stageByStatus: Record<Order["status"], number> = {
  Failed: 1,
  Pending: 1,
  Paid: 4,
  Refunded: 5,
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  const slug = order.id.replace("#", "");
  const num = parseInt(order.id.replace(/\D/g, ""), 10) || 0;

  // --- Synthesized line items whose totals reconcile to order.amount ---
  const amount = order.amount;
  const shipping = amount >= 100 ? 0 : 9;
  const net = amount - shipping;
  const subtotal = Math.round(net / 1.08);
  const tax = net - subtotal;

  const itemCount = subtotal < 90 ? 1 : (num % 3) + 1;
  const extras = itemCount - 1;
  const lineItems: { name: string; qty: number; unitPrice: number; total: number }[] = [];
  let accTotal = 0;
  for (let j = 0; j < extras; j++) {
    const acc = accessoryCatalog[(num + j) % accessoryCatalog.length];
    const qty = ((num + j) % 2) + 1;
    const lineTotal = acc.unitPrice * qty;
    if (accTotal + lineTotal <= subtotal - 20) {
      lineItems.push({ name: acc.name, qty, unitPrice: acc.unitPrice, total: lineTotal });
      accTotal += lineTotal;
    }
  }
  const primaryTotal = subtotal - accTotal;
  lineItems.unshift({
    name: order.product,
    qty: 1,
    unitPrice: primaryTotal,
    total: primaryTotal,
  });
  const totalQty = lineItems.reduce((a, b) => a + b.qty, 0);

  // --- Customer ---
  const [firstName, lastName = ""] = order.customer.split(" ");
  const email = `${firstName}.${lastName}@${emailDomains[num % emailDomains.length]}`.toLowerCase();
  const initials = order.customer
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  // --- Shipping address ---
  const streetNo = 100 + ((num * 7) % 4800);
  const street = streets[num % streets.length];
  const place = cities[num % cities.length];
  const unit = num % 3 === 0 ? `Apt ${(num % 40) + 1}` : "";

  // --- Payment ---
  const last4 = String(1000 + ((num * 4567) % 9000));
  const expMonth = String((num % 12) + 1).padStart(2, "0");
  const isCard = ["Visa", "Mastercard", "Amex"].includes(order.method);

  // --- Timeline ---
  const stage = stageByStatus[order.status];

  const tiles = [
    { label: "Order total", value: usd(amount), hint: "Incl. tax & shipping", icon: IconReceipt },
    { label: "Items", value: totalQty.toLocaleString("en-US"), hint: `${lineItems.length} product line${lineItems.length === 1 ? "" : "s"}`, icon: IconShoppingBag },
    { label: "Payment", value: order.method, hint: isCard ? `•••• ${last4}` : "Linked account", icon: IconCreditCard },
    { label: "Placed", value: longDate(order.date), hint: "Order date", icon: IconCalendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-9 shrink-0" asChild>
            <Link href="/orders">
              <IconArrowLeft className="size-4" />
              <span className="sr-only">Back to orders</span>
            </Link>
          </Button>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight tabular-nums">
                {order.id}
              </h1>
              <Badge variant="secondary" className={orderStatusStyles[order.status]}>
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed {longDate(order.date)} · {totalQty} item{totalQty === 1 ? "" : "s"} · {usd(amount)}
            </p>
          </div>
        </div>
        <OrderActions slug={slug} orderId={order.id} customerEmail={email} />
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{t.label}</p>
                <t.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="truncate text-2xl font-semibold tracking-tight tabular-nums">
                {t.value}
              </p>
              <p className="text-xs text-muted-foreground">{t.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — Items */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconShoppingBag className="size-4" /> Items
              </CardTitle>
              <CardDescription>
                {lineItems.length} product line{lineItems.length === 1 ? "" : "s"} in this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-9">Product</TableHead>
                      <TableHead className="h-9 text-right">Qty</TableHead>
                      <TableHead className="h-9 text-right">Unit price</TableHead>
                      <TableHead className="h-9 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, i) => (
                      <TableRow key={i} className="hover:bg-transparent">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              {i === 0 ? (
                                <IconPackage className="size-4" />
                              ) : (
                                <IconReceipt className="size-4" />
                              )}
                            </span>
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {item.qty}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {usd(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {usd(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
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
                      {usd(amount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Customer / Shipping / Payment / Timeline */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarImage src={order.avatar} alt={order.customer} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.customer}</p>
                  <p className="truncate text-sm text-muted-foreground">{email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <IconMail className="size-4" />
                </span>
                <a
                  href={`mailto:${email}`}
                  className="truncate text-muted-foreground hover:text-foreground hover:underline"
                >
                  {email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconMapPin className="size-4" /> Shipping address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium text-foreground">{order.customer}</p>
              <p className="text-muted-foreground">
                {streetNo} {street}
                {unit ? `, ${unit}` : ""}
              </p>
              <p className="text-muted-foreground">
                {place.city}, {place.state} {place.zip}
              </p>
              <p className="text-muted-foreground">United States</p>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconCreditCard className="size-4" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-foreground">
                  {order.method === "PayPal" ? (
                    <IconBrandPaypal className="size-5" />
                  ) : order.method === "Apple Pay" ? (
                    <IconBrandApple className="size-5" />
                  ) : (
                    <IconCreditCard className="size-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{order.method}</p>
                  {isCard ? (
                    <p className="text-sm text-muted-foreground tabular-nums">
                      •••• •••• •••• {last4} · Exp {expMonth}/27
                    </p>
                  ) : order.method === "PayPal" ? (
                    <p className="truncate text-sm text-muted-foreground">{email}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground tabular-nums">
                      Device account · •••• {last4}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
              <CardDescription>Fulfilment progress for this order</CardDescription>
            </CardHeader>
            <CardContent>
              <ol>
                {timelineSteps.map((step, i) => {
                  let state: "done" | "current" | "failed" | "pending" | "future";
                  if (order.status === "Failed" && i === 1) state = "failed";
                  else if (order.status === "Pending" && i === 1) state = "pending";
                  else if (i < stage) state = "done";
                  else if (i === stage) state = "current";
                  else state = "future";

                  const DisplayIcon =
                    state === "done"
                      ? IconCheck
                      : state === "failed"
                        ? IconX
                        : state === "pending"
                          ? IconClock
                          : step.icon;

                  const circleClass =
                    state === "done"
                      ? "border-transparent bg-emerald-500 text-white"
                      : state === "current"
                        ? "border-primary bg-background text-primary"
                        : state === "failed"
                          ? "border-transparent bg-rose-500 text-white"
                          : state === "pending"
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-border bg-muted text-muted-foreground";

                  const rightText =
                    state === "failed"
                      ? "Payment failed"
                      : state === "pending"
                        ? "Awaiting payment"
                        : state === "done"
                          ? longDate(addDays(order.date, step.offset))
                          : state === "current"
                            ? i === timelineSteps.length - 1
                              ? `Est. ${longDate(addDays(order.date, step.offset))}`
                              : "In progress"
                            : "Pending";

                  return (
                    <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < timelineSteps.length - 1 && (
                        <span
                          className={cn(
                            "absolute left-[15px] top-8 bottom-0 w-px",
                            i < stage ? "bg-emerald-500/40" : "bg-border"
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                          circleClass
                        )}
                      >
                        <DisplayIcon className="size-4" />
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-3 pt-1">
                        <div>
                          <p className="text-sm font-medium leading-none">{step.label}</p>
                          <p className="mt-1.5 text-xs text-muted-foreground">{step.desc}</p>
                        </div>
                        <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                          {rightText}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {order.status === "Refunded" && (
                <div className="mt-1 rounded-md bg-slate-500/10 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                  Refunded {longDate(addDays(order.date, 6))} · {usd(amount)} returned to {order.method}.
                </div>
              )}
              {order.status === "Failed" && (
                <div className="mt-1 rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                  Payment was declined. Ask the customer to retry with another method.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
