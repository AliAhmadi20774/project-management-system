"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconMail,
  IconMapPin,
  IconTruck,
  IconBolt,
  IconRocket,
  IconCreditCard,
  IconLock,
  IconBrandVisa,
  IconBrandMastercard,
  IconBrandPaypal,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { productList, type Product } from "@/data";

type CartLine = Product & { qty: number };

const TAX_RATE = 0.08;

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const summaryLines: CartLine[] = productList
  .slice(0, 3)
  .map((p, i) => ({ ...p, qty: [1, 2, 1][i] ?? 1 }));

const deliveryOptions = [
  {
    id: "standard",
    label: "Standard",
    description: "4–6 business days",
    price: 0,
    icon: IconTruck,
  },
  {
    id: "express",
    label: "Express",
    description: "2–3 business days",
    price: 12,
    icon: IconBolt,
  },
  {
    id: "overnight",
    label: "Overnight",
    description: "Next business day",
    price: 28,
    icon: IconRocket,
  },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [delivery, setDelivery] = useState<string>("standard");

  const subtotal = useMemo(
    () => summaryLines.reduce((sum, l) => sum + l.price * l.qty, 0),
    []
  );
  const shipping =
    deliveryOptions.find((o) => o.id === delivery)?.price ?? 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Order placed", {
      description: `Thanks! Your order total of ${currency(total)} is confirmed.`,
    });
    router.push("/orders");
  }

  return (
    <form onSubmit={placeOrder} className="space-y-6">
      <PageHeader title="Checkout" description="Complete your purchase securely.">
        <Button type="button" variant="outline" asChild>
          <Link href="/cart">
            <IconArrowLeft className="size-4" /> Back to cart
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* MAIN */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconMail className="size-4" /> Contact information
              </CardTitle>
              <CardDescription>
                We&apos;ll send your receipt and updates here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  defaultValue="alex.morgan@orbynadmin.com"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconMapPin className="size-4" /> Shipping address
              </CardTitle>
              <CardDescription>Where should we deliver your order?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullname">Full name</Label>
                  <Input
                    id="fullname"
                    placeholder="Alex Morgan"
                    defaultValue="Alex Morgan"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Street address</Label>
                  <Input
                    id="address"
                    placeholder="2100 Market Street, Suite 400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="San Francisco" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" placeholder="California" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP / Postal code</Label>
                  <Input id="zip" placeholder="94114" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue="US">
                    <SelectTrigger id="country" className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconTruck className="size-4" /> Delivery method
              </CardTitle>
              <CardDescription>Choose how fast you need it.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={delivery} onValueChange={setDelivery}>
                {deliveryOptions.map((o) => (
                  <Label
                    key={o.id}
                    htmlFor={`delivery-${o.id}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                      delivery === o.id
                        ? "border-primary ring-1 ring-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <RadioGroupItem value={o.id} id={`delivery-${o.id}`} />
                    <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <o.icon className="size-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{o.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {o.price === 0 ? "Free" : currency(o.price)}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconCreditCard className="size-4" /> Payment
              </CardTitle>
              <CardDescription>
                All transactions are secure and encrypted.
              </CardDescription>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <IconBrandVisa className="size-7" />
                <IconBrandMastercard className="size-7" />
                <IconBrandPaypal className="size-7" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="card">Card number</Label>
                  <div className="relative">
                    <IconCreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="card"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="card-name">Name on card</Label>
                  <Input
                    id="card-name"
                    placeholder="Alex Morgan"
                    defaultValue="Alex Morgan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry date</Label>
                  <Input id="expiry" placeholder="MM / YY" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <div className="relative">
                    <IconLock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="cvc"
                      inputMode="numeric"
                      placeholder="123"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>
                {summaryLines.length} item
                {summaryLines.length === 1 ? "" : "s"} in your order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-4">
                {summaryLines.map((line) => (
                  <li key={line.id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={line.image}
                        alt={line.name}
                        width={48}
                        height={48}
                        className="size-12 rounded-lg border bg-muted object-cover"
                      />
                      <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground tabular-nums">
                        {line.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {line.category}
                      </p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {currency(line.price * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator />

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium tabular-nums">
                    {currency(subtotal)}
                  </dd>
                </div>
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

              <Button type="submit" size="lg" className="w-full">
                <IconLock className="size-4" /> Place order
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By placing your order you agree to our terms and privacy policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
