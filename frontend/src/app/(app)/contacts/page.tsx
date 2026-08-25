"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IconAddressBook, IconDotsVertical, IconMail, IconPencil, IconPhone, IconSearch, IconTrash, IconUpload, IconUserPlus } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Contact = { id: number; first_name: string; last_name: string; phone: string; email: string; created_at: string };
type ContactForm = Omit<Contact, "id" | "created_at">;
type UserName = { id: number; first_name: string; last_name: string; username: string };
type ContactField = keyof ContactForm;
type ImportedRow = Record<string, unknown>;
const emptyForm: ContactForm = { first_name: "", last_name: "", phone: "", email: "" };
const emptyMapping: Record<ContactField, string> = { first_name: "", last_name: "", phone: "", email: "" };
const fieldLabels: Record<ContactField, string> = { first_name: "First name", last_name: "Last name", phone: "Phone number", email: "Email" };
const headerAliases: Record<ContactField, string[]> = {
  first_name: ["firstname", "first", "نام", "نامکوچک"],
  last_name: ["lastname", "last", "نامخانوادگی", "نامفامیل"],
  phone: ["phone", "phone number", "mobile", "telephone", "شماره", "شمارهتماس", "موبایل", "تلفن"],
  email: ["email", "e-mail", "ایمیل"],
};

