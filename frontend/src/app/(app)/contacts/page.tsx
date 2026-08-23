"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconUserPlus,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconMail,
  IconPhone,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconAddressBook,
  IconBuilding,
  IconUsers,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { customers, team } from "@/data";

// ---------------------------------------------------------------------------
// Contact model — merged from team members + customers (deterministic)
// ---------------------------------------------------------------------------

type Contact = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  company: string;
  phone: string;
  tags: string[];
  source: "Team" | "Customer";
  favourite: boolean;
  isNew: boolean;
};

// Deterministic phone number from a string seed (no Math.random at render).
function synthPhone(seed: string): string {
  let n = 7;
  for (const c of seed) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  const area = 200 + (n % 700);
  const mid = 100 + ((n >>> 3) % 900);
  const last = 1000 + ((n >>> 7) % 9000);
  return `+1 (${area}) ${mid}-${last}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildContacts(): Contact[] {
  const teamContacts: Contact[] = team.map((t, i) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    avatar: t.avatar,
    role: t.role,
    company: "OrbynAdmin",
    phone: synthPhone(t.id),
    tags: ["Team", t.department],
    source: "Team",
    favourite: i % 4 === 0,
    isNew: false,
  }));

  const customerContacts: Contact[] = customers.slice(0, 20).map((c, i) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    avatar: c.avatar,
    role:
      c.plan === "Enterprise"
        ? "Enterprise Client"
        : c.plan === "Pro"
          ? "Pro Client"
          : "Customer",
    company: c.company,
    phone: synthPhone(c.id),
    tags: ["Customer", c.plan],
    source: "Customer",
    favourite: i % 6 === 2,
    isNew: i % 7 === 0,
  }));

  return [...teamContacts, ...customerContacts];
}

const tagStyles: Record<string, string> = {
  Team: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Customer: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Enterprise: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Pro: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Free: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

function tagClass(tag: string) {
  return (
    tagStyles[tag] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400"
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(() => buildContacts());
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("all");
  const [source, setSource] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [seq, setSeq] = useState(0);

  const deleting = contacts.find((c) => c.id === deleteId) ?? null;

  const companies = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.company))).sort(),
    [contacts]
  );

  const stats = useMemo(() => {
    const total = contacts.length;
    const companyCount = new Set(contacts.map((c) => c.company)).size;
    const favourites = contacts.filter((c) => c.favourite).length;
    const newThisWeek = contacts.filter((c) => c.isNew).length;
    return { total, companyCount, favourites, newThisWeek };
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q);
      const matchesCompany = company === "all" || c.company === company;
      const matchesSource =
        source === "all" ||
        (source === "favourites" ? c.favourite : c.source === source);
      return matchesSearch && matchesCompany && matchesSource;
    });
  }, [contacts, search, company, source]);

  function toggleFavourite(id: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favourite: !c.favourite } : c))
    );
  }

  function handleAddContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = (data.get("name") as string)?.trim() || "New contact";
    const email = (data.get("email") as string)?.trim() || "";
    const companyName = (data.get("company") as string)?.trim() || "—";
    const role = (data.get("role") as string)?.trim() || "Contact";
    const id = `NEW-${seq}`;
    setContacts((prev) => [
      {
        id,
        name,
        email,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=contact${seq}`,
        role,
        company: companyName,
        phone: synthPhone(id + name),
        tags: ["New"],
        source: "Customer",
        favourite: false,
        isNew: true,
      },
      ...prev,
    ]);
    setSeq((s) => s + 1);
    setAddOpen(false);
    toast.success("Contact added", { description: `${name} was added to your address book.` });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Your unified address book across teammates and customers."
      >
        <Button onClick={() => setAddOpen(true)}>
          <IconUserPlus className="size-4" /> Add contact
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total contacts" value={stats.total.toLocaleString()} icon={IconAddressBook} />
        <StatTile label="Companies" value={stats.companyCount.toLocaleString()} icon={IconBuilding} />
        <StatTile label="Favourites" value={stats.favourites.toLocaleString()} icon={IconStarFilled} />
        <StatTile label="New this week" value={stats.newThisWeek.toLocaleString()} icon={IconUsers} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or company…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Everyone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="Team">Team</SelectItem>
              <SelectItem value="Customer">Customers</SelectItem>
              <SelectItem value="favourites">Favourites</SelectItem>
            </SelectContent>
          </Select>
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} contact{filtered.length === 1 ? "" : "s"}
      </p>

      {/* Contact grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <IconAddressBook className="size-8 opacity-50" />
            <p>No contacts match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <Card key={c.id} className="group relative">
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-11">
                      <AvatarImage src={c.avatar} alt={c.name} />
                      <AvatarFallback>{initials(c.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.role} · {c.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => toggleFavourite(c.id)}
                      aria-label={
                        c.favourite ? "Remove from favourites" : "Add to favourites"
                      }
                    >
                      {c.favourite ? (
                        <IconStarFilled className="size-4 text-amber-500" />
                      ) : (
                        <IconStar className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">Contact actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.success("Compose email", {
                              description: `Drafting a message to ${c.email}.`,
                            })
                          }
                        >
                          <IconMail className="size-4" /> Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            toast("Edit contact", {
                              description: `Editing ${c.name}.`,
                            })
                          }
                        >
                          <IconPencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeleteId(c.id)}
                        >
                          <IconTrash className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <IconMail className="size-4 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </a>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconPhone className="size-4 shrink-0" />
                    <span className="tabular-nums">{c.phone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className={tagClass(t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add contact dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleAddContact}>
            <DialogHeader>
              <DialogTitle>Add contact</DialogTitle>
              <DialogDescription>
                Add someone to your shared address book.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full name</Label>
                <Input
                  id="contact-name"
                  name="name"
                  placeholder="Jordan Rivera"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="jordan@company.com"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-company">Company</Label>
                  <Input
                    id="contact-company"
                    name="company"
                    placeholder="Northwind"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-role">Role</Label>
                  <Input id="contact-role" name="role" placeholder="Founder" />
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
                <IconUserPlus className="size-4" /> Add contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        name={deleting?.name ?? "contact"}
        onConfirm={() =>
          setContacts((prev) => prev.filter((c) => c.id !== deleteId))
        }
      />
    </div>
  );
}
