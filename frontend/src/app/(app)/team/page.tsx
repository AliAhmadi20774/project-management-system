"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Department = { id: number; name: string; code: string; is_active: boolean };
type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string | null;
  job_title: string;
  department_detail: Department | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  access_role: "user" | "manager" | "system_admin";
  avatar_url?: string | null;
};

const formDefaults = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  job_title: "",
  department: "none",
  access_role: "user",
  avatar_seed: "young-man",
};

const UI_AVATARS = [
  { seed: "young-man", label: "Young man", src: "/avatars/default-young-man.png" },
  { seed: "engineer-curly", label: "Engineer with curly hair", src: "/avatars/engineer-curly.png" },
  { seed: "engineer-beard", label: "Engineer with beard", src: "/avatars/engineer-beard.png" },
  { seed: "engineer-auburn", label: "Engineer with auburn hair", src: "/avatars/engineer-auburn.png" },
  { seed: "engineer-senior", label: "Senior engineer", src: "/avatars/engineer-senior.png" },
  { seed: "engineer-east-asian", label: "Engineer", src: "/avatars/engineer-east-asian.png" },
  { seed: "engineer-south-asian", label: "Engineer", src: "/avatars/engineer-south-asian.png" },
  { seed: "engineer-blond", label: "Engineer", src: "/avatars/engineer-blond.png" },
];
const DEFAULT_YOUNG_MAN_AVATAR_URL = UI_AVATARS[0].src;
const initials = (user: User) =>
  `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase() || user.username.slice(0, 2);

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const lastDefaultAvatar = useRef<string | null>(null);
  const createNewUserForm = () => {
    const choices = UI_AVATARS.filter((avatar) => avatar.seed !== lastDefaultAvatar.current);
    const avatar = choices[Math.floor(Math.random() * choices.length)];
    lastDefaultAvatar.current = avatar.seed;
    return { ...formDefaults, avatar_seed: avatar.seed };
  };
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(createNewUserForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const isAdmin = Boolean(
    currentUser?.is_superuser || currentUser?.access_role === "manager"
  );

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    Promise.all([fetch("/api/users"), fetch("/api/departments")])
      .then(async ([usersResponse, departmentsResponse]) => {
        if (!usersResponse.ok) throw new Error("Unable to load users.");
        const usersData = await usersResponse.json();
        const departmentsData = departmentsResponse.ok ? await departmentsResponse.json() : [];
        setUsers(usersData.results ?? usersData);
        setDepartments(departmentsData.results ?? departmentsData);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load users."))
      .finally(() => setIsLoading(false));
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => [user.username, user.first_name, user.last_name, user.email, user.department_detail?.name]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query)));
  }, [search, users]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = new FormData();
    payload.set("username", form.username);
    payload.set("first_name", form.first_name);
    payload.set("last_name", form.last_name);
    payload.set("email", form.email);
    payload.set("password", form.password);
    payload.set("job_title", form.job_title);
    payload.set("department", form.department === "none" ? "" : form.department);
    payload.set("access_role", form.access_role);
    payload.set("avatar_seed", form.avatar_seed);
    if (avatarFile) payload.set("avatar", avatarFile);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Unable to create user.");

      setUsers((current) => [data, ...current]);
      setForm(createNewUserForm());
      setAvatarFile(null);
      setIsDialogOpen(false);
      toast.success("User created successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoading && !isAdmin) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-2 py-10 text-center">
          <IconUsers className="mx-auto size-8 text-muted-foreground" />
          <h1 className="text-lg font-semibold">User management is restricted</h1>
          <p className="text-sm text-muted-foreground">Only administrators can view or create users.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage employee accounts and organizational information.">
        <Button onClick={() => { setAvatarFile(null); setForm(createNewUserForm()); setIsDialogOpen(true); }}><IconPlus className="size-4" /> Add user</Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or personnel number" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Personnel number</TableHead><TableHead>Department</TableHead><TableHead>Job title</TableHead><TableHead>Access</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">Loading users...</TableCell></TableRow> : null}
              {!isLoading && filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={user.avatar_url || DEFAULT_YOUNG_MAN_AVATAR_URL} alt="" />
                        <AvatarFallback>{initials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0"><div className="truncate font-medium">{[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}</div>{user.email && <div className="truncate text-xs text-muted-foreground">{user.email}</div>}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.username}</TableCell>
                  <TableCell>{user.department_detail ? <Badge variant="secondary">{user.department_detail.name}</Badge> : "—"}</TableCell>
                  <TableCell>{user.job_title || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{user.access_role === "system_admin" ? "System admin" : user.access_role === "manager" ? "Manager" : "User"}</Badge></TableCell>
                  <TableCell><Badge variant={user.is_active ? "secondary" : "outline"}>{user.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
              {!isLoading && filteredUsers.length === 0 ? <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">No users found.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add user</DialogTitle><DialogDescription>Create an employee account with a personnel number and password.</DialogDescription></DialogHeader>
          <form className="grid gap-4" onSubmit={createUser}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name"><Input required value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} /></Field>
              <Field label="Last name"><Input required value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></Field>
            </div>
            <div className="grid gap-2"><Label>Default avatar</Label><div className="flex flex-wrap gap-2">{[...UI_AVATARS].sort((a, b) => Number(b.seed === form.avatar_seed) - Number(a.seed === form.avatar_seed)).map((avatar) => <button key={avatar.seed} type="button" onClick={() => setForm({ ...form, avatar_seed: avatar.seed })} className={`rounded-full p-0.5 ring-offset-background ${form.avatar_seed === avatar.seed ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-muted-foreground"}`} aria-label={`Choose ${avatar.label}`}><img src={avatar.src} alt={avatar.label} className="size-9 rounded-full object-cover" onError={(event) => { event.currentTarget.src = DEFAULT_YOUNG_MAN_AVATAR_URL; }} /></button>)}</div><p className="text-xs text-muted-foreground">A different default avatar is selected each time; you can choose another one.</p></div>
            <div className="grid gap-2"><Label htmlFor="user-avatar">Profile image (optional)</Label><Input id="user-avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} /><p className="text-xs text-muted-foreground">An uploaded image overrides the selected default avatar.</p></div>
            {currentUser?.is_superuser && (
              <div className="grid gap-2">
                <Label>Access level</Label>
                <Select value={form.access_role} onValueChange={(access_role) => setForm({ ...form, access_role })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="system_admin">System admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Managers manage projects; system administrators have unrestricted system access.</p>
              </div>
            )}
            <Field label="Personnel number"><Input required inputMode="numeric" pattern="[0-9]{1,20}" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></Field>
            <Field label="Organizational email (optional)"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="Temporary password"><Input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title"><Input value={form.job_title} onChange={(event) => setForm({ ...form, job_title: event.target.value })} /></Field>
              <div className="grid gap-2"><Label>Department</Label><Select value={form.department} onValueChange={(department) => setForm({ ...form, department })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No department</SelectItem>{departments.filter((department) => department.is_active).map((department) => <SelectItem key={department.id} value={String(department.id)}>{department.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create user"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
