"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconMessage2,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconFileText,
  IconWorld,
  IconClipboardText,
  IconMessages,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { team } from "@/data";

type PostStatus = "Published" | "Draft" | "Scheduled";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  category: string;
  status: PostStatus;
  date: string;
  views: number;
  comments: number;
  gradient: string;
};

const statusStyles: Record<PostStatus, string> = {
  Published: "border-transparent bg-white/90 text-emerald-700 shadow-sm backdrop-blur-sm",
  Draft: "border-transparent bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm",
  Scheduled: "border-transparent bg-white/90 text-violet-700 shadow-sm backdrop-blur-sm",
};

function gradient(a: number, b: number) {
  return `linear-gradient(135deg, var(--chart-${a}), var(--chart-${b}))`;
}

const POSTS: Post[] = [
  {
    id: "POST-01",
    title: "Introducing metered billing: pay for exactly what you use",
    excerpt:
      "Our new usage-based billing engine gives teams granular control over spend. Here's how it works and how to migrate.",
    author: team[0].name,
    authorAvatar: team[0].avatar,
    category: "Product",
    status: "Published",
    date: "2026-07-14",
    views: 8420,
    comments: 34,
    gradient: gradient(1, 2),
  },
  {
    id: "POST-02",
    title: "How we cut dashboard load times by 60%",
    excerpt:
      "A deep dive into the query batching, edge caching and lazy-loading work that made the app feel instant.",
    author: team[2].name,
    authorAvatar: team[2].avatar,
    category: "Engineering",
    status: "Published",
    date: "2026-07-11",
    views: 12680,
    comments: 51,
    gradient: gradient(3, 4),
  },
  {
    id: "POST-03",
    title: "Designing a component library that scales",
    excerpt:
      "The principles behind our design system — tokens, theming and the discipline that keeps 200+ components consistent.",
    author: team[3].name,
    authorAvatar: team[3].avatar,
    category: "Design",
    status: "Published",
    date: "2026-07-08",
    views: 6110,
    comments: 22,
    gradient: gradient(5, 1),
  },
  {
    id: "POST-04",
    title: "A practical guide to activation metrics",
    excerpt:
      "Signups are vanity — activation is truth. How we instrument the funnel to know when a user has really landed.",
    author: team[1].name,
    authorAvatar: team[1].avatar,
    category: "Marketing",
    status: "Published",
    date: "2026-07-05",
    views: 4530,
    comments: 18,
    gradient: gradient(2, 3),
  },
  {
    id: "POST-05",
    title: "Our road to SOC 2 Type II compliance",
    excerpt:
      "The controls, policies and monitoring we put in place — and what we'd do differently the second time around.",
    author: team[8].name,
    authorAvatar: team[8].avatar,
    category: "Company",
    status: "Scheduled",
    date: "2026-07-22",
    views: 0,
    comments: 0,
    gradient: gradient(4, 5),
  },
  {
    id: "POST-06",
    title: "Building offline-first mobile apps with a shared design system",
    excerpt:
      "Lessons from rebuilding our iOS and Android apps on one codebase with resilient offline sync.",
    author: team[7].name,
    authorAvatar: team[7].avatar,
    category: "Engineering",
    status: "Draft",
    date: "2026-07-16",
    views: 0,
    comments: 0,
    gradient: gradient(1, 3),
  },
  {
    id: "POST-07",
    title: "Localizing pricing pages for six markets",
    excerpt:
      "Currency, tax, and copy — the surprisingly deep work behind a pricing page that feels native everywhere.",
    author: team[9].name,
    authorAvatar: team[9].avatar,
    category: "Marketing",
    status: "Published",
    date: "2026-06-30",
    views: 3980,
    comments: 12,
    gradient: gradient(2, 4),
  },
  {
    id: "POST-08",
    title: "Tutorial: automate your workflow with our public API",
    excerpt:
      "A step-by-step walkthrough of authentication, webhooks and rate limits to build your first integration.",
    author: team[2].name,
    authorAvatar: team[2].avatar,
    category: "Tutorials",
    status: "Published",
    date: "2026-06-26",
    views: 9240,
    comments: 40,
    gradient: gradient(3, 5),
  },
  {
    id: "POST-09",
    title: "What shipping every day taught our support team",
    excerpt:
      "Fast iteration changes how you do customer success. Here's how our support workflow evolved alongside it.",
    author: team[5].name,
    authorAvatar: team[5].avatar,
    category: "Company",
    status: "Draft",
    date: "2026-07-13",
    views: 0,
    comments: 0,
    gradient: gradient(4, 1),
  },
];

