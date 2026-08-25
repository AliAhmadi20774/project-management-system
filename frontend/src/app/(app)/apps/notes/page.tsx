"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconArchive,
  IconArrowLeft,
  IconBriefcase,
  IconBulb,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconNotes,
  IconPalette,
  IconPin,
  IconPinnedFilled,
  IconPlus,
  IconSearch,
  IconTag,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NoteEditor } from "@/components/notes/note-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Folder = "work" | "personal" | "ideas" | "archive";
type Color = "blue" | "violet" | "emerald" | "amber" | "rose" | "slate";
type Note = {
  id: number;
  title: string;
  body: string;
  content: Record<string, unknown> | null;
  folder: Folder;
  color: Color;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  updated_at: string;
};
type Filter = "all" | Folder;
const folders = [
  { id: "all", label: "All notes", icon: IconNotes },
  { id: "work", label: "Work", icon: IconBriefcase },
  { id: "personal", label: "Personal", icon: IconUser },
  { id: "ideas", label: "Ideas", icon: IconBulb },
  { id: "archive", label: "Archive", icon: IconArchive },
] as const;
const colors: Record<Color, { dot: string; bar: string }> = {
  blue: { dot: "bg-blue-500", bar: "bg-blue-500" },
  violet: { dot: "bg-violet-500", bar: "bg-violet-500" },
  emerald: { dot: "bg-emerald-500", bar: "bg-emerald-500" },
  amber: { dot: "bg-amber-500", bar: "bg-amber-500" },
  rose: { dot: "bg-rose-500", bar: "bg-rose-500" },
  slate: { dot: "bg-slate-500", bar: "bg-slate-500" },
};
const colorChoices = Object.keys(colors) as Color[];
const preview = (note: Note) =>
  note.body.trim().replace(/\s+/g, " ").slice(0, 120) ||
  "Empty note — start writing.";
