"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconUserPlus,
  IconUsers,
  IconBuildingSkyscraper,
  IconCircleDot,
  IconMailForward,
  IconSearch,
  IconLayoutGrid,
  IconLayoutList,
  IconDotsVertical,
  IconMail,
  IconMapPin,
  IconEye,
  IconMessage,
  IconUserCog,
  IconTrash,
  IconSend,
  IconClock,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DeleteDialog } from "@/components/delete-dialog";
import { cn } from "@/lib/utils";
import { team, currentUser, type TeamMember } from "@/data";

const departmentStyles: Record<string, string> = {
  Engineering: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Product: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Marketing: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Design: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Data: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const statusDot: Record<TeamMember["status"], string> = {
  Active: "bg-emerald-500",
  Away: "bg-amber-500",
  Offline: "bg-slate-400 dark:bg-slate-500",
};

const statusLabel: Record<TeamMember["status"], string> = {
  Active: "text-emerald-600 dark:text-emerald-400",
  Away: "text-amber-600 dark:text-amber-400",
  Offline: "text-muted-foreground",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

type PendingInvite = {
  email: string;
  role: string;
  department: string;
  invitedBy: string;
  sent: string;
};

const initialInvites: PendingInvite[] = [
  {
    email: "noah.bennett@orbynadmin.com",
    role: "Solutions Engineer",
    department: "Engineering",
    invitedBy: "Alex Morgan",
    sent: "2 days ago",
  },
  {
    email: "yuki.tanaka@orbynadmin.com",
    role: "Brand Designer",
    department: "Design",
    invitedBy: "Priya Nair",
    sent: "5 days ago",
  },
  {
    email: "maria.lopez@orbynadmin.com",
    role: "Account Executive",
    department: "Marketing",
    invitedBy: "Sofia Rossi",
    sent: "1 week ago",
  },
];

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

function MemberActions({
  member,
  onRemove,
}: {
  member: TeamMember;
  onRemove: (member: TeamMember) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Member actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onSelect={() =>
            toast(`${member.name}`, { description: member.email })
          }
        >
          <IconEye className="size-4" /> View profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            toast.success("Message sent", {
              description: `Your message to ${member.name} is on its way.`,
            })
          }
        >
          <IconMessage className="size-4" /> Send message
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            toast.success("Role updated", {
              description: `${member.name}'s role has been updated.`,
            })
          }
        >
          <IconUserCog className="size-4" /> Manage role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onRemove(member)}
        >
          <IconTrash className="size-4" /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(team);
  const [invites, setInvites] = useState<PendingInvite[]>(initialInvites);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteDept, setInviteDept] = useState("Engineering");
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(team.map((m) => m.department))).sort(),
    []
  );

  const stats = useMemo(
    () => ({
      members: members.length,
      departments: new Set(members.map((m) => m.department)).size,
      active: members.filter((m) => m.status === "Active").length,
    }),
    [members]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q);
      const matchesDept = department === "all" || m.department === department;
      return matchesSearch && matchesDept;
    });
  }, [members, search, department]);

  const handleExport = () =>
    toast.success("Exported to CSV", {
      description: `${members.length} members exported.`,
    });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    const invite: PendingInvite = {
      email,
      role: inviteRole.trim() || "Team Member",
      department: inviteDept,
      invitedBy: currentUser.name,
      sent: "Just now",
    };
    setInvites((prev) => [invite, ...prev]);
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("");
    setInviteDept("Engineering");
    toast.success("Invitation sent", { description: email });
  };

  const handleRemoveMember = () => {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
  };

  const resendInvite = (invite: PendingInvite) =>
    toast.success("Invitation resent", { description: invite.email });

  const revokeInvite = (invite: PendingInvite) => {
    setInvites((prev) => prev.filter((i) => i.email !== invite.email));
    toast.success("Invitation revoked", { description: invite.email });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage your teammates, roles and departments."
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <IconMailForward className="size-4" /> Export
        </Button>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <IconUserPlus className="size-4" /> Invite member
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Members"
          value={stats.members.toLocaleString()}
          hint="Across all departments"
          icon={IconUsers}
        />
        <StatTile
          label="Departments"
          value={stats.departments.toLocaleString()}
          hint="Product, Eng, Design & more"
          icon={IconBuildingSkyscraper}
        />
        <StatTile
          label="Active now"
          value={stats.active.toLocaleString()}
          hint="Online in the last 5 min"
          icon={IconCircleDot}
        />
        <StatTile
          label="Pending invites"
          value={invites.length.toLocaleString()}
          hint="Awaiting acceptance"
          icon={IconMailForward}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role or email…"
              className="pl-9"
            />
          </div>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-muted-foreground">
            {filtered.length} member{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center rounded-md border p-0.5">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => setView("grid")}
            >
              <IconLayoutGrid className="size-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => setView("table")}
            >
              <IconLayoutList className="size-4" />
              <span className="sr-only">Table view</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" &&
        (filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((m) => (
              <Card key={m.id} className="gap-0 overflow-hidden">
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <Avatar className="size-14">
                        <AvatarImage src={m.avatar} alt={m.name} />
                        <AvatarFallback>{initials(m.name)}</AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 size-3.5 rounded-full ring-2 ring-card",
                          statusDot[m.status]
                        )}
                      />
                    </div>
                    <MemberActions member={m} onRemove={setRemoveTarget} />
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold tracking-tight">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.role}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={departmentStyles[m.department]}
                    >
                      {m.department}
                    </Badge>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        statusLabel[m.status]
                      )}
                    >
                      <span
                        className={cn("size-2 rounded-full", statusDot[m.status])}
                      />
                      {m.status}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <IconMail className="size-4 shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconMapPin className="size-4 shrink-0" />
                      <span className="truncate">{m.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

      {/* Table view */}
      {view === "table" && (
        <Card>
          <CardContent className="px-0">
            {filtered.length === 0 ? (
              <div className="py-4">
                <EmptyState />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-10 pr-6" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="size-9">
                                <AvatarImage src={m.avatar} alt={m.name} />
                                <AvatarFallback>
                                  {initials(m.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span
                                className={cn(
                                  "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-card",
                                  statusDot[m.status]
                                )}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium">{m.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {m.role} · {m.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={departmentStyles[m.department]}
                          >
                            {m.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-sm font-medium",
                              statusLabel[m.status]
                            )}
                          >
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                statusDot[m.status]
                              )}
                            />
                            {m.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.location}
                        </TableCell>
                        <TableCell className="pr-6">
                          <MemberActions member={m} onRemove={setRemoveTarget} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconClock className="size-4" /> Pending invitations
          </CardTitle>
          <CardDescription>
            People who have been invited but haven&apos;t joined yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
              <IconMailForward className="mb-3 size-8 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium">No pending invitations</p>
              <p className="text-sm text-muted-foreground">
                Invite a teammate to see it appear here.
              </p>
            </div>
          ) : (
            invites.map((invite) => (
              <div
                key={invite.email}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border border-dashed text-muted-foreground">
                    <IconMail className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {invite.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invite.role} · Invited by {invite.invitedBy} ·{" "}
                      {invite.sent}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge
                    variant="secondary"
                    className={departmentStyles[invite.department]}
                  >
                    {invite.department}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  >
                    Pending
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resendInvite(invite)}
                  >
                    <IconSend className="size-4" /> Resend
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => revokeInvite(invite)}
                  >
                    <IconTrash className="size-4" />
                    <span className="sr-only">Revoke invitation</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Invite member dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite a member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your workspace. They&apos;ll appear
                under pending invitations until they accept.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Input
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g. Product Designer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-dept">Department</Label>
                <Select value={inviteDept} onValueChange={setInviteDept}>
                  <SelectTrigger id="invite-dept" className="w-full">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <IconSend className="size-4" /> Send invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        onConfirm={handleRemoveMember}
        name={removeTarget?.name ?? "member"}
        description={
          removeTarget
            ? `This will remove ${removeTarget.name} from the team. This action cannot be undone.`
            : undefined
        }
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <IconUsers className="mb-3 size-8 text-muted-foreground opacity-50" />
      <p className="text-sm font-medium">No members found</p>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search or department filter.
      </p>
    </div>
  );
}
