"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconEdit, IconDeviceFloppy } from "@tabler/icons-react";

import type { AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ProfileActions({ user, onUpdated }: { user: AuthUser; onUpdated: (user: AuthUser) => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email ?? "");
  const [mobile, setMobile] = useState(user.mobile ?? "");
  const [jobTitle, setJobTitle] = useState(user.job_title);
  const [saving, setSaving] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() || null, mobile: mobile.trim() || null, job_title: jobTitle.trim() }) });
      const updated = await response.json();
      if (!response.ok) throw new Error(typeof updated.detail === "string" ? updated.detail : "Could not update profile.");
      onUpdated(updated); setOpen(false); toast.success("Profile updated");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update profile."); }
    finally { setSaving(false); }
  }

  return <>
    <Button onClick={() => setOpen(true)}><IconEdit className="size-4" /> Edit profile</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-md"><form onSubmit={handleSave}>
      <DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Update your personal account details.</DialogDescription></DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-3"><div className="grid gap-2"><Label htmlFor="profile-first-name">First name</Label><Input id="profile-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="profile-last-name">Last name</Label><Input id="profile-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} /></div></div>
        <div className="grid gap-2"><Label htmlFor="profile-email">Email (optional)</Label><Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        <div className="grid gap-2"><Label htmlFor="profile-mobile">Mobile</Label><Input id="profile-mobile" value={mobile} onChange={(event) => setMobile(event.target.value)} /></div>
        <div className="grid gap-2"><Label htmlFor="profile-job-title">Job title</Label><Input id="profile-job-title" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} /></div>
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}><IconDeviceFloppy className="size-4" /> {saving ? "Saving…" : "Save changes"}</Button></DialogFooter>
    </form></DialogContent></Dialog>
  </>;
}
