"use client";

import { useMemo, useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconNotes,
  IconBriefcase,
  IconUser,
  IconBulb,
  IconArchive,
  IconPin,
  IconPinnedFilled,
  IconTrash,
  IconPalette,
  IconDots,
  IconSquare,
  IconSquareCheck,
  IconTag,
  IconClock,
  IconShare3,
  IconArrowLeft,
} from "@tabler/icons-react";

import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/delete-dialog";
import { cn } from "@/lib/utils";

type NoteColor = "blue" | "violet" | "emerald" | "amber" | "rose" | "slate";
type FolderId = "work" | "personal" | "ideas" | "archive";

type ChecklistItem = { id: string; text: string; done: boolean };

type Note = {
  id: string;
  title: string;
  preview: string;
  folder: FolderId;
  color: NoteColor;
  tags: string[];
  date: string;
  edited: string;
  pinned: boolean;
  body: string[];
  checklist?: { heading: string; items: ChecklistItem[] };
};

const colorMeta: Record<
  NoteColor,
  { dot: string; badge: string; bar: string; label: string }
> = {
  blue: {
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
    label: "Blue",
  },
  violet: {
    dot: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    label: "Violet",
  },
  emerald: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    label: "Green",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    label: "Amber",
  },
  rose: {
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    label: "Rose",
  },
  slate: {
    dot: "bg-slate-500",
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    bar: "bg-slate-500",
    label: "Slate",
  },
};

const folders = [
  { id: "all", label: "All Notes", icon: IconNotes },
  { id: "work", label: "Work", icon: IconBriefcase },
  { id: "personal", label: "Personal", icon: IconUser },
  { id: "ideas", label: "Ideas", icon: IconBulb },
  { id: "archive", label: "Archive", icon: IconArchive },
] as const;

type NavId = (typeof folders)[number]["id"];

