"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconUser,
  IconShoppingCart,
  IconPackage,
  IconFileDescription,
  IconChevronRight,
  IconX,
  IconCornerDownLeft,
  IconLayoutDashboard,
  IconUsers,
  IconReportAnalytics,
  IconShieldLock,
  IconUsersGroup,
  IconSettings,
  IconPlugConnected,
  IconReceipt2,
  IconBell,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { customers, orders, productList } from "@/data";

type ResultType = "customer" | "order" | "product" | "page";

type Result = {
  key: string;
  type: ResultType;
  title: string;
  subtitle: string;
  href: string;
  avatar?: string;
  image?: string;
};

const typeMeta: Record<
  ResultType,
  {
    label: string;
    plural: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }
> = {
  customer: {
    label: "Customer",
    plural: "Customers",
    icon: IconUser,
    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  order: {
    label: "Order",
    plural: "Orders",
    icon: IconShoppingCart,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  product: {
    label: "Product",
    plural: "Products",
    icon: IconPackage,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  page: {
    label: "Page",
    plural: "Pages",
    icon: IconFileDescription,
    tone: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

const navPages = [
  { title: "Dashboard", path: "/dashboard", icon: IconLayoutDashboard },
  { title: "Customers", path: "/customers", icon: IconUsers },
  { title: "Orders", path: "/orders", icon: IconShoppingCart },
  { title: "Products", path: "/products", icon: IconPackage },
  { title: "Reports", path: "/reports", icon: IconReportAnalytics },
  { title: "Roles & Permissions", path: "/roles", icon: IconShieldLock },
  { title: "Team", path: "/team", icon: IconUsersGroup },
  { title: "Integrations", path: "/integrations", icon: IconPlugConnected },
  { title: "Invoices", path: "/invoices", icon: IconReceipt2 },
  { title: "Notifications", path: "/notifications", icon: IconBell },
  { title: "Settings", path: "/settings", icon: IconSettings },
];

// Unified, deterministic index across the data sources.
const allResults: Result[] = [
  ...customers.map((c) => ({
    key: `c-${c.id}`,
    type: "customer" as const,
    title: c.name,
    subtitle: c.email,
    href: `/customers/${c.id}`,
    avatar: c.avatar,
  })),
  ...orders.map((o) => ({
    key: `o-${o.id}`,
    type: "order" as const,
    title: o.id,
    subtitle: `${o.customer} · ${o.product}`,
    href: `/orders/${o.id.replace("#", "")}`,
    avatar: o.avatar,
  })),
  ...productList.map((p) => ({
    key: `p-${p.id}`,
    type: "product" as const,
    title: p.name,
    subtitle: `${p.category} · $${p.price}`,
    href: `/products/${p.id}`,
    image: p.image,
  })),
  ...navPages.map((p) => ({
    key: `n-${p.path}`,
    type: "page" as const,
    title: p.title,
    subtitle: p.path,
    href: p.path,
  })),
];

const TAB_ORDER: ResultType[] = ["customer", "order", "product", "page"];
const SECTION_LIMIT = 5;

function ResultRow({ result }: { result: Result }) {
  const meta = typeMeta[result.type];
  return (
    <Link
      href={result.href}
      className="-mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
    >
      {result.avatar ? (
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={result.avatar} alt={result.title} />
          <AvatarFallback>{result.title.slice(0, 2)}</AvatarFallback>
        </Avatar>
      ) : result.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result.image}
          alt={result.title}
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-md border bg-muted object-cover"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <meta.icon className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{result.title}</p>
        <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>
      </div>
      <Badge
        variant="secondary"
        className={cn("hidden sm:inline-flex", meta.tone)}
      >
        {meta.label}
      </Badge>
      <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("a");
  const [tab, setTab] = useState<string>("all");

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return allResults;
    return allResults.filter((r) =>
      `${r.title} ${r.subtitle}`.toLowerCase().includes(q)
    );
  }, [q]);

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      all: filtered.length,
      customer: 0,
      order: 0,
      product: 0,
      page: 0,
    };
    for (const r of filtered) base[r.type] += 1;
    return base;
  }, [filtered]);

  const tabbed = useMemo(
    () => (tab === "all" ? filtered : filtered.filter((r) => r.type === tab)),
    [filtered, tab]
  );

  const tabs: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    { value: "customer", label: "Customers" },
    { value: "order", label: "Orders" },
    { value: "product", label: "Products" },
    { value: "page", label: "Pages" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search results"
        description="Find customers, orders, products and pages across the workspace."
      />

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything…"
          aria-label="Search"
          className="h-12 pr-24 pl-12 text-base"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <IconX className="size-4" />
            </button>
          )}
          <Kbd className="hidden h-auto px-1.5 py-0.5 text-[10px] sm:inline-flex">
            <IconCornerDownLeft className="size-3" /> Enter
          </Kbd>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-1 overflow-x-auto px-1">
            <TabsList>
              {tabs.map((t) => {
                const c = counts[t.value] ?? 0;
                return (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                    <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                      {c}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length.toLocaleString()} result
            {filtered.length === 1 ? "" : "s"}
            {q && (
              <>
                {" "}
                for <span className="font-medium text-foreground">“{query}”</span>
              </>
            )}
          </p>
        </div>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-0">
            {tabbed.length === 0 ? (
              <EmptyState query={query} />
            ) : t.value === "all" ? (
              <div className="space-y-4">
                {TAB_ORDER.map((type) => {
                  const group = filtered.filter((r) => r.type === type);
                  if (group.length === 0) return null;
                  const meta = typeMeta[type];
                  const shown = group.slice(0, SECTION_LIMIT);
                  const extra = group.length - shown.length;
                  return (
                    <Card key={type}>
                      <CardContent className="space-y-1">
                        <div className="mb-1 flex items-center gap-2">
                          <meta.icon className="size-4 text-muted-foreground" />
                          <h2 className="text-sm font-semibold">{meta.plural}</h2>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {group.length}
                          </span>
                        </div>
                        {shown.map((r) => (
                          <ResultRow key={r.key} result={r} />
                        ))}
                        {extra > 0 && (
                          <button
                            type="button"
                            onClick={() => setTab(type)}
                            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-muted/50"
                          >
                            Show {extra} more {meta.plural.toLowerCase()}
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="space-y-1">
                  {tabbed.map((r) => (
                    <ResultRow key={r.key} result={r} />
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <IconSearch className="size-6" />
        </span>
        <p className="text-base font-medium">No results found</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {query.trim()
            ? `We couldn't find anything matching “${query.trim()}”. Try a different term or check your spelling.`
            : "Start typing to search across customers, orders, products and pages."}
        </p>
      </CardContent>
    </Card>
  );
}
