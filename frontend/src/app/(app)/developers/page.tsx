"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconPlus,
  IconCopy,
  IconTrash,
  IconDotsVertical,
  IconKey,
  IconWebhook,
  IconWorld,
  IconBolt,
  IconAlertTriangle,
  IconActivity,
  IconReload,
  IconTestPipe,
  IconExternalLink,
  IconCircleCheck,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

// ---------------------------------------------------------------------------
// Types & deterministic key generation (no Math.random / Date.now at render)
// ---------------------------------------------------------------------------

type Scope = "Full access" | "Write" | "Read only";

type ApiKey = {
  id: string;
  name: string;
  token: string;
  scope: Scope;
  created: string;
  lastUsed: string;
};

type Webhook = {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastDelivery: string;
};

function makeSecretKey(seed: number): string {
  const chars = "abcdef0123456789";
  let n = (seed * 2654435761) >>> 0;
  let out = "";
  for (let i = 0; i < 32; i++) {
    n = (n * 1103515245 + 12345) >>> 0;
    out += chars[(n >>> 8) % chars.length];
  }
  return `sk_live_${out}`;
}

function mask(token: string) {
  return `sk_live_…${token.slice(-4)}`;
}

const scopeStyles: Record<Scope, string> = {
  "Full access": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Write: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Read only": "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const initialKeys: ApiKey[] = [
  { id: "key_1", name: "Production", token: makeSecretKey(1001), scope: "Full access", created: "Jan 12, 2026", lastUsed: "2 hours ago" },
  { id: "key_2", name: "Server-side (backend)", token: makeSecretKey(2002), scope: "Write", created: "Feb 03, 2026", lastUsed: "5 minutes ago" },
  { id: "key_3", name: "Analytics read", token: makeSecretKey(3003), scope: "Read only", created: "Mar 21, 2026", lastUsed: "Yesterday" },
  { id: "key_4", name: "Mobile app", token: makeSecretKey(4004), scope: "Read only", created: "Apr 08, 2026", lastUsed: "3 weeks ago" },
];

const initialHooks: Webhook[] = [
  { id: "we_1", url: "https://api.orbynadmin.com/webhooks/stripe", events: ["invoice.paid", "customer.created", "charge.succeeded"], enabled: true, lastDelivery: "2 min ago" },
  { id: "we_2", url: "https://hooks.orbynadmin.com/deploys", events: ["deploy.succeeded", "deploy.failed"], enabled: true, lastDelivery: "1 hour ago" },
  { id: "we_3", url: "https://orbynadmin.dev/notify", events: ["user.invited"], enabled: false, lastDelivery: "Never" },
];

const eventOptions = [
  "invoice.paid",
  "customer.created",
  "charge.succeeded",
  "charge.failed",
  "deploy.succeeded",
  "user.invited",
];

const usageTiles = [
  { label: "Requests today", value: "48,392", hint: "+8.1% vs. yesterday", icon: IconActivity },
  { label: "Error rate", value: "0.12%", hint: "12 failed of 48,392", icon: IconAlertTriangle },
  { label: "Avg. latency", value: "142 ms", hint: "p95 · 310 ms", icon: IconBolt },
];

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    /* clipboard may be unavailable — still confirm to the user */
  }
  toast.success(`${label} copied`, { description: "Copied to your clipboard." });
}

