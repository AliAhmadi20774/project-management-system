"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconSearch,
  IconRefresh,
  IconInbox,
  IconStar,
  IconStarFilled,
  IconSend,
  IconFile,
  IconArchive,
  IconTrash,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDotsVertical,
  IconPencil,
  IconMail,
} from "@tabler/icons-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
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
import { cn } from "@/lib/utils";

type Email = {
  id: string;
  sender: string;
  email: string;
  avatar: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  starred: boolean;
  label?: { text: string; className: string };
};

const labels = {
  work: { text: "Work", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  billing: { text: "Billing", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  urgent: { text: "Urgent", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  team: { text: "Team", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

const seedEmails: Email[] = [
  {
    id: "m1",
    sender: "Emma Carter",
    email: "emma.carter@vertexlabs.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1",
    subject: "Q3 roadmap review — your input needed",
    preview: "Hi Alex, I've compiled the draft roadmap for next quarter and would love your feedback before…",
    body: "Hi Alex,\n\nI've compiled the draft roadmap for next quarter and would love your feedback before Friday's leadership sync. The main themes are onboarding improvements, the new analytics suite, and a refresh of the billing flow.\n\nCould you take a look at the shared doc and drop comments where you see gaps? I'm especially unsure about the sequencing of the analytics work.\n\nThanks so much,\nEmma",
    time: "9:41 AM",
    read: false,
    starred: true,
    label: labels.work,
  },
  {
    id: "m2",
    sender: "Stripe",
    email: "receipts@stripe.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=32",
    subject: "Your receipt from OrbynAdmin. — $2,400.00",
    preview: "Thanks for your payment. Here is the receipt for your Enterprise subscription renewal…",
    body: "Thanks for your payment.\n\nHere is the receipt for your Enterprise subscription renewal. Your card ending in 4242 was charged $2,400.00 for the annual plan.\n\nYou can view and download your full invoice history from the billing portal at any time.\n\n— The Stripe Team",
    time: "8:15 AM",
    read: false,
    starred: false,
    label: labels.billing,
  },
  {
    id: "m3",
    sender: "Liam Nguyen",
    email: "liam.nguyen@northwind.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=12",
    subject: "Re: Staging deploy is green ✅",
    preview: "Confirmed — I pushed the fix for the auth redirect and everything looks stable on staging now…",
    body: "Confirmed — I pushed the fix for the auth redirect and everything looks stable on staging now.\n\nI'll monitor error rates over the next few hours, but I think we're clear to promote to production first thing tomorrow. Let me know if you'd like me to hold.\n\nCheers,\nLiam",
    time: "Yesterday",
    read: true,
    starred: false,
    label: labels.team,
  },
  {
    id: "m4",
    sender: "Olivia Patel",
    email: "olivia.patel@lumenco.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5",
    subject: "Contract renewal — action required",
    preview: "Our current agreement expires at the end of the month. I've attached the updated terms for…",
    body: "Hi Alex,\n\nOur current agreement expires at the end of the month. I've attached the updated terms for the next 12 months, which include the volume discount we discussed on our last call.\n\nPlease review and sign at your convenience. Happy to jump on a call if anything needs clarifying.\n\nBest,\nOlivia",
    time: "Yesterday",
    read: false,
    starred: true,
    label: labels.urgent,
  },
  {
    id: "m5",
    sender: "GitHub",
    email: "notifications@github.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=45",
    subject: "[orbynadmin/platform] 3 pull requests need review",
    preview: "You have been requested to review pull requests in orbynadmin/platform. Oldest is 2 days old…",
    body: "You have been requested to review the following pull requests in orbynadmin/platform:\n\n• #482 Add rate limiting to the public API\n• #485 Refactor billing webhooks\n• #487 Fix dark mode contrast on the settings page\n\nThe oldest has been waiting 2 days.",
    time: "Yesterday",
    read: true,
    starred: false,
    label: labels.work,
  },
  {
    id: "m6",
    sender: "Noah Kim",
    email: "noah.kim@aperture.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=13",
    subject: "Design handoff for the new dashboard",
    preview: "The Figma file is ready for engineering. I've annotated the spacing and included both themes…",
    body: "Hey team,\n\nThe Figma file is ready for engineering. I've annotated the spacing and included both light and dark themes, plus the empty and loading states.\n\nLet me know if anything is unclear — I'll be around all afternoon.\n\nNoah",
    time: "Mon",
    read: true,
    starred: false,
    label: labels.team,
  },
  {
    id: "m7",
    sender: "Ava Brooks",
    email: "ava.brooks@blueharbor.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9",
    subject: "Thanks for the demo!",
    preview: "Really enjoyed the walkthrough yesterday. The team is excited to move forward with a pilot…",
    body: "Hi Alex,\n\nReally enjoyed the walkthrough yesterday. The team is excited to move forward with a pilot in the marketing org.\n\nWhat would be the best next step to get a trial workspace set up? We'd ideally like to start before the end of the month.\n\nThanks,\nAva",
    time: "Mon",
    read: true,
    starred: true,
  },
  {
    id: "m8",
    sender: "Security Alerts",
    email: "security@orbynadmin.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=60",
    subject: "New sign-in from Chrome on macOS",
    preview: "We noticed a new sign-in to your account. If this was you, no action is needed…",
    body: "We noticed a new sign-in to your account from Chrome on macOS in San Francisco, US.\n\nIf this was you, no action is needed. If you don't recognize this activity, please reset your password immediately and enable two-factor authentication.",
    time: "Sun",
    read: true,
    starred: false,
    label: labels.urgent,
  },
  {
    id: "m9",
    sender: "Ethan Silva",
    email: "ethan.silva@sunroot.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=15",
    subject: "Onboarding complete 🎉",
    preview: "Just finished setting up the workspace and inviting the rest of the team. Everything working…",
    body: "Just finished setting up the workspace and inviting the rest of the team. Everything is working smoothly so far.\n\nOne small question — is there a way to bulk-import our existing contacts from a CSV? Couldn't find it in the settings.\n\nThanks for all the help getting us started!\nEthan",
    time: "Sun",
    read: true,
    starred: false,
  },
  {
    id: "m10",
    sender: "Product Digest",
    email: "digest@orbynadmin.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=52",
    subject: "What's new this week in OrbynAdmin",
    preview: "This week we shipped saved views, faster search, and a redesigned notifications center…",
    body: "Here's what shipped this week:\n\n• Saved views — pin your favorite filters to any table\n• 3x faster global search\n• A redesigned notifications center\n\nRead the full changelog and let us know what you'd like to see next.",
    time: "Sat",
    read: true,
    starred: false,
    label: labels.work,
  },
];

const folders = [
  { id: "inbox", name: "Inbox", icon: IconInbox, count: 4 },
  { id: "starred", name: "Starred", icon: IconStar, count: 4 },
  { id: "sent", name: "Sent", icon: IconSend, count: 0 },
  { id: "drafts", name: "Drafts", icon: IconFile, count: 2 },
  { id: "archive", name: "Archive", icon: IconArchive, count: 0 },
  { id: "trash", name: "Trash", icon: IconTrash, count: 0 },
];

export default function MailPage() {
  const [emails, setEmails] = useState(seedEmails);
  const [folder, setFolder] = useState("inbox");
  const [selectedId, setSelectedId] = useState<string>(seedEmails[0].id);
  const [query, setQuery] = useState("");
  // Mobile master-detail: show the email list first, the reader after tapping.
  const [mobileReadOpen, setMobileReadOpen] = useState(false);

  // Composer state.
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"new" | "reply" | "forward">("new");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");

  const selected = emails.find((e) => e.id === selectedId) ?? null;

  const visible = emails.filter((e) => {
    if (folder === "starred" && !e.starred) return false;
    if (query && !`${e.sender} ${e.subject} ${e.preview}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  function openEmail(id: string) {
    setSelectedId(id);
    setMobileReadOpen(true);
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
  }

  function toggleStar(id: string) {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  }

  function markUnread(id: string) {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: false } : e)));
    toast.success("Marked as unread");
  }

  function removeEmail(id: string) {
    setEmails((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id ?? "");
      return next;
    });
  }

  function archiveEmail(id: string) {
    removeEmail(id);
    toast.success("Conversation archived");
  }

  function deleteEmail(id: string) {
    removeEmail(id);
    toast.success("Moved to trash");
  }

  function openCompose() {
    setComposeMode("new");
    setTo("");
    setSubject("");
    setBodyText("");
    setComposeOpen(true);
  }

  function openReply() {
    if (!selected) return;
    setComposeMode("reply");
    setTo(selected.email);
    setSubject(`Re: ${selected.subject}`);
    setBodyText(`\n\n---\nOn ${selected.time}, ${selected.sender} wrote:\n${selected.body}`);
    setComposeOpen(true);
  }

  function openForward() {
    if (!selected) return;
    setComposeMode("forward");
    setTo("");
    setSubject(`Fwd: ${selected.subject}`);
    setBodyText(
      `\n\n---------- Forwarded message ----------\nFrom: ${selected.sender} <${selected.email}>\nSubject: ${selected.subject}\n\n${selected.body}`,
    );
    setComposeOpen(true);
  }

  function sendMail() {
    if (!to.trim()) {
      toast.error("Add at least one recipient");
      return;
    }
    setComposeOpen(false);
    toast.success("Message sent", { description: `To ${to.trim()}` });
    setTo("");
    setSubject("");
    setBodyText("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mail</h1>
        <p className="text-sm text-muted-foreground">
          Your unified inbox across every workspace.
        </p>
      </div>

      <Card className="grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden p-0 md:grid-cols-[200px_320px_1fr]">
        {/* Folders */}
        <div className="hidden flex-col gap-4 border-r p-4 md:flex">
          <Button className="w-full gap-2" onClick={openCompose}>
            <IconPencil className="size-4" /> Compose
          </Button>
          <nav className="flex flex-col gap-0.5">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted/60",
                  folder === f.id ? "bg-muted font-medium" : "text-muted-foreground",
                )}
              >
                <f.icon className="size-4" />
                <span className="flex-1 text-left">{f.name}</span>
                {f.count > 0 && (
                  <span className="text-xs tabular-nums text-muted-foreground">{f.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Email list */}
        <div
          className={cn(
            "min-w-0 flex-col border-r md:flex",
            mobileReadOpen ? "hidden" : "flex"
          )}
        >
          <div className="flex items-center gap-2 border-b p-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mail"
                className="pl-9"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.success("Inbox refreshed", { description: "You're all caught up." })}
              aria-label="Refresh"
            >
              <IconRefresh className="size-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y">
              {visible.map((e) => (
                <button
                  key={e.id}
                  onClick={() => openEmail(e.id)}
                  className={cn(
                    "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    e.id === selectedId && "bg-muted/60",
                  )}
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={e.avatar} alt={e.sender} />
                    <AvatarFallback>{e.sender.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!e.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                      <span
                        className={cn(
                          "truncate text-sm",
                          e.read ? "text-foreground" : "font-semibold",
                        )}
                      >
                        {e.sender}
                      </span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">{e.time}</span>
                    </div>
                    <p className={cn("truncate text-sm", !e.read && "font-medium")}>{e.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.preview}</p>
                    {e.label && (
                      <Badge variant="secondary" className={cn("mt-1.5", e.label.className)}>
                        {e.label.text}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              {visible.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No messages found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reading pane */}
        <div
          className={cn(
            "min-w-0 flex-col md:flex",
            mobileReadOpen ? "flex" : "hidden"
          )}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-1 border-b p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-1 shrink-0 md:hidden"
                  onClick={() => setMobileReadOpen(false)}
                  aria-label="Back to inbox"
                >
                  <IconArrowLeft className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => archiveEmail(selected.id)}
                  aria-label="Archive"
                >
                  <IconArchive className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteEmail(selected.id)}
                  aria-label="Delete"
                >
                  <IconTrash className="size-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-5" />
                <Button variant="ghost" size="icon" onClick={openReply} aria-label="Reply">
                  <IconArrowBackUp className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={openForward} aria-label="Forward">
                  <IconArrowForwardUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => toggleStar(selected.id)}
                  aria-label={selected.starred ? "Unstar" : "Star"}
                >
                  {selected.starred ? (
                    <IconStarFilled className="size-4 text-amber-500" />
                  ) : (
                    <IconStar className="size-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="More actions">
                      <IconDotsVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => markUnread(selected.id)}>
                      <IconMail className="size-4" /> Mark as unread
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStar(selected.id)}>
                      {selected.starred ? (
                        <IconStarFilled className="size-4" />
                      ) : (
                        <IconStar className="size-4" />
                      )}
                      {selected.starred ? "Remove star" : "Add star"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => archiveEmail(selected.id)}>
                      <IconArchive className="size-4" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => deleteEmail(selected.id)}
                    >
                      <IconTrash className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <div className="flex items-start gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">{selected.subject}</h2>
                    {selected.label && (
                      <Badge variant="secondary" className={selected.label.className}>
                        {selected.label.text}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={selected.avatar} alt={selected.sender} />
                      <AvatarFallback>{selected.sender.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{selected.sender}</p>
                      <p className="truncate text-xs text-muted-foreground">{selected.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{selected.time}</span>
                  </div>
                  <Separator className="my-5" />
                  <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {selected.body}
                  </div>
                  <Separator className="my-6" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openReply}>
                      <IconArrowBackUp className="size-4" /> Reply
                    </Button>
                    <Button variant="outline" size="sm" onClick={openForward}>
                      <IconArrowForwardUp className="size-4" /> Forward
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Select an email to read
            </div>
          )}
        </div>
      </Card>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {composeMode === "reply"
                ? "Reply"
                : composeMode === "forward"
                  ? "Forward"
                  : "New message"}
            </DialogTitle>
            <DialogDescription>
              Compose your message and send it on its way.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mail-to">To</Label>
              <Input
                id="mail-to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="name@company.com"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail-subject">Subject</Label>
              <Input
                id="mail-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail-body">Message</Label>
              <Textarea
                id="mail-body"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Write your message…"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendMail}>
              <IconSend className="size-4" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