function nameOf(contact: Pick<Contact, "first_name" | "last_name">) { return `${contact.first_name} ${contact.last_name}`.trim(); }
function initials(contact: Pick<Contact, "first_name" | "last_name">) { return `${contact.first_name[0] ?? ""}${contact.last_name[0] ?? ""}`.toUpperCase() || "?"; }
function normalized(value: string) { return value.trim().toLowerCase().replace(/[\s_-]/g, ""); }

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Contact | null>(null);
  const [users, setUsers] = useState<UserName[]>([]);
  const [selectedUser, setSelectedUser] = useState("manual");
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportedRow[]>([]);
  const [importColumns, setImportColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<ContactField, string>>(emptyMapping);
  const [importing, setImporting] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      const response = await fetch("/api/contacts", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load contacts.");
      setContacts(await response.json());
    } catch (error) {
      setContacts([]);
      toast.error("Could not load contacts", { description: error instanceof Error ? error.message : undefined });
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { const id = window.setTimeout(() => { void loadContacts(); }, 0); return () => window.clearTimeout(id); }, [loadContacts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) => [contact.first_name, contact.last_name, contact.email, contact.phone].some((value) => value.toLowerCase().includes(query)));
  }, [contacts, search]);

  async function loadUsers() {
    if (users.length) return;
    try {
      const response = await fetch("/api/contacts/user-names", { cache: "no-store" });
      if (!response.ok) throw new Error();
      setUsers(await response.json());
    } catch { toast.error("Could not load the user list."); }
  }
  function openCreate() { setEditing(null); setSelectedUser("manual"); setForm(emptyForm); setFormOpen(true); void loadUsers(); }
  function openEdit(contact: Contact) { setEditing(contact); setSelectedUser("manual"); setForm({ first_name: contact.first_name, last_name: contact.last_name, phone: contact.phone, email: contact.email }); setFormOpen(true); void loadUsers(); }
  function change(field: keyof ContactForm, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch(editing ? `/api/contacts/${editing.id}` : "/api/contacts", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.detail || "Could not save contact.");
      setFormOpen(false); toast.success(editing ? "Contact updated" : "Contact added"); await loadContacts();
    } catch (error) { toast.error("Contact was not saved", { description: error instanceof Error ? error.message : undefined }); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!deleting) return;
    const response = await fetch(`/api/contacts/${deleting.id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not delete contact.");
    await loadContacts();
  }
  async function readImportFile(file: File) {
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<ImportedRow>(sheet, { defval: "" });
      const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
      if (!rows.length || !columns.length) throw new Error("The selected file has no data rows.");
      setImportRows(rows.slice(0, 1000));
      setImportColumns(columns);
      setMapping(Object.fromEntries((Object.keys(emptyMapping) as ContactField[]).map((field) => [field, columns.find((column) => headerAliases[field].some((alias) => normalized(alias) === normalized(column))) ?? ""])) as Record<ContactField, string>);
    } catch (error) {
      setImportRows([]); setImportColumns([]); setMapping(emptyMapping);
      toast.error("Could not read this file", { description: error instanceof Error ? error.message : "Choose a CSV or Excel file." });
    }
  }
  const importedContacts = useMemo(() => importRows.map((row) => Object.fromEntries((Object.keys(emptyMapping) as ContactField[]).map((field) => [field, String(row[mapping[field]] ?? "").trim()])) as ContactForm).filter((contact) => Object.values(contact).every(Boolean)), [importRows, mapping]);
  async function importContacts() {
    if (!importedContacts.length) return;
    setImporting(true);
    try {
      const response = await fetch("/api/contacts/bulk-import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contacts: importedContacts }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Check the selected columns and contact details.");
      setImportOpen(false); setImportRows([]); setImportColumns([]); setMapping(emptyMapping);
      toast.success(`${payload.length} contacts imported`); await loadContacts();
    } catch (error) { toast.error("Contacts were not imported", { description: error instanceof Error ? error.message : undefined }); }
    finally { setImporting(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Contacts" description="Your private address book."><div className="flex gap-2"><Button variant="outline" onClick={() => setImportOpen(true)}><IconUpload className="size-4" /> Import file</Button><Button onClick={openCreate}><IconUserPlus className="size-4" /> Add contact</Button></div></PageHeader>
    <Card><CardContent className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground"><IconAddressBook className="size-5" /></span><div><p className="text-sm font-medium text-muted-foreground">Total contacts</p><p className="text-2xl font-semibold tracking-tight tabular-nums">{contacts.length}</p></div></CardContent></Card>
    <div className="relative max-w-sm"><IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email or phone…" className="pl-9" /></div>
    {!loading && <p className="text-sm text-muted-foreground">{filtered.length} contact{filtered.length === 1 ? "" : "s"}</p>}
    {!loading && filtered.length === 0 ? <Card><CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground"><IconAddressBook className="size-8 opacity-50" /><p>{search ? "No contacts match your search." : "No contacts yet. Add your first contact."}</p><Button variant="outline" onClick={openCreate}><IconUserPlus className="size-4" /> Add contact</Button></CardContent></Card> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((contact) => <Card key={contact.id} className="group"><CardContent className="space-y-4"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-3"><Avatar className="size-11"><AvatarFallback>{initials(contact)}</AvatarFallback></Avatar><p className="truncate font-medium">{nameOf(contact)}</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><IconDotsVertical className="size-4" /><span className="sr-only">Contact actions</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => openEdit(contact)}><IconPencil className="size-4" /> Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => setDeleting(contact)}><IconTrash className="size-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="space-y-2 text-sm"><a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><IconMail className="size-4 shrink-0" /><span className="truncate">{contact.email}</span></a><a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><IconPhone className="size-4 shrink-0" /><span className="tabular-nums">{contact.phone}</span></a></div></CardContent></Card>)}</div>}
    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><form onSubmit={(event) => void save(event)}><DialogHeader><DialogTitle>{editing ? "Edit contact" : "Add contact"}</DialogTitle><DialogDescription>Save a person in your private address book.</DialogDescription></DialogHeader><div className="grid gap-4 py-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="contact-user">Copy name from a user <span className="text-muted-foreground">(optional)</span></Label><Select value={selectedUser} onValueChange={(id) => { setSelectedUser(id); const user = users.find((item) => String(item.id) === id); if (user) setForm((current) => ({ ...current, first_name: user.first_name, last_name: user.last_name })); }}><SelectTrigger id="contact-user"><SelectValue placeholder="Enter manually" /></SelectTrigger><SelectContent><SelectItem value="manual">Enter manually</SelectItem>{users.map((user) => <SelectItem key={user.id} value={String(user.id)}>{nameOf(user) || user.username}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="first-name">First name</Label><Input id="first-name" value={form.first_name} onChange={(event) => { setSelectedUser("manual"); change("first_name", event.target.value); }} required /></div><div className="space-y-2"><Label htmlFor="last-name">Last name</Label><Input id="last-name" value={form.last_name} onChange={(event) => { setSelectedUser("manual"); change("last_name", event.target.value); }} required /></div><div className="space-y-2"><Label htmlFor="phone">Phone number</Label><Input id="phone" type="tel" value={form.phone} onChange={(event) => change("phone", event.target.value)} placeholder="+98 912 123 4567" required /></div><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(event) => change("email", event.target.value)} placeholder="name@example.com" required /></div></div><DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={saving}>{editing ? "Save changes" : "Add contact"}</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={importOpen} onOpenChange={setImportOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Import contacts</DialogTitle><DialogDescription>Choose a CSV, XLS or XLSX file. Column names can be anything; match them below before importing.</DialogDescription></DialogHeader><div className="space-y-4 py-2"><div className="space-y-2"><Label htmlFor="contact-file">File</Label><Input id="contact-file" type="file" accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { const file = event.target.files?.[0]; if (file) void readImportFile(file); }} /></div>{importColumns.length > 0 && <><div className="grid gap-3 sm:grid-cols-2">{(Object.keys(emptyMapping) as ContactField[]).map((field) => <div key={field} className="space-y-2"><Label>{fieldLabels[field]}</Label><Select value={mapping[field] || "unmapped"} onValueChange={(value) => setMapping((current) => ({ ...current, [field]: value === "unmapped" ? "" : value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unmapped">Not mapped</SelectItem>{importColumns.map((column) => <SelectItem key={column} value={column}>{column}</SelectItem>)}</SelectContent></Select></div>)}</div><div className="rounded-lg border bg-muted/30 p-3 text-sm"><p className="font-medium">Ready to import: {importedContacts.length} contacts</p><p className="mt-1 text-muted-foreground">{importRows.length - importedContacts.length ? `${importRows.length - importedContacts.length} rows are missing one or more required fields and will be skipped.` : "All parsed rows have the required fields."}</p>{importedContacts.length > 0 && <p className="mt-2 truncate text-muted-foreground">Preview: {importedContacts.slice(0, 3).map((contact) => `${contact.first_name} ${contact.last_name}`).join(", ")}</p>}</div></>}</div><DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button onClick={() => void importContacts()} disabled={importing || !importedContacts.length}>Import {importedContacts.length || ""} contacts</Button></DialogFooter></DialogContent></Dialog>
    <DeleteDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} name={deleting ? nameOf(deleting) : "contact"} onConfirm={() => void remove()} />
  </div>;
}