const seedNotes: Note[] = [
  {
    id: "n1",
    title: "Q3 Product Roadmap",
    preview:
      "Three bets for the quarter: onboarding, the analytics suite, and a billing refresh. Ship the checklist first.",
    folder: "work",
    color: "blue",
    tags: ["roadmap", "planning"],
    date: "Jul 15",
    edited: "Edited Jul 15, 2026 · 2:14 PM",
    pinned: true,
    body: [
      "We're placing three bets this quarter. Each one should be measurable by the end of September, and every team lead owns a clear slice of the work.",
      "Onboarding is the biggest lever — week-1 activation has been flat for two quarters. If the new checklist and product tour move it even five points, everything downstream improves.",
      "Analytics is the differentiator our largest accounts keep asking for. Billing v2 unblocks metered pricing, which unlocks the enterprise motion.",
    ],
    checklist: {
      heading: "Before the leadership sync",
      items: [
        { id: "c1", text: "Draft activation funnel dashboard", done: true },
        { id: "c2", text: "Confirm billing migration timeline", done: true },
        { id: "c3", text: "Align pricing with finance", done: false },
        { id: "c4", text: "Share doc for async comments", done: false },
      ],
    },
  },
  {
    id: "n2",
    title: "Launch checklist — Mobile App v2",
    preview:
      "Everything that has to be green before we flip the flag. App Store review is the long pole.",
    folder: "work",
    color: "emerald",
    tags: ["launch", "mobile"],
    date: "Jul 14",
    edited: "Edited Jul 14, 2026 · 6:02 PM",
    pinned: true,
    body: [
      "Target date is the 28th. App Store review is the long pole, so the build has to be submitted no later than the 22nd to leave buffer for a re-review.",
      "Marketing has the announcement drafted; we just need the final screenshots once the empty states land.",
    ],
    checklist: {
      heading: "Ship gate",
      items: [
        { id: "c1", text: "Crash-free rate above 99.5%", done: true },
        { id: "c2", text: "Offline mode QA on iOS + Android", done: true },
        { id: "c3", text: "Submit build for App Store review", done: false },
        { id: "c4", text: "Schedule staged rollout (10% → 100%)", done: false },
        { id: "c5", text: "Update help center articles", done: false },
      ],
    },
  },
  {
    id: "n3",
    title: "1:1 with Priya — design system",
    preview:
      "Priya wants to consolidate the icon set and kill the one-off spacing tokens. Agreed to spike it next sprint.",
    folder: "work",
    color: "violet",
    tags: ["design", "1:1"],
    date: "Jul 12",
    edited: "Edited Jul 12, 2026 · 11:30 AM",
    pinned: false,
    body: [
      "Priya raised that we're carrying two icon libraries and a pile of one-off spacing values. It's slowing every new screen down and creating subtle inconsistencies in dark mode.",
      "We agreed to spike a consolidation next sprint: pick one icon set, codify the spacing scale, and document both in Storybook. She'll pair with Emma on the audit.",
      "Follow-up: get Marcus's read on the migration cost for the older Android views.",
    ],
  },
  {
    id: "n4",
    title: "Weekend in Kyoto",
    preview:
      "Rough itinerary for the trip — temples in the morning, food in the evening, and one full day in Arashiyama.",
    folder: "personal",
    color: "rose",
    tags: ["travel", "japan"],
    date: "Jul 9",
    edited: "Edited Jul 9, 2026 · 9:48 PM",
    pinned: false,
    body: [
      "Keep the mornings for temples before the crowds arrive, then use the afternoons for wandering and coffee. Evenings are for food — Nishiki Market and Pontocho alley.",
      "Save a whole day for Arashiyama: the bamboo grove first thing, then the monkey park and a slow lunch by the river.",
    ],
    checklist: {
      heading: "To book",
      items: [
        { id: "c1", text: "Ryokan for two nights in Gion", done: true },
        { id: "c2", text: "JR Pass (7-day)", done: false },
        { id: "c3", text: "Dinner reservation — kaiseki", done: false },
      ],
    },
  },
  {
    id: "n5",
    title: "Reading list",
    preview:
      "Books queued up for the rest of the year. Trying to alternate one fiction, one non-fiction.",
    folder: "personal",
    color: "amber",
    tags: ["books"],
    date: "Jul 6",
    edited: "Edited Jul 6, 2026 · 8:15 AM",
    pinned: false,
    body: [
      "The plan is simple: alternate one novel with one non-fiction so it never feels like homework. If a book isn't landing by page fifty, put it down guilt-free.",
    ],
    checklist: {
      heading: "Queue",
      items: [
        { id: "c1", text: "The Overstory — Richard Powers", done: true },
        { id: "c2", text: "Thinking in Systems — Donella Meadows", done: false },
        { id: "c3", text: "Piranesi — Susanna Clarke", done: false },
        { id: "c4", text: "The Design of Everyday Things", done: false },
      ],
    },
  },
  {
    id: "n6",
    title: "App idea: a calmer focus timer",
    preview:
      "Not another Pomodoro clone. Ambient soundscapes, gentle session ramps, and zero streak guilt.",
    folder: "ideas",
    color: "violet",
    tags: ["side-project", "product"],
    date: "Jul 4",
    edited: "Edited Jul 4, 2026 · 10:22 PM",
    pinned: false,
    body: [
      "Most focus apps punish you with streaks and harsh timers. The opposite bet: a timer that eases you in, fades the UI away, and never guilt-trips a missed day.",
      "Core loop is a single tap to start, a soft chime to end, and a quiet weekly reflection. Everything else is optional. If it can't be explained in one sentence, it doesn't ship.",
    ],
  },
  {
    id: "n7",
    title: "Blog post drafts",
    preview:
      "Half-formed titles for the engineering blog. The dark-mode one is closest to ready.",
    folder: "ideas",
    color: "blue",
    tags: ["writing", "engineering"],
    date: "Jul 1",
    edited: "Edited Jul 1, 2026 · 4:41 PM",
    pinned: false,
    body: [
      "A few post ideas worth developing. The dark-mode piece is closest to ready — I've already got the before/after screenshots and the token table.",
    ],
    checklist: {
      heading: "Candidate titles",
      items: [
        { id: "c1", text: "Designing dark mode that actually reads well", done: false },
        { id: "c2", text: "How we cut cold-start bundle size in half", done: false },
        { id: "c3", text: "A pragmatic guide to feature flags", done: false },
      ],
    },
  },
  {
    id: "n8",
    title: "Old sprint retro notes",
    preview:
      "Archived retro from the Q1 billing work. Keeping it for the action items we never closed.",
    folder: "archive",
    color: "slate",
    tags: ["retro"],
    date: "Mar 28",
    edited: "Edited Mar 28, 2026 · 3:05 PM",
    pinned: false,
    body: [
      "Retro from the Q1 billing sprint. Worth keeping because a couple of the action items are still open and keep resurfacing.",
      "What went well: the migration ran without downtime. What didn't: we underestimated webhook retries and lost two days to flaky tests.",
    ],
  },
];

