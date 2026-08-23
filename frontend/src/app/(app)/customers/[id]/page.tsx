import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBuilding,
  IconCalendar,
  IconId,
  IconShoppingBag,
  IconCreditCard,
  IconWallet,
  IconReceipt,
  IconActivity,
  IconArrowUpRight,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  customers,
  getCustomerById,
  orders,
  recentActivity,
  type Customer,
  type Order,
} from "@/data";
import { CustomerActions } from "./customer-actions";

export const metadata = { title: "Customer" };

const statusStyles: Record<Customer["status"], string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Inactive: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const planStyles: Record<Customer["plan"], string> = {
  Free: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Pro: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Enterprise: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const orderStatusStyles: Record<Order["status"], string> = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Refunded: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  Failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function currency(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateStaticParams() {
  return customers.map((c) => ({ id: c.id }));
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getCustomerById(id);
  if (!customer) notFound();

  // Deterministic synthesized figures (no Math.random at render).
  const num = parseInt(customer.id.replace(/\D/g, ""), 10);
  const orderCount = 6 + (num % 18);
  const totalSpent = customer.spent;
  const avgOrder = Math.round(totalSpent / orderCount);
  const lifetimeValue = Math.round(totalSpent * 1.35 + 480);
  const first = customer.name.split(" ")[0];
  const role = ["Billing Owner", "Account Admin", "Procurement Lead", "Founder"][
    num % 4
  ];
  const phone = `+1 (415) 555-0${(100 + (num % 800)).toString()}`;

  // Related orders derived from the global orders data, re-attributed to
  // this customer for a believable per-customer order history.
  const start = num % 30;
  const customerOrders = orders.slice(start, start + 4).map((o) => ({
    ...o,
    customer: customer.name,
    avatar: customer.avatar,
  }));

  const activity = recentActivity.slice(0, 5).map((a) => ({
    ...a,
    user: customer.name,
    avatar: customer.avatar,
  }));

  const notes = [
    {
      author: "Alex Morgan",
      time: "3 days ago",
      body: `Renewal call went well — ${first} is happy with the onboarding and is evaluating additional seats for Q3.`,
    },
    {
      author: "Priya Nair",
      time: "2 weeks ago",
      body: "Flagged a billing address update. Verified with finance and updated the account record.",
    },
  ];

  const initials = customer.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  const tiles = [
    {
      label: "Total spent",
      value: currency(totalSpent),
      hint: "Lifetime to date",
      icon: IconWallet,
    },
    {
      label: "Orders",
      value: orderCount.toLocaleString("en-US"),
      hint: "All time",
      icon: IconShoppingBag,
    },
    {
      label: "Avg. order",
      value: currency(avgOrder),
      hint: "Per transaction",
      icon: IconCreditCard,
    },
    {
      label: "Lifetime value",
      value: currency(lifetimeValue),
      hint: "Projected",
      icon: IconReceipt,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-9 shrink-0" asChild>
            <Link href="/customers">
              <IconArrowLeft className="size-4" />
              <span className="sr-only">Back to customers</span>
            </Link>
          </Button>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {customer.name}
              </h1>
              <Badge variant="secondary" className={statusStyles[customer.status]}>
                {customer.status}
              </Badge>
              <Badge variant="secondary" className={planStyles[customer.plan]}>
                {customer.plan}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.company} · Customer since {formatDate(customer.joined)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CustomerActions
            id={customer.id}
            name={customer.name}
            email={customer.email}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile card */}
          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="size-20 rounded-xl">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback className="rounded-xl text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-lg font-semibold tracking-tight">
                    {customer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {role} · {customer.company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              </div>

              <Separator />

              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <MetaRow icon={IconMail} label="Email" value={customer.email} />
                <MetaRow icon={IconPhone} label="Phone" value={phone} />
                <MetaRow
                  icon={IconBuilding}
                  label="Company"
                  value={customer.company}
                />
                <MetaRow
                  icon={IconMapPin}
                  label="Location"
                  value={customer.location}
                />
                <MetaRow
                  icon={IconCalendar}
                  label="Joined"
                  value={formatDate(customer.joined)}
                />
                <MetaRow
                  icon={IconId}
                  label="Customer ID"
                  value={customer.id}
                  mono
                />
              </dl>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Contact details</p>
                      <dl className="space-y-3">
                        <DetailLine label="Full name" value={customer.name} />
                        <DetailLine label="Email" value={customer.email} />
                        <DetailLine label="Phone" value={phone} />
                        <DetailLine
                          label="Location"
                          value={customer.location}
                        />
                      </dl>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Account details</p>
                      <dl className="space-y-3">
                        <DetailLine
                          label="Plan"
                          value={
                            <Badge
                              variant="secondary"
                              className={planStyles[customer.plan]}
                            >
                              {customer.plan}
                            </Badge>
                          }
                        />
                        <DetailLine
                          label="Status"
                          value={
                            <Badge
                              variant="secondary"
                              className={statusStyles[customer.status]}
                            >
                              {customer.status}
                            </Badge>
                          }
                        />
                        <DetailLine label="Role" value={role} />
                        <DetailLine
                          label="Member since"
                          value={formatDate(customer.joined)}
                        />
                      </dl>
                    </div>
                  </div>
                </TabsContent>

                {/* Orders */}
                <TabsContent value="orders" className="mt-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium tabular-nums">
                              {o.id}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {o.product}
                            </TableCell>
                            <TableCell className="text-muted-foreground tabular-nums">
                              {o.date}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={orderStatusStyles[o.status]}
                              >
                                {o.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              ${o.amount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Activity */}
                <TabsContent value="activity" className="mt-6">
                  <ol className="relative space-y-5 border-l pl-6">
                    {activity.map((a) => (
                      <li key={a.id} className="relative">
                        <span className="absolute -left-[31px] top-0.5">
                          <Avatar className="size-6 ring-4 ring-background">
                            <AvatarImage src={a.avatar} alt={a.user} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                        </span>
                        <p className="text-sm">
                          <span className="font-medium">{a.user}</span>{" "}
                          {a.action}{" "}
                          {a.target && (
                            <span className="font-medium">{a.target}</span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {a.time}
                        </span>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {tiles.map((t) => (
              <Card key={t.label}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t.label}
                    </p>
                    <t.icon className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {t.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconActivity className="size-4" /> Recent orders
              </CardTitle>
              <CardDescription>Latest activity for this account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {customerOrders.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center gap-3 text-sm">
                  <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <IconShoppingBag className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.product}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {o.id} · {o.date}
                    </p>
                  </div>
                  <span className="font-medium tabular-nums">${o.amount}</span>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/orders">
                  View all orders <IconArrowUpRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
              <CardDescription>Internal notes, visible to your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notes.map((n, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{n.author}</p>
                    <span className="text-xs text-muted-foreground">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  {i < notes.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd
          className={
            mono
              ? "truncate text-sm font-medium tabular-nums"
              : "truncate text-sm font-medium"
          }
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
