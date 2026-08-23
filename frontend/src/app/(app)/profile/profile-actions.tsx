"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconEdit, IconMessage, IconDeviceFloppy } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currentUser } from "@/data";

export function ProfileActions() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState("Product & Growth");
  const [bio, setBio] = useState(
    "Product leader focused on building delightful, data-driven experiences."
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast.success("Profile updated", {
      description: "Your changes have been saved.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Message sent", {
            description: `Your message to ${currentUser.name} is on its way.`,
          })
        }
      >
        <IconMessage className="size-4" /> Message
      </Button>
      <Button onClick={() => setOpen(true)}>
        <IconEdit className="size-4" /> Edit profile
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Update the details shown on your public profile.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-role">Role</Label>
                <Input
                  id="profile-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea
                  id="profile-bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <IconDeviceFloppy className="size-4" /> Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