const colorChoices: NoteColor[] = [
  "blue",
  "violet",
  "emerald",
  "amber",
  "rose",
  "slate",
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(seedNotes);
  const [folder, setFolder] = useState<NavId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(seedNotes[0].id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Mobile master-detail: show the notes list first, the editor after tapping one.
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // New-note dialog state.
  const [composeOpen, setComposeOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFolder, setNewFolder] = useState<FolderId>("work");
  const [newBody, setNewBody] = useState("");

  function createNote() {
    const t = newTitle.trim() || "Untitled note";
    const bodyText = newBody.trim();
    const now = new Date();
    const note: Note = {
      id: `n-${Date.now()}`,
      title: t,
      preview: bodyText ? bodyText.slice(0, 120) : "Empty note — start writing…",
      folder: newFolder,
      color: "blue",
      tags: [],
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      edited: `Edited ${now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} · just now`,
      pinned: false,
      body: bodyText
        ? bodyText.split("\n\n").map((p) => p.trim()).filter(Boolean)
        : ["Start writing your note here…"],
    };
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
    setFolder(newFolder);
    setComposeOpen(false);
    setNewTitle("");
    setNewBody("");
    setNewFolder("work");
    toast.success("Note created", { description: t });
  }

  function archiveNote(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, folder: "archive" } : n)),
    );
    toast.success("Note archived");
  }

  function shareNote(note: Note) {
    const link = `https://orbynadmin.com/notes/${note.id}`;
    navigator.clipboard
      ?.writeText(link)
      .then(() => toast.success("Link copied", { description: link }))
      .catch(() => toast.error("Couldn't copy link"));
  }

  const counts = useMemo(() => {
    const base = { all: 0, work: 0, personal: 0, ideas: 0, archive: 0 };
    for (const n of notes) {
      base[n.folder] += 1;
      if (n.folder !== "archive") base.all += 1;
    }
    return base;
  }, [notes]);

  const visible = useMemo(() => {
    let list = notes.filter((n) =>
      folder === "all" ? n.folder !== "archive" : n.folder === folder,
    );
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.preview.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list.slice().sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return 0;
    });
  }, [notes, folder, query]);

  const selected = notes.find((n) => n.id === selectedId) ?? visible[0] ?? null;

  function togglePin(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );
  }

  function setColor(id: string, color: NoteColor) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color } : n)));
  }

  function toggleCheck(noteId: string, itemId: string) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId && n.checklist
          ? {
              ...n,
              checklist: {
                ...n.checklist,
                items: n.checklist.items.map((it) =>
                  it.id === itemId ? { ...it, done: !it.done } : it,
                ),
              },
            }
          : n,
      ),
    );
  }

  function deleteNote(id: string) {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (id === selectedId && next.length) setSelectedId(next[0].id);
      return next;
    });
  }

  const tagCloud = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) n.tags.forEach((t) => set.add(t));
    return Array.from(set).slice(0, 8);
  }, [notes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Capture ideas, plans and checklists — all in one place.
        </p>
      </div>

      <Card className="grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden p-0 md:grid-cols-[220px_320px_1fr]">
        {/* LEFT: folders + tags */}
        <div className="hidden flex-col gap-4 border-r p-4 lg:flex">
          <Button className="w-full gap-2" onClick={() => setComposeOpen(true)}>
            <IconPlus className="size-4" /> New note
          </Button>

          <nav className="flex flex-col gap-0.5">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted/60",
                  folder === f.id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <f.icon className="size-4" />
                <span className="flex-1 text-left">{f.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </nav>

          <Separator />

          <div className="space-y-2">
            <p className="flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
              <IconTag className="size-3.5" /> Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tagCloud.map((t) => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE: note list */}
        <div
          className={cn(
            "min-w-0 flex-col border-r md:flex",
            mobileDetailOpen ? "hidden" : "flex",
          )}
        >
          <div className="flex items-center gap-2 border-b p-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes"
                className="pl-9"
              />
            </div>
            <Button
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setComposeOpen(true)}
              aria-label="New note"
            >
              <IconPlus className="size-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {visible.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedId(n.id);
                    setMobileDetailOpen(true);
                  }}
                  className={cn(
                    "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    n.id === selected?.id && "bg-muted/60",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        colorMeta[n.color].dot,
                      )}
                    />
                    <span className="flex-1 truncate text-sm font-medium">
                      {n.title}
                    </span>
                    {n.pinned && (
                      <IconPinnedFilled className="size-3.5 shrink-0 text-amber-500" />
                    )}
                  </div>
                  <p className="line-clamp-2 pl-4 text-xs text-muted-foreground">
                    {n.preview}
                  </p>
                  <span className="pl-4 text-[11px] text-muted-foreground tabular-nums">
                    {n.date}
                  </span>
                </button>
              ))}
              {visible.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notes found.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT: reader / editor */}
        <div
          className={cn(
            "min-w-0 flex-col md:flex",
            mobileDetailOpen ? "flex" : "hidden",
          )}
        >
          {selected ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-1 border-b p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-1 mr-0.5 shrink-0 md:hidden"
                  onClick={() => setMobileDetailOpen(false)}
                  aria-label="Back to notes"
                >
                  <IconArrowLeft className="size-5" />
                </Button>
                <span
                  className={cn(
                    "mr-1 h-5 w-1 rounded-full",
                    colorMeta[selected.color].bar,
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {folders.find((f) => f.id === selected.folder)?.label ??
                    "Notes"}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePin(selected.id)}
                    aria-label={selected.pinned ? "Unpin" : "Pin"}
                  >
                    {selected.pinned ? (
                      <IconPinnedFilled className="size-4 text-amber-500" />
                    ) : (
                      <IconPin className="size-4" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Note color">
                        <IconPalette className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Color</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="grid grid-cols-6 gap-1.5 p-1.5">
                        {colorChoices.map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(selected.id, c)}
                            aria-label={colorMeta[c].label}
                            className={cn(
                              "size-5 rounded-full ring-offset-2 ring-offset-popover transition-shadow hover:ring-2 hover:ring-ring",
                              colorMeta[c].dot,
                              selected.color === c && "ring-2 ring-ring",
                            )}
                          />
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Share"
                    onClick={() => shareNote(selected)}
                  >
                    <IconShare3 className="size-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="More">
                        <IconDots className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => togglePin(selected.id)}>
                        <IconPin className="size-4" />
                        {selected.pinned ? "Unpin note" : "Pin note"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archiveNote(selected.id)}>
                        <IconArchive className="size-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <IconTrash className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Separator
                    orientation="vertical"
                    className="mx-1 hidden h-5 md:block"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:inline-flex"
                    onClick={() => setDeleteOpen(true)}
                    aria-label="Delete note"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="mx-auto max-w-2xl space-y-5 p-6 md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {selected.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <IconClock className="size-3.5" /> {selected.edited}
                    </span>
                    <span className="tabular-nums">
                      {wordCount(selected)} words
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {selected.body.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-foreground/90"
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  {selected.checklist && (
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm font-medium">
                        {selected.checklist.heading}
                      </p>
                      <ul className="space-y-1.5">
                        {selected.checklist.items.map((it) => (
                          <li key={it.id}>
                            <button
                              onClick={() => toggleCheck(selected.id, it.id)}
                              className="flex w-full items-center gap-2.5 text-left text-sm"
                            >
                              {it.done ? (
                                <IconSquareCheck className="size-4 shrink-0 text-primary" />
                              ) : (
                                <IconSquare className="size-4 shrink-0 text-muted-foreground" />
                              )}
                              <span
                                className={cn(
                                  it.done &&
                                    "text-muted-foreground line-through",
                                )}
                              >
                                {it.text}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  <div className="flex flex-wrap items-center gap-2">
                    {selected.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className={colorMeta[selected.color].badge}
                      >
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Select a note to read
            </div>
          )}
        </div>
      </Card>

      {selected && (
        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          name={selected.title}
          description="This note will be permanently deleted. This action cannot be undone."
          onConfirm={() => deleteNote(selected.id)}
        />
      )}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
            <DialogDescription>Capture a fresh idea or plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Untitled note"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-body">Note</Label>
              <Textarea
                id="note-body"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Start writing…"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Folder</Label>
              <Select
                value={newFolder}
                onValueChange={(v) => setNewFolder(v as FolderId)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders
                    .filter((f) => f.id !== "all")
                    .map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNote}>Create note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function wordCount(note: Note) {
  const bodyWords = note.body.join(" ").trim().split(/\s+/).length;
  const listWords = note.checklist
    ? note.checklist.items.reduce(
        (sum, it) => sum + it.text.trim().split(/\s+/).length,
        0,
      )
    : 0;
  return bodyWords + listWords;
}
