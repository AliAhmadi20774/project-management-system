"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconDotsVertical,
  IconMapPinCheck,
  IconPrinter,
  IconPackage,
  IconTruck,
  IconTruckDelivery,
  IconTruckReturn,
  IconWorld,
  IconBolt,
  IconArrowRight,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orders } from "@/data";

type ShipStatus =
  | "Pending"
  | "Label created"
  | "In transit"
  | "Delivered"
  | "Returned";

type Shipment = {
  id: string;
  order: string;
  customer: string;
  avatar: string;
  carrier: "FedEx" | "UPS" | "DHL" | "USPS";
  tracking: string;
  shipDate: string;
  status: ShipStatus;
};

const carriers: Shipment["carrier"][] = ["FedEx", "UPS", "DHL", "USPS"];
const flow: ShipStatus[] = [
  "In transit",
  "Delivered",
  "Label created",
  "Delivered",
  "Pending",
  "In transit",
  "Delivered",
  "Returned",
];

function trackingFor(carrier: Shipment["carrier"], n: number) {
  const digits = (n * 733 + 100000).toString().padStart(9, "0");
  switch (carrier) {
    case "UPS":
      return `1Z999AA${digits.slice(0, 8)}`;
    case "FedEx":
      return `FX${digits}${(n % 90) + 10}`;
    case "DHL":
      return `DHL${digits}DE`;
    case "USPS":
      return `94055${digits}US`;
  }
}

const initialShipments: Shipment[] = orders.slice(0, 12).map((o, i) => {
  const carrier = carriers[i % carriers.length];
  const num = parseInt(o.id.replace(/\D/g, ""), 10);
  return {
    id: `SHP-${9000 + i}`,
    order: o.id,
    customer: o.customer,
    avatar: o.avatar,
    carrier,
    tracking: trackingFor(carrier, num),
    shipDate: new Date(2026, 6, ((i * 2) % 26) + 1).toISOString().slice(0, 10),
    status: flow[i % flow.length],
  };
});

const statusStyles: Record<ShipStatus, string> = {
  Pending: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  "Label created": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "In transit": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Returned: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const zones = [
  {
    name: "Domestic",
    icon: IconTruck,
    color: "text-emerald-600 dark:text-emerald-400",
    tint: "bg-emerald-500/10",
    description: "Contiguous US ground shipping",
    estimate: "2–5 business days",
    carriers: "USPS · UPS Ground",
    range: "$4.99 – $12.99",
    rates: [
      { label: "Standard", price: "$4.99" },
      { label: "Priority", price: "$8.99" },
      { label: "Free over $75", price: "$0.00" },
    ],
  },
  {
    name: "International",
    icon: IconWorld,
    color: "text-blue-600 dark:text-blue-400",
    tint: "bg-blue-500/10",
    description: "Worldwide delivery with tracking",
    estimate: "7–21 business days",
    carriers: "DHL · FedEx International",
    range: "$18.00 – $60.00",
    rates: [
      { label: "Economy", price: "$18.00" },
      { label: "Tracked", price: "$34.00" },
      { label: "Priority", price: "$60.00" },
    ],
  },
  {
    name: "Express",
    icon: IconBolt,
    color: "text-violet-600 dark:text-violet-400",
    tint: "bg-violet-500/10",
    description: "Overnight and 2-day guaranteed",
    estimate: "1–2 business days",
    carriers: "FedEx · UPS Air",
    range: "$24.99 – $45.00",
    rates: [
      { label: "2-Day", price: "$24.99" },
      { label: "Overnight", price: "$39.00" },
      { label: "Priority AM", price: "$45.00" },
    ],
  },
];

function Tile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ShippingPage() {
  const [rows, setRows] = useState<Shipment[]>(initialShipments);

  const stats = useMemo(() => {
    const toFulfil = rows.filter(
      (s) => s.status === "Pending" || s.status === "Label created"
    ).length;
    const inTransit = rows.filter((s) => s.status === "In transit").length;
    const delivered = rows.filter((s) => s.status === "Delivered").length;
    const returns = rows.filter((s) => s.status === "Returned").length;
    return { toFulfil, inTransit, delivered, returns };
  }, [rows]);

  function markDelivered(id: string) {
    setRows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Delivered" } : s))
    );
    toast.success("Marked as delivered", {
      description: "The customer has been notified.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping"
        description="Track fulfilment, carriers and delivery across your orders."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="To fulfil"
          value={stats.toFulfil.toLocaleString()}
          hint="Awaiting a shipment"
          icon={IconPackage}
        />
        <Tile
          label="In transit"
          value={stats.inTransit.toLocaleString()}
          hint="On the way to customers"
          icon={IconTruckDelivery}
        />
        <Tile
          label="Delivered"
          value={stats.delivered.toLocaleString()}
          hint="Completed this week"
          icon={IconMapPinCheck}
        />
        <Tile
          label="Returns"
          value={stats.returns.toLocaleString()}
          hint="Sent back by customers"
          icon={IconTruckReturn}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>
            Every parcel in flight, with carrier and tracking detail.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[880px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Ship date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6 font-medium tabular-nums">
                      {s.order}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={s.avatar} alt={s.customer} />
                          <AvatarFallback>{s.customer.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{s.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.carrier}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.tracking}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {formatDate(s.shipDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusStyles[s.status]}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              toast("Opening tracking", {
                                description: `${s.carrier} · ${s.tracking}`,
                              })
                            }
                          >
                            <IconTruckDelivery className="size-4" /> Track
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success("Label sent to printer", {
                                description: `Shipping label for ${s.order}.`,
                              })
                            }
                          >
                            <IconPrinter className="size-4" /> Print label
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={s.status === "Delivered"}
                            onSelect={() => markDelivered(s.id)}
                          >
                            <IconMapPinCheck className="size-4" /> Mark delivered
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

      <div>
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Shipping zones &amp; rates
          </h2>
          <p className="text-sm text-muted-foreground">
            Delivery options and pricing offered at checkout.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {zones.map((z) => (
            <Card key={z.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-10 items-center justify-center rounded-lg ${z.tint} ${z.color}`}
                  >
                    <z.icon className="size-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{z.name}</CardTitle>
                    <CardDescription>{z.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">
                    {z.range}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconTruck className="size-4" />
                  {z.estimate}
                </div>
                <Separator />
                <ul className="space-y-2.5">
                  {z.rates.map((r) => (
                    <li
                      key={r.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <IconArrowRight className="size-3.5" />
                        {r.label}
                      </span>
                      <span className="font-medium tabular-nums">{r.price}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">{z.carriers}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
