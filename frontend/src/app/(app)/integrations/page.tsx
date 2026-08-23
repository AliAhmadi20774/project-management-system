"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconSearch,
  IconPlug,
  IconPlugConnected,
  IconApps,
  IconCircleCheckFilled,
  IconKey,
  IconWorld,
  IconCheck,
  IconCopy,
  IconShieldCheck,
  IconTrash,
  IconExternalLink,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { integrations, type Integration } from "@/data";

function scopesFor(i: Integration): string[] {
  const base = ["Read your OrbynAdmin workspace data", `Two-way sync with ${i.name}`];
  const byCategory: Record<string, string[]> = {
    Communication: ["Send messages & alerts to channels", "Read channel and member list"],
    Developer: ["Read repositories, PRs & issues", "Post commit statuses & checks"],
    Payments: ["Read charges, invoices & payouts", "Create payment links"],
    Design: ["Embed files & prototypes", "Read design comments"],
    Productivity: ["Read & write documents", "Sync tasks and pages"],
    Storage: ["Read & attach files", "Create shared folders"],
    Marketing: ["Read & sync contacts", "Trigger campaigns"],
    Support: ["Read conversations & tickets", "Post replies on your behalf"],
    Data: ["Stream events to the warehouse", "Read schema & tables"],
  };
  return [...base, ...(byCategory[i.category] ?? ["Read basic profile", "Write updates"])];
}

function Logo({ i, className }: { i: Integration; className?: string }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-xl text-base font-semibold ring-1 ring-foreground/10",
        className
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${i.color} 18%, transparent)`,
        color: i.color,
      }}
    >
      {i.initial}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl", tint)}>
          <Icon className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(integrations);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [connecting, setConnecting] = useState<Integration | null>(null);
  const [managing, setManaging] = useState<Integration | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(integrations.map((i) => i.category)))],
    []
  );
  const connectedCount = useMemo(() => items.filter((i) => i.connected).length, [items]);
  const availableCount = items.length - connectedCount;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchesCategory = category === "All" || i.category === category;
      const matchesSearch =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  function setConnected(id: string, connected: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, connected } : i)));
  }

  function handleConnect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!connecting) return;
    setConnected(connecting.id, true);
    toast.success(`Connected to ${connecting.name}`, {
      description: "Authorization succeeded — data will now sync automatically.",
    });
    setConnecting(null);
  }

  function handleDisconnect() {
    if (!managing) return;
    setConnected(managing.id, false);
    toast.success(`Disconnected from ${managing.name}`, {
      description: "This integration is no longer syncing.",
    });
    setManaging(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect OrbynAdmin to the tools your team already uses."
      >
        <div className="relative w-full sm:w-64">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations…"
            className="pl-9"
          />
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          icon={IconPlugConnected}
          label="Connected"
          value={connectedCount}
          hint="Active integrations"
          tint="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatTile
          icon={IconApps}
          label="Available"
          value={availableCount}
          hint="Ready to connect"
          tint="bg-slate-500/10 text-slate-600 dark:text-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={category === c ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <IconPlug className="mx-auto mb-2 size-6 opacity-50" />
            No integrations match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <Card key={i.id} className="transition-shadow hover:ring-foreground/20">
              <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Logo i={i} className="size-11" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate font-medium leading-none">{i.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="font-normal">
                        {i.category}
                      </Badge>
                      {i.connected && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          <IconCircleCheckFilled className="size-3" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="flex-1 text-sm text-muted-foreground">{i.description}</p>

                {i.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setManaging(i)}
                  >
                    <IconShieldCheck className="size-4" /> Manage
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setConnecting(i)}
                  >
                    <IconPlugConnected className="size-4" /> Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Connect dialog — collects credentials + shows requested permissions */}
      <Dialog open={!!connecting} onOpenChange={(o) => !o && setConnecting(null)}>
        <DialogContent className="sm:max-w-md">
          {connecting && (
            <form onSubmit={handleConnect}>
              <DialogHeader>
                <div className="mb-1 flex items-center gap-3">
                  <Logo i={connecting} className="size-10" />
                  <div>
                    <DialogTitle>Connect {connecting.name}</DialogTitle>
                    <DialogDescription className="text-xs">
                      {connecting.category} · authorize access to continue
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="flex items-center gap-1.5">
                    <IconKey className="size-3.5 text-muted-foreground" /> API key
                  </Label>
                  <Input
                    id="apiKey"
                    placeholder="sk_live_51H•••••••••••••"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this in your {connecting.name} developer settings.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace" className="flex items-center gap-1.5">
                    <IconWorld className="size-3.5 text-muted-foreground" /> Workspace URL
                  </Label>
                  <Input
                    id="workspace"
                    placeholder={`https://orbynadmin.${connecting.name.toLowerCase().replace(/\s/g, "")}.com`}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {connecting.name} will be able to
                  </p>
                  <ul className="space-y-1.5">
                    {scopesFor(connecting).map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConnecting(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <IconPlugConnected className="size-4" /> Authorize & connect
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage dialog — connection details + disconnect */}
      <Dialog open={!!managing} onOpenChange={(o) => !o && setManaging(null)}>
        <DialogContent className="sm:max-w-md">
          {managing && (
            <>
              <DialogHeader>
                <div className="mb-1 flex items-center gap-3">
                  <Logo i={managing} className="size-10" />
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {managing.name}
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        <IconCircleCheckFilled className="size-3" /> Connected
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Manage your {managing.name} connection
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Connected account</dt>
                    <dd className="font-medium">alex.morgan@orbynadmin.com</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Connected on</dt>
                    <dd className="font-medium">Jul 12, 2026</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="flex items-center gap-1.5 font-medium">
                      <span className="size-2 rounded-full bg-emerald-500" /> Healthy
                    </dd>
                  </div>
                </dl>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={`https://api.orbynadmin.com/hooks/${managing.id.toLowerCase()}`}
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://api.orbynadmin.com/hooks/${managing.id.toLowerCase()}`
                        );
                        toast.success("Webhook URL copied");
                      }}
                    >
                      <IconCopy className="size-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Granted permissions</p>
                  <ul className="space-y-1.5">
                    {scopesFor(managing).map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    toast("Opening documentation", {
                      description: `${managing.name} setup guide`,
                    })
                  }
                >
                  <IconExternalLink className="size-4" /> View docs
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDisconnect}
                >
                  <IconTrash className="size-4" /> Disconnect
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
