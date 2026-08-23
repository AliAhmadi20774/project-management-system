"use client";

import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconDotsVertical,
  IconPencil,
  IconCopy,
  IconTrash,
  IconChevronRight,
  IconCrown,
  IconShieldLock,
  IconUserCog,
  IconUser,
  IconEye,
  IconCreditCard,
  IconLayoutDashboard,
  IconUsers,
  IconShoppingCart,
  IconPackage,
  IconUsersGroup,
  IconSettings,
  IconKey,
  IconUserPlus,
  IconLock,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";
import { team, customers } from "@/data";

type Action = "read" | "write" | "delete";

type Member = { name: string; avatar: string };

type Role = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  system: boolean;
  members: Member[];
};

const ACTIONS: Action[] = ["read", "write", "delete"];

const GROUPS = [
  { id: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { id: "customers", label: "Customers", icon: IconUsers },
  { id: "orders", label: "Orders", icon: IconShoppingCart },
  { id: "products", label: "Products", icon: IconPackage },
  { id: "billing", label: "Billing", icon: IconCreditCard },
  { id: "team", label: "Team", icon: IconUsersGroup },
  { id: "settings", label: "Settings", icon: IconSettings },
] as const;

// A believable member pool derived from the team + customer directories.
const memberPool: Member[] = [
  ...team.map((t) => ({ name: t.name, avatar: t.avatar })),
  ...customers.slice(0, 28).map((c) => ({ name: c.name, avatar: c.avatar })),
];

function poolSlice(offset: number, count: number): Member[] {
  return Array.from({ length: count }, (_, i) => memberPool[(offset + i) % memberPool.length]);
}

const initialRoles: Role[] = [
  {
    id: "owner",
    name: "Owner",
    description: "Full, unrestricted access to every workspace resource and billing.",
    icon: IconCrown,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    system: true,
    members: poolSlice(0, 1),
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Manage members, content and settings, but cannot delete the workspace.",
    icon: IconShieldLock,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    system: true,
    members: poolSlice(1, 3),
  },
  {
    id: "manager",
    name: "Manager",
    description: "Create and edit operational records across customers, orders and products.",
    icon: IconUserCog,
    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    system: true,
    members: poolSlice(4, 6),
  },
  {
    id: "member",
    name: "Member",
    description: "Day-to-day contributor with write access to their assigned areas.",
    icon: IconUser,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    system: true,
    members: poolSlice(10, 14),
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to dashboards and records. Cannot make changes.",
    icon: IconEye,
    tone: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    system: true,
    members: poolSlice(24, 9),
  },
  {
    id: "billing",
    name: "Billing",
    description: "Access to invoices, subscriptions and payment methods only.",
    icon: IconCreditCard,
    tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    system: true,
    members: poolSlice(2, 2),
  },
];

// Deterministic default access per role & permission group.
function seedActions(roleId: string, groupId: string): Action[] {
  switch (roleId) {
    case "owner":
      return ["read", "write", "delete"];
    case "admin":
      return groupId === "settings"
        ? ["read", "write"]
        : ["read", "write", "delete"];
    case "manager":
      if (["dashboard", "customers", "orders", "products"].includes(groupId))
        return ["read", "write"];
      return ["read"];
    case "member":
      if (["customers", "orders", "products"].includes(groupId))
        return ["read", "write"];
      if (groupId === "dashboard") return ["read"];
      return [];
    case "viewer":
      return groupId === "settings" ? [] : ["read"];
    case "billing":
      if (groupId === "billing") return ["read", "write", "delete"];
      if (["dashboard", "customers", "orders"].includes(groupId)) return ["read"];
      return [];
    default:
      return ["read"];
  }
}

const permKey = (groupId: string, action: Action, roleId: string) =>
  `${groupId}.${action}.${roleId}`;

function buildInitialPerms(roles: Role[]): Record<string, boolean> {
  const perms: Record<string, boolean> = {};
  for (const role of roles) {
    for (const group of GROUPS) {
      const granted = seedActions(role.id, group.id);
      for (const action of ACTIONS) {
        perms[permKey(group.id, action, role.id)] = granted.includes(action);
      }
    }
  }
  return perms;
}

function StatTile({
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
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function AvatarStack({ members }: { members: Member[] }) {
  const shown = members.slice(0, 5);
  const extra = members.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((m, i) => (
          <Avatar key={i} className="size-7 ring-2 ring-card">
            <AvatarImage src={m.avatar} alt={m.name} />
            <AvatarFallback className="text-[10px]">
              {m.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ))}
        {extra > 0 && (
          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card tabular-nums">
            +{extra}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [perms, setPerms] = useState<Record<string, boolean>>(() =>
    buildInitialPerms(initialRoles)
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    customers: true,
  });
  const [activeRole, setActiveRole] = useState<string>("admin");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleting = roles.find((r) => r.id === deleteId) ?? null;

  const stats = useMemo(() => {
    const totalMembers = roles.reduce((sum, r) => sum + r.members.length, 0);
    const custom = roles.filter((r) => !r.system).length;
    return { total: roles.length, members: totalMembers, custom };
  }, [roles]);

  function toggleExpand(groupId: string) {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  function groupState(groupId: string, roleId: string): boolean | "indeterminate" {
    const values = ACTIONS.map((a) => perms[permKey(groupId, a, roleId)]);
    if (values.every(Boolean)) return true;
    if (values.some(Boolean)) return "indeterminate";
    return false;
  }

  function toggleCell(groupId: string, action: Action, roleId: string, roleName: string) {
    const key = permKey(groupId, action, roleId);
    const next = !perms[key];
    setPerms((prev) => ({ ...prev, [key]: next }));
    const group = GROUPS.find((g) => g.id === groupId);
    toast.success(next ? "Permission granted" : "Permission revoked", {
      description: `${roleName} · ${action} ${group?.label}`,
    });
  }

  function toggleGroup(groupId: string, roleId: string, roleName: string) {
    const allOn = ACTIONS.every((a) => perms[permKey(groupId, a, roleId)]);
    const next = !allOn;
    setPerms((prev) => {
      const copy = { ...prev };
      for (const a of ACTIONS) copy[permKey(groupId, a, roleId)] = next;
      return copy;
    });
    const group = GROUPS.find((g) => g.id === groupId);
    toast.success(next ? "Full access granted" : "Access revoked", {
      description: `${roleName} · ${group?.label}`,
    });
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = ((data.get("name") as string) || "").trim();
    if (!name) return;
    const description =
      ((data.get("description") as string) || "").trim() ||
      "Custom role with tailored permissions.";
    const base = (data.get("base") as string) || "member";
    const id = `role-${Date.now()}`;

    const newRole: Role = {
      id,
      name,
      description,
      icon: IconKey,
      tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      system: false,
      members: [],
    };

    setRoles((prev) => [...prev, newRole]);
    // Seed the matrix column by copying the chosen base role's permissions.
    setPerms((prev) => {
      const copy = { ...prev };
      for (const group of GROUPS) {
        for (const action of ACTIONS) {
          copy[permKey(group.id, action, id)] =
            prev[permKey(group.id, action, base)] ?? false;
        }
      }
      return copy;
    });
    setActiveRole(id);
    setCreateOpen(false);
    toast.success("Role created", {
      description: `“${name}” was added, based on the ${base} role.`,
    });
  }

  function duplicateRole(role: Role) {
    const id = `role-${Date.now()}`;
    const copyRole: Role = {
      ...role,
      id,
      name: `${role.name} (copy)`,
      icon: IconKey,
      tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      system: false,
      members: [],
    };
    setRoles((prev) => [...prev, copyRole]);
    setPerms((prev) => {
      const copy = { ...prev };
      for (const group of GROUPS) {
        for (const action of ACTIONS) {
          copy[permKey(group.id, action, id)] =
            prev[permKey(group.id, action, role.id)] ?? false;
        }
      }
      return copy;
    });
    setActiveRole(id);
    toast.success("Role duplicated", {
      description: `“${copyRole.name}” is ready to customize.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Define what each role can see and do across the workspace."
      >
        <Button onClick={() => setCreateOpen(true)}>
          <IconPlus className="size-4" /> Create role
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Roles"
          value={stats.total.toLocaleString()}
          hint="Across the workspace"
          icon={IconShieldLock}
        />
        <StatTile
          label="Members"
          value={stats.members.toLocaleString()}
          hint="Assigned to a role"
          icon={IconUsers}
        />
        <StatTile
          label="Custom roles"
          value={stats.custom.toLocaleString()}
          hint="Created by your team"
          icon={IconKey}
        />
        <StatTile
          label="Pending invites"
          value="4"
          hint="Awaiting acceptance"
          icon={IconUserPlus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Roles list */}
        <div className="space-y-4 xl:col-span-1">
          {roles.map((role) => {
            const active = role.id === activeRole;
            return (
              <Card
                key={role.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveRole(role.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveRole(role.id);
                  }
                }}
                className={cn(
                  "cursor-pointer transition-colors hover:border-primary/40",
                  active && "border-primary ring-1 ring-primary/30"
                )}
              >
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        role.tone
                      )}
                    >
                      <role.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{role.name}</p>
                        {role.system ? (
                          <Badge
                            variant="secondary"
                            className="bg-slate-500/10 text-slate-600 dark:text-slate-400"
                          >
                            System
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          >
                            Custom
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">{role.name} options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onSelect={() =>
                            toast("Editing role", { description: role.name })
                          }
                        >
                          <IconPencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => duplicateRole(role)}>
                          <IconCopy className="size-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={role.id === "owner"}
                          onSelect={() => setDeleteId(role.id)}
                        >
                          <IconTrash className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between">
                    {role.members.length > 0 ? (
                      <AvatarStack members={role.members} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No members yet
                      </span>
                    )}
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      {role.members.length} member
                      {role.members.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Permissions matrix */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconLock className="size-4" /> Permissions matrix
            </CardTitle>
            <CardDescription>
              Toggle access per role. Expand a group to control read, write and
              delete individually.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-6">Resource</TableHead>
                    {roles.map((r) => (
                      <TableHead
                        key={r.id}
                        className={cn(
                          "min-w-24 text-center last:pr-6",
                          r.id === activeRole && "bg-primary/5"
                        )}
                      >
                        {r.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {GROUPS.map((group) => {
                    const isOpen = !!expanded[group.id];
                    return (
                      <Fragment key={group.id}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() => toggleExpand(group.id)}
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-2">
                              <IconChevronRight
                                className={cn(
                                  "size-4 text-muted-foreground transition-transform",
                                  isOpen && "rotate-90"
                                )}
                              />
                              <group.icon className="size-4 text-muted-foreground" />
                              <span className="font-medium">{group.label}</span>
                            </div>
                          </TableCell>
                          {roles.map((r) => (
                            <TableCell
                              key={r.id}
                              className={cn(
                                "text-center last:pr-6",
                                r.id === activeRole && "bg-primary/5"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                aria-label={`${group.label} access for ${r.name}`}
                                checked={groupState(group.id, r.id)}
                                onCheckedChange={() =>
                                  toggleGroup(group.id, r.id, r.name)
                                }
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                        {isOpen &&
                          ACTIONS.map((action) => (
                            <TableRow
                              key={`${group.id}-${action}`}
                              className="bg-muted/20"
                            >
                              <TableCell className="py-2 pl-6">
                                <span className="ml-6 text-sm capitalize text-muted-foreground">
                                  {action}
                                </span>
                              </TableCell>
                              {roles.map((r) => (
                                <TableCell
                                  key={r.id}
                                  className={cn(
                                    "py-2 text-center last:pr-6",
                                    r.id === activeRole && "bg-primary/5"
                                  )}
                                >
                                  <Checkbox
                                    aria-label={`${action} ${group.label} for ${r.name}`}
                                    checked={
                                      !!perms[permKey(group.id, action, r.id)]
                                    }
                                    onCheckedChange={() =>
                                      toggleCell(group.id, action, r.id, r.name)
                                    }
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create role dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create a role</DialogTitle>
              <DialogDescription>
                Roles bundle a set of permissions you can assign to members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  name="name"
                  placeholder="e.g. Support Agent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  name="description"
                  rows={3}
                  placeholder="What can members with this role do?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-base">Base role</Label>
                <Select name="base" defaultValue="member">
                  <SelectTrigger id="role-base" className="w-full">
                    <SelectValue placeholder="Copy permissions from…" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialRoles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Permissions are copied from this role and can be edited after.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <IconPlus className="size-4" /> Create role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        name={deleting?.name ?? "role"}
        description={`This will permanently remove the ${deleting?.name ?? ""} role. Members will need to be reassigned. This action cannot be undone.`}
        onConfirm={() => {
          setRoles((prev) => prev.filter((r) => r.id !== deleteId));
          if (activeRole === deleteId) setActiveRole("admin");
          setDeleteId(null);
        }}
      />
    </div>
  );
}