const date = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
const extractTags = (value: string) =>
  [...value.matchAll(/(?:^|[\s(])#([\p{L}\p{N}_-]+)/gu)].reduce<string[]>(
    (items, match) => {
      const tag = match[1];
      return items.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())
        ? items
        : [...items, tag];
    },
    [],
  );

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/notes", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail);
        const items = Array.isArray(data) ? data : (data.results ?? []);
        setNotes(items);
        setSelectedId(items[0]?.id ?? null);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not load notes.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const selected = notes.find((note) => note.id === selectedId) ?? null;
  const counts = useMemo(() => {
    const next: Record<Filter, number> = {
      all: 0,
      work: 0,
      personal: 0,
      ideas: 0,
      archive: 0,
    };
    notes.forEach((note) => {
      next[note.folder] += 1;
      if (!note.is_archived && note.folder !== "archive") next.all += 1;
    });
    return next;
  }, [notes]);
  const visible = useMemo(
    () =>
      notes
        .filter((note) => {
          const inFolder =
            filter === "all"
              ? !note.is_archived && note.folder !== "archive"
              : note.folder === filter;
          return (
            inFolder &&
            [note.title, note.body, ...note.tags]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase())
          );
        })
        .sort(
          (left, right) =>
            Number(right.is_pinned) - Number(left.is_pinned) ||
            new Date(right.updated_at).getTime() -
              new Date(left.updated_at).getTime(),
        ),
    [notes, filter, query],
  );
  const tags = useMemo(
    () => [...new Set(notes.flatMap((note) => note.tags))].slice(0, 10),
    [notes],
  );
  const local = (id: number, patch: Partial<Note>) => {
    setDirty(true);
    setNotes((items) =>
      items.map((note) => (note.id === id ? { ...note, ...patch } : note)),
    );
  };
  async function save(id: number, patch: Partial<Note>, message?: string) {
    setSaving(true);
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      setNotes((items) => items.map((note) => (note.id === id ? data : note)));
      setDirty(false);
      if (message) toast.success(message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save note.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function create() {
    setCreating(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled note",
          body: "",
          content: { type: "doc", content: [{ type: "paragraph" }] },
          folder: "work",
          color: "blue",
          tags: [],
        }),
      });
      const note = await response.json();
      if (!response.ok) throw new Error(note.detail);
      setNotes((items) => [note, ...items]);
      setSelectedId(note.id);
      setFilter("work");
      setMobile(true);
      requestAnimationFrame(() =>
        document.getElementById("note-title")?.focus(),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create note.",
      );
    } finally {
      setCreating(false);
    }
  }
  async function remove() {
    if (!selected) return;
    try {
      const response = await fetch(`/api/notes/${selected.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      const remaining = notes.filter((note) => note.id !== selected.id);
      setNotes(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setConfirmDelete(false);
      toast.success("Note deleted");
    } catch {
      toast.error("Could not delete note.");
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Your private writing space.
        </p>
      </div>
      <Card
        className={cn(
          "grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden p-0",
          sidebarCollapsed
            ? "lg:grid-cols-[48px_260px_minmax(0,1fr)]"
            : "lg:grid-cols-[180px_260px_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "hidden flex-col gap-4 border-r p-4 lg:flex",
            sidebarCollapsed && "items-center p-1.5",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(sidebarCollapsed ? "" : "self-end")}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((value) => !value)}
          >
            {sidebarCollapsed ? (
              <IconChevronRight className="size-4" />
            ) : (
              <IconChevronLeft className="size-4" />
            )}
          </Button>
          {!sidebarCollapsed && (
            <>
          <Button
            className="w-full gap-2"
            disabled={creating}
            onClick={() => void create()}
          >
            <IconPlus className="size-4" /> New note
          </Button>
          <nav className="space-y-0.5">
            {folders.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                  item.id === filter
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                <item.icon className="size-4" />
                <span className="flex-1 text-left">{item.label}</span>
                <span className="text-xs">{counts[item.id]}</span>
              </button>
            ))}
          </nav>
          <Separator />
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
              <IconTag className="size-3.5" /> Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="rounded-full border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
            </>
          )}
        </aside>
        <section
          className={cn(
            "min-w-0 flex-col border-r md:flex",
            mobile ? "hidden" : "flex",
          )}
        >
          <div className="flex gap-2 border-b p-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes"
              />
            </div>
            <Button
              size="icon"
              className="md:hidden"
              onClick={() => void create()}
            >
              <IconPlus className="size-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading…</p>
              ) : (
                visible.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedId(note.id);
                      setMobile(true);
                    }}
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-muted/40",
                      note.id === selected?.id && "bg-muted/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          colors[note.color].dot,
                        )}
                      />
                      <span className="flex-1 truncate text-sm font-medium">
                        {note.title}
                      </span>
                      {note.is_pinned && (
                        <IconPinnedFilled className="size-3.5 text-amber-500" />
                      )}
                    </div>
                    <p className="line-clamp-2 pl-4 text-xs text-muted-foreground">
                      {preview(note)}
                    </p>
                    <span className="pl-4 text-[11px] text-muted-foreground">
                      {date(note.updated_at)}
                    </span>
                  </button>
                ))
              )}
              {!loading && !visible.length && (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No notes found.
                </p>
              )}
            </div>
          </ScrollArea>
        </section>
        <section
          className={cn("min-w-0 flex-col md:flex", mobile ? "flex" : "hidden")}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-1 border-b p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobile(false)}
                >
                  <IconArrowLeft className="size-5" />
                </Button>
                <span
                  className={cn(
                    "h-5 w-1 rounded-full",
                    colors[selected.color].bar,
                  )}
                />
                <Select
                  value={selected.folder}
                  onValueChange={(folder) =>
                    local(selected.id, { folder: folder as Folder })
                  }
                >
                  <SelectTrigger
                    aria-label="Move this note to a category"
                    className="ml-2 h-7 w-[164px] border-0 bg-transparent px-2 text-xs shadow-none focus:ring-0"
                  >
                    <span className="mr-1 text-muted-foreground">Move to:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folders
                      .filter((folder) => folder.id !== "all")
                      .map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-1">
                  <span className="mr-2 text-xs text-muted-foreground">
                    {saving ? "Saving…" : dirty ? "Unsaved changes" : "Saved"}
                  </span>
                  <Button
                    size="sm"
                    disabled={saving || !dirty}
                    onClick={() =>
                      void save(selected.id, {
                        title: selected.title || "Untitled note",
                        body: selected.body,
                        content: selected.content ?? {
                          type: "doc",
                          content: [{ type: "paragraph" }],
                        },
                        folder: selected.folder,
                        tags: selected.tags,
                      })
                    }
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      void save(selected.id, { is_pinned: !selected.is_pinned })
                    }
                  >
                    {selected.is_pinned ? (
                      <IconPinnedFilled className="size-4 text-amber-500" />
                    ) : (
                      <IconPin className="size-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <IconPalette className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="grid grid-cols-6 gap-2 p-2">
                        {colorChoices.map((color) => (
                          <button
                            key={color}
                            className={cn(
                              "size-5 rounded-full",
                              colors[color].dot,
                            )}
                            onClick={() => void save(selected.id, { color })}
                          />
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <IconDots className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          void save(
                            selected.id,
                            { folder: "archive", is_archived: true },
                            "Note archived",
                          )
                        }
                      >
                        <IconArchive className="size-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <IconTrash className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="mx-auto w-full max-w-5xl space-y-5 px-6 py-8 md:px-12">
                  <Input
                    id="note-title"
                    value={selected.title}
                    onChange={(event) =>
                      local(selected.id, { title: event.target.value })
                    }
                    className="h-auto border-0 px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
                  />
                  <p className="text-xs text-muted-foreground">
                    {selected.body.trim()
                      ? selected.body.trim().split(/\s+/).length
                      : 0}{" "}
                    words · Edited {date(selected.updated_at)}
                  </p>
                  <Separator />
                  <NoteEditor
                    content={selected.content}
                    onChange={(content, body) =>
                      local(selected.id, {
                        content,
                        body,
                        tags: extractTags(body),
                      })
                    }
                  />
                  <Separator />
                  {selected.tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selected.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Add tags in the text with #hashtag.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <IconNotes className="size-8" />
              <span>Create a note to start writing.</span>
              <Button onClick={() => void create()}>
                <IconPlus className="size-4" /> New note
              </Button>
            </div>
          )}
        </section>
      </Card>
      {selected && (
        <DeleteDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          name={selected.title}
          description="This note will be permanently deleted."
          onConfirm={remove}
        />
      )}
    </div>
  );
}