const CATEGORIES = [
  "Product",
  "Engineering",
  "Design",
  "Marketing",
  "Company",
  "Tutorials",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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

export default function BlogPage() {
  const [rows, setRows] = useState<Post[]>(POSTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleting = rows.find((p) => p.id === deleteId) ?? null;

  const stats = useMemo(() => {
    const published = rows.filter((p) => p.status === "Published").length;
    const drafts = rows.filter((p) => p.status === "Draft").length;
    const views = rows.reduce((s, p) => s + p.views, 0);
    const comments = rows.reduce((s, p) => s + p.comments, 0);
    return { published, drafts, views, comments };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      const matchesCategory = category === "all" || p.category === category;
      const matchesStatus = status === "all" || p.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [rows, search, category, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Write, schedule and publish posts for your audience."
      >
        <Button asChild>
          <Link href="/blog/new">
            <IconPlus className="size-4" /> New post
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Published"
          value={stats.published.toLocaleString()}
          icon={IconWorld}
        />
        <StatTile
          label="Drafts"
          value={stats.drafts.toLocaleString()}
          icon={IconClipboardText}
        />
        <StatTile
          label="Total views"
          value={stats.views.toLocaleString()}
          icon={IconEye}
        />
        <StatTile
          label="Comments"
          value={stats.comments.toLocaleString()}
          icon={IconMessages}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <IconFileText className="size-7 opacity-50" />
            <p>No posts match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden pt-0">
              <div
                className="relative flex h-40 items-center justify-center"
                style={{ background: p.gradient }}
              >
                <span className="select-none text-6xl font-bold text-white/25">
                  {p.title.slice(0, 1)}
                </span>
                <Badge
                  variant="secondary"
                  className={`absolute right-3 top-3 ${statusStyles[p.status]}`}
                >
                  {p.status}
                </Badge>
                <Badge
                  variant="secondary"
                  className="absolute bottom-3 left-3 bg-black/30 font-normal text-white backdrop-blur-sm"
                >
                  {p.category}
                </Badge>
              </div>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href="/blog/new"
                    className="line-clamp-2 font-semibold leading-snug tracking-tight hover:underline"
                  >
                    {p.title}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mr-2 -mt-1 size-8 shrink-0"
                      >
                        <IconDotsVertical className="size-4" />
                        <span className="sr-only">Post actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href="/blog/new">
                          <IconPencil className="size-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          toast.success("Link copied", {
                            description: "Post URL copied to clipboard.",
                          })
                        }
                      >
                        <IconEye className="size-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteId(p.id)}
                      >
                        <IconTrash className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {p.excerpt}
                </p>
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={p.authorAvatar} alt={p.author} />
                    <AvatarFallback>{p.author.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{p.author}</p>
                    <p className="truncate text-xs text-muted-foreground tabular-nums">
                      {formatDate(p.date)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground tabular-nums">
                  <span className="flex items-center gap-1">
                    <IconEye className="size-3.5" />
                    {p.views > 0 ? p.views.toLocaleString() : "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconMessage2 className="size-3.5" />
                    {p.comments}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        name={deleting?.title ?? "post"}
        onConfirm={() => {
          setRows((prev) => prev.filter((p) => p.id !== deleteId));
        }}
      />
    </div>
  );
}
