"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconCloudUpload,
  IconFolder,
  IconFolderFilled,
  IconPhoto,
  IconFileText,
  IconVideo,
  IconMusic,
  IconFileZip,
  IconCode,
  IconStar,
  IconStarFilled,
  IconDots,
  IconSearch,
  IconLayoutGrid,
  IconLayoutList,
  IconFiles,
  IconClock,
  IconUsers,
  IconTrash,
  IconDownload,
  IconPencil,
  IconCopy,
  IconLink,
  IconChevronRight,
  IconFolderPlus,
  IconServer2,
  IconLayoutSidebar,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { files as seedFiles, currentUser, team, type FileNode } from "@/data";
import { cn } from "@/lib/utils";

type KindMeta = {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  label: string;
};

// Shared row/card action handlers so both the grid and list views stay in sync.
type FileActions = {
  onToggleStar: (id: string) => void;
  onOpen: (f: FileNode) => void;
  onCopyLink: (f: FileNode) => void;
  onRename: (f: FileNode) => void;
  onDuplicate: (f: FileNode) => void;
  onDelete: (f: FileNode) => void;
};

const uploadKinds: FileNode["kind"][] = [
  "document",
  "image",
  "video",
  "audio",
  "archive",
  "code",
];

const kindMeta: Record<FileNode["kind"], KindMeta> = {
  folder: {
    icon: IconFolderFilled,
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Folder",
  },
  image: {
    icon: IconPhoto,
    tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    label: "Image",
  },
  document: {
    icon: IconFileText,
    tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Document",
  },
  video: {
    icon: IconVideo,
    tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Video",
  },
  audio: {
    icon: IconMusic,
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Audio",
  },
  archive: {
    icon: IconFileZip,
    tint: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    label: "Archive",
  },
  code: {
    icon: IconCode,
    tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    label: "Code",
  },
};

const navItems = [
  { id: "all", label: "All files", icon: IconFiles },
  { id: "recent", label: "Recent", icon: IconClock },
  { id: "starred", label: "Starred", icon: IconStar },
  { id: "shared", label: "Shared", icon: IconUsers },
  { id: "trash", label: "Trash", icon: IconTrash },
] as const;

type NavId = (typeof navItems)[number]["id"];

const sortOptions = [
  { id: "name", label: "Name" },
  { id: "modified", label: "Last modified" },
  { id: "size", label: "Size" },
  { id: "kind", label: "Type" },
] as const;

type SortId = (typeof sortOptions)[number]["id"];