export default function DevelopersPage() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [hooks, setHooks] = useState<Webhook[]>(initialHooks);

  // Create-key dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScope, setNewScope] = useState<Scope>("Read only");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [seq, setSeq] = useState(0);

  // Add-endpoint dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [hookSeq, setHookSeq] = useState(0);

  // Delete dialogs
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [hookDeleteId, setHookDeleteId] = useState<string | null>(null);

  const revoking = keys.find((k) => k.id === revokeId) ?? null;
  const hookDeleting = hooks.find((h) => h.id === hookDeleteId) ?? null;

  function handleCreateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newName.trim() || "Untitled key";
    const token = makeSecretKey(9000 + seq * 37 + name.length);
    setKeys((prev) => [
      { id: `key_new_${seq}`, name, token, scope: newScope, created: "Just now", lastUsed: "Never" },
      ...prev,
    ]);
    setSeq((s) => s + 1);
    setCreatedKey(token);
  }

  function closeCreate(open: boolean) {
    setCreateOpen(open);
    if (!open) {
      setCreatedKey(null);
      setNewName("");
      setNewScope("Read only");
    }
  }

  function toggleNewEvent(evt: string) {
    setNewEvents((prev) =>
      prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]
    );
  }

  function handleAddHook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;
    setHooks((prev) => [
      {
        id: `we_new_${hookSeq}`,
        url,
        events: newEvents.length ? newEvents : ["*"],
        enabled: true,
        lastDelivery: "Never",
      },
      ...prev,
    ]);
    setHookSeq((s) => s + 1);
    setAddOpen(false);
    setNewUrl("");
    setNewEvents([]);
    toast.success("Endpoint added", { description: url });
  }

  function toggleHook(id: string, enabled: boolean) {
    setHooks((prev) =>
      prev.map((h) => (h.id === id ? { ...h, enabled } : h))
    );
    toast.success(enabled ? "Endpoint enabled" : "Endpoint disabled");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developers"
        description="Manage API keys, webhook endpoints and monitor your integration health."
      >
        <Button variant="outline" asChild>
          <Link href="/help">
            <IconExternalLink className="size-4" /> Documentation
          </Link>
        </Button>
        <Button onClick={() => setCreateOpen(true)}>
          <IconPlus className="size-4" /> Create secret key
        </Button>
      </PageHeader>

      {/* Usage tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        {usageTiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.label}
                </p>
                <t.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {t.value}
              </p>
              <p className="text-xs text-muted-foreground">{t.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconKey className="size-5" /> API keys
          </CardTitle>
          <CardDescription>
            Secret keys authenticate requests to the OrbynAdmin API. Never share them
            publicly.
          </CardDescription>
          <CardAction>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <IconPlus className="size-4" /> Create secret key
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Secret key</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="pl-6 font-medium">{k.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {mask(k.token)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground"
                          onClick={() => copyToClipboard(k.token, "Secret key")}
                        >
                          <IconCopy className="size-3.5" />
                          <span className="sr-only">Copy secret key</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={scopeStyles[k.scope]}>
                        {k.scope}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {k.created}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {k.lastUsed}
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">Key actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => copyToClipboard(k.token, "Secret key")}
                          >
                            <IconCopy className="size-4" /> Copy secret key
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success("Key rolled", {
                                description: `A new secret was generated for “${k.name}”.`,
                              })
                            }
                          >
                            <IconReload className="size-4" /> Roll key
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setRevokeId(k.id)}
                          >
                            <IconTrash className="size-4" /> Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {keys.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <IconKey className="mx-auto mb-2 size-6 opacity-50" />
                      No API keys yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWebhook className="size-5" /> Webhook endpoints
          </CardTitle>
          <CardDescription>
            OrbynAdmin sends event payloads to these URLs as things happen in your
            account.
          </CardDescription>
          <CardAction>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <IconPlus className="size-4" /> Add endpoint
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Endpoint URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last delivery</TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {hooks.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <IconWorld className="size-4 shrink-0 text-muted-foreground" />
                        <code className="font-mono text-xs">{h.url}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {h.events.map((e) => (
                          <Badge
                            key={e}
                            variant="secondary"
                            className="bg-sky-500/10 font-mono text-[11px] text-sky-600 dark:text-sky-400"
                          >
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={h.enabled}
                          onCheckedChange={(v) => toggleHook(h.id, v)}
                          aria-label={`Toggle ${h.url}`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {h.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {h.lastDelivery}
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">Endpoint actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              toast.success("Test event sent", {
                                description: `A ping was delivered to ${h.url}.`,
                              })
                            }
                          >
                            <IconTestPipe className="size-4" /> Send test event
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setHookDeleteId(h.id)}
                          >
                            <IconTrash className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {hooks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <IconWebhook className="mx-auto mb-2 size-6 opacity-50" />
                      No endpoints configured yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create secret key dialog */}
      <Dialog open={createOpen} onOpenChange={closeCreate}>
        <DialogContent>
          {createdKey ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconCircleCheck className="size-5 text-emerald-500" />
                  Secret key created
                </DialogTitle>
                <DialogDescription>
                  Copy your key now. For security reasons you won&apos;t be able
                  to view it again.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <InputGroup className="h-10">
                  <InputGroupInput
                    readOnly
                    value={createdKey}
                    className="font-mono text-xs"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-sm"
                      onClick={() => copyToClipboard(createdKey, "Secret key")}
                    >
                      <IconCopy className="size-4" />
                      <span className="sr-only">Copy secret key</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  Store this key in a secure location such as a password manager
                  or your server&apos;s environment variables.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => closeCreate(false)}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleCreateKey}>
              <DialogHeader>
                <DialogTitle>Create secret key</DialogTitle>
                <DialogDescription>
                  Name your key so you can identify it later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key name</Label>
                  <Input
                    id="key-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Production server"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-scope">Scope</Label>
                  <Select
                    value={newScope}
                    onValueChange={(v) => setNewScope(v as Scope)}
                  >
                    <SelectTrigger id="key-scope" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Read only">Read only</SelectItem>
                      <SelectItem value="Write">Write</SelectItem>
                      <SelectItem value="Full access">Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  <IconKey className="size-4" /> Create key
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add endpoint dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleAddHook}>
            <DialogHeader>
              <DialogTitle>Add webhook endpoint</DialogTitle>
              <DialogDescription>
                We&apos;ll POST event payloads to this URL as they occur.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="hook-url">Endpoint URL</Label>
                <Input
                  id="hook-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.example.com/webhooks"
                  required
                  autoFocus
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Events to send</Label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {eventOptions.map((evt) => (
                    <label
                      key={evt}
                      className="flex items-center gap-2 text-sm font-mono"
                    >
                      <Checkbox
                        checked={newEvents.includes(evt)}
                        onCheckedChange={() => toggleNewEvent(evt)}
                      />
                      {evt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <IconPlus className="size-4" /> Add endpoint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!revokeId}
        onOpenChange={() => setRevokeId(null)}
        name={revoking ? `the “${revoking.name}” key` : "key"}
        description="Any application using this key will immediately lose access. This action cannot be undone."
        onConfirm={() => setKeys((prev) => prev.filter((k) => k.id !== revokeId))}
      />

      <DeleteDialog
        open={!!hookDeleteId}
        onOpenChange={() => setHookDeleteId(null)}
        name={hookDeleting ? "this endpoint" : "endpoint"}
        description="OrbynAdmin will stop sending events to this URL. This action cannot be undone."
        onConfirm={() => setHooks((prev) => prev.filter((h) => h.id !== hookDeleteId))}
      />
    </div>
  );
}