function sizeToBytes(size: string): number {
  const match = size.match(/([\d.]+)\s*(KB|MB|GB)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const mult = unit === "GB" ? 1_000_000_000 : unit === "MB" ? 1_000_000 : 1_000;
  return value * mult;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function metaText(f: FileNode) {
  return f.kind === "folder" ? `${f.items ?? 0} items` : f.size;
}

// Storage breakdown — deterministic, illustrative figures.
const storageUsedGb = 68.4;
const storageTotalGb = 100;
const storageBreakdown = [
  { label: "Documents", value: 24.2, color: "bg-blue-500" },
  { label: "Media", value: 31.8, color: "bg-violet-500" },
  { label: "Archives", value: 8.6, color: "bg-slate-500" },
  { label: "Other", value: 3.8, color: "bg-emerald-500" },
];

export default function FileManagerPage() {
  const [items, setItems] = useState<FileNode[]>(seedFiles);
  const [nav, setNav] = useState<NavId>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("name");
  const [view, setView] = useState<"grid" | "list">("grid");
  // Mobile: the nav + storage rail opens as a slide-over sheet.
  const [railOpen, setRailOpen] = useState(false);

  // New folder + upload dialog state.
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadKind, setUploadKind] = useState<FileNode["kind"]>("document");

  const owner = team[0];
  const today = () => new Date().toISOString().slice(0, 10);

  function toggleStar(id: string) {
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f)),
    );
  }

  function createFolder() {
    const name = folderName.trim();
    if (!name) return;
    const folder: FileNode = {
      id: `F-${Date.now()}`,
      name,
      kind: "folder",
      size: "—",
      items: 0,
      modified: today(),
      owner,
    };
    setItems((prev) => [folder, ...prev]);
    setFolderOpen(false);
    setFolderName("");
    setNav("all");
    toast.success("Folder created", { description: name });
  }

  function uploadFile() {
    const name = uploadName.trim();
    if (!name) return;
    const file: FileNode = {
      id: `F-${Date.now()}`,
      name,
      kind: uploadKind,
      size: "1.2 MB",
      modified: today(),
      owner,
    };
    setItems((prev) => [file, ...prev]);
    setUploadOpen(false);
    setUploadName("");
    setUploadKind("document");
    setNav("all");
    toast.success("File uploaded", { description: name });
  }

  function duplicateFile(f: FileNode) {
    const copy: FileNode = {
      ...f,
      id: `F-${Date.now()}`,
      name: `${f.name} (copy)`,
      starred: false,
    };
    setItems((prev) => [copy, ...prev]);
    toast.success("Copy created", { description: copy.name });
  }

  function deleteFile(f: FileNode) {
    setItems((prev) => prev.filter((x) => x.id !== f.id));
    toast.success("Moved to trash", { description: f.name });
  }

  function copyLink(f: FileNode) {
    const link = `https://orbynadmin.com/files/${f.id}`;
    navigator.clipboard
      ?.writeText(link)
      .then(() => toast.success("Link copied", { description: link }))
      .catch(() => toast.error("Couldn't copy link"));
  }

  const actions: FileActions = {
    onToggleStar: toggleStar,
    onOpen: (f) =>
      toast(f.kind === "folder" ? `Opening ${f.name}` : `Downloading ${f.name}`),
    onCopyLink: copyLink,
    onRename: (f) => toast("Rename", { description: `Renaming “${f.name}”.` }),
    onDuplicate: duplicateFile,
    onDelete: deleteFile,
  };

  const counts = useMemo(
    () => ({
      all: items.length,
      recent: items.length,
      starred: items.filter((f) => f.starred).length,
      shared: items.filter((f) => f.owner.name !== currentUser.name).length,
      trash: 0,
    }),
    [items],
  );

  const visible = useMemo(() => {
    let list = items.slice();
    if (nav === "starred") list = list.filter((f) => f.starred);
    else if (nav === "shared")
      list = list.filter((f) => f.owner.name !== currentUser.name);
    else if (nav === "trash") list = [];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.owner.name.toLowerCase().includes(q),
      );
    }

    // Folders always float to the top, then apply the chosen sort.
    list.sort((a, b) => {
      if (a.kind === "folder" && b.kind !== "folder") return -1;
      if (a.kind !== "folder" && b.kind === "folder") return 1;
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "modified") return b.modified.localeCompare(a.modified);
      if (sort === "size") return sizeToBytes(b.size) - sizeToBytes(a.size);
      return a.kind.localeCompare(b.kind);
    });

    return list;
  }, [items, nav, query, sort]);

  const activeLabel = navItems.find((n) => n.id === nav)?.label ?? "All files";

  // Rail content is shared between the desktop aside and the mobile slide-over.
  const railContent = (onNavigate?: () => void) => (
    <>
      <nav className="flex flex-col gap-0.5">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setNav(n.id);
              onNavigate?.();
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/60",
              nav === n.id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            <n.icon className="size-4" />
            <span className="flex-1 text-left">{n.label}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {counts[n.id]}
            </span>
          </button>
        ))}
      </nav>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconServer2 className="size-4 text-muted-foreground" />
            Storage
          </div>
          <Progress
            value={(storageUsedGb / storageTotalGb) * 100}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {storageUsedGb} GB of {storageTotalGb} GB used
          </p>
          <Separator />
          <ul className="space-y-2">
            {storageBreakdown.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-xs">
                <span className={cn("size-2.5 rounded-full", s.color)} />
                <span className="text-muted-foreground">{s.label}</span>
                <span className="ml-auto font-medium tabular-nums">
                  {s.value} GB
                </span>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              toast("Upgrade storage", {
                description: "Head to Billing to add more space.",
              })
            }
          >
            Upgrade storage
          </Button>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Files"
        description="Browse, organize and share everything in your workspace."
      >
        <Button variant="outline" size="sm" onClick={() => setFolderOpen(true)}>
          <IconFolderPlus className="size-4" /> New folder
        </Button>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <IconCloudUpload className="size-4" /> Upload
        </Button>
      </PageHeader>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Workspace</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Left rail */}
        <aside className="hidden flex-col gap-4 lg:flex">{railContent()}</aside>

        {/* Main area */}
        <div className="min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files and folders"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={railOpen} onOpenChange={setRailOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0 md:hidden"
                    aria-label="Views and storage"
                  >
                    <IconLayoutSidebar className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="gap-0">
                  <SheetHeader className="border-b">
                    <SheetTitle>Files</SheetTitle>
                    <SheetDescription>
                      Jump to a view or check your storage.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
                    {railContent(() => setRailOpen(false))}
                  </div>
                </SheetContent>
              </Sheet>
              <Select value={sort} onValueChange={(v) => setSort(v as SortId)}>
                <SelectTrigger size="sm" className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {sortOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center rounded-lg border p-0.5">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-7"
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                >
                  <IconLayoutGrid className="size-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-7"
                  onClick={() => setView("list")}
                  aria-label="List view"
                >
                  <IconLayoutList className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{activeLabel}</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {visible.length} {visible.length === 1 ? "item" : "items"}
            </span>
          </div>

          {visible.length === 0 ? (
            <EmptyState nav={nav} onUpload={() => setUploadOpen(true)} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((f) => (
                <FileCard key={f.id} file={f} actions={actions} />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Modified</TableHead>
                      <TableHead className="w-10 pr-4" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((f) => {
                      const meta = kindMeta[f.kind];
                      return (
                        <TableRow key={f.id} className="group">
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "flex size-8 shrink-0 items-center justify-center rounded-md",
                                  meta.tint,
                                )}
                              >
                                <meta.icon className="size-4" />
                              </span>
                              <span className="truncate font-medium">
                                {f.name}
                              </span>
                              {f.starred && (
                                <IconStarFilled className="size-3.5 shrink-0 text-amber-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarImage
                                  src={f.owner.avatar}
                                  alt={f.owner.name}
                                />
                                <AvatarFallback>
                                  {f.owner.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-sm text-muted-foreground">
                                {f.owner.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground tabular-nums">
                            {metaText(f)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground tabular-nums">
                            {formatDate(f.modified)}
                          </TableCell>
                          <TableCell className="pr-4">
                            <RowMenu file={f} actions={actions} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New folder dialog */}
      <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Create a folder to organize your files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Untitled folder"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) createFolder();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFolder} disabled={!folderName.trim()}>
              Create folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload file</DialogTitle>
            <DialogDescription>
              Add a file to your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-name">File name</Label>
              <Input
                id="upload-name"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="report-final.pdf"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) uploadFile();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={uploadKind}
                onValueChange={(v) => setUploadKind(v as FileNode["kind"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uploadKinds.map((k) => (
                    <SelectItem key={k} value={k}>
                      {kindMeta[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={uploadFile} disabled={!uploadName.trim()}>
              <IconCloudUpload className="size-4" /> Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FileCard({
  file,
  actions,
}: {
  file: FileNode;
  actions: FileActions;
}) {
  const meta = kindMeta[file.kind];
  return (
    <Card className="group gap-0 p-0 transition-colors hover:border-foreground/20">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              meta.tint,
            )}
          >
            <meta.icon className="size-5" />
          </span>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => actions.onToggleStar(file.id)}
              aria-label={file.starred ? "Unstar" : "Star"}
            >
              {file.starred ? (
                <IconStarFilled className="size-4 text-amber-500" />
              ) : (
                <IconStar className="size-4 text-muted-foreground" />
              )}
            </Button>
            <RowMenu file={file} actions={actions} />
          </div>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <span>{metaText(file)}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{formatDate(file.modified)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t pt-3">
          <Avatar className="size-5">
            <AvatarImage src={file.owner.avatar} alt={file.owner.name} />
            <AvatarFallback className="text-[10px]">
              {file.owner.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs text-muted-foreground">
            {file.owner.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RowMenu({
  file,
  actions,
}: {
  file: FileNode;
  actions: FileActions;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          aria-label="File actions"
        >
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => actions.onOpen(file)}>
          {file.kind === "folder" ? (
            <IconFolder className="size-4" />
          ) : (
            <IconDownload className="size-4" />
          )}
          {file.kind === "folder" ? "Open" : "Download"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onToggleStar(file.id)}>
          {file.starred ? (
            <IconStarFilled className="size-4" />
          ) : (
            <IconStar className="size-4" />
          )}
          {file.starred ? "Remove star" : "Add star"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onRename(file)}>
          <IconPencil className="size-4" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onCopyLink(file)}>
          <IconLink className="size-4" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onDuplicate(file)}>
          <IconCopy className="size-4" /> Make a copy
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => actions.onDelete(file)}
        >
          <IconTrash className="size-4" /> Move to trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState({ nav, onUpload }: { nav: NavId; onUpload: () => void }) {
  const copy: Record<NavId, { title: string; body: string }> = {
    all: {
      title: "No files yet",
      body: "Upload your first file to get started.",
    },
    recent: {
      title: "Nothing recent",
      body: "Files you open will appear here.",
    },
    starred: {
      title: "No starred files",
      body: "Star files to find them quickly later.",
    },
    shared: {
      title: "Nothing shared",
      body: "Files shared with you will show up here.",
    },
    trash: {
      title: "Trash is empty",
      body: "Deleted files stay here for 30 days.",
    },
  };
  const { title, body } = copy[nav];
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <IconFolder className="size-6" />
        </span>
        <p className="font-medium">{title}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
        <Button size="sm" className="mt-2" onClick={onUpload}>
          <IconCloudUpload className="size-4" /> Upload
        </Button>
      </CardContent>
    </Card>
  );
}
