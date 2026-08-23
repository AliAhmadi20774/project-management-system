"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconStar,
  IconStarFilled,
  IconSearch,
  IconDotsVertical,
  IconCircleCheck,
  IconMessageReply,
  IconFlag,
  IconTrash,
  IconSend,
  IconMessage2,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { customers } from "@/data";

type ReviewStatus = "Published" | "Pending" | "Flagged";

type Review = {
  id: string;
  author: string;
  avatar: string;
  product: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  status: ReviewStatus;
  reply?: string;
};

const reviewSeeds: Omit<Review, "id" | "author" | "avatar">[] = [
  {
    product: "Aurora Headphones",
    rating: 5,
    title: "Best travel companion I've owned",
    body: "The noise cancellation is genuinely impressive — I wore these on a six-hour flight and barely touched the volume. Battery easily lasts me the whole week between charges.",
    date: "2026-07-14",
    status: "Published",
    reply:
      "So glad they made your flight better! Thanks for the kind words — safe travels.",
  },
  {
    product: "Nimbus Keyboard",
    rating: 4,
    title: "Fantastic typing feel",
    body: "The switches are satisfyingly tactile and it looks great on my desk. Docked a star only because the software for remapping keys is a little clunky on macOS.",
    date: "2026-07-13",
    status: "Published",
  },
  {
    product: "Pulse Watch",
    rating: 5,
    title: "Sleep tracking is spot on",
    body: "Surprisingly accurate sleep and heart-rate data, and the battery comfortably gets me through three full days. The band is comfy enough that I forget I'm wearing it.",
    date: "2026-07-12",
    status: "Published",
  },
  {
    product: "Vega Monitor",
    rating: 2,
    title: "Needed calibration out of the box",
    body: "Color accuracy was noticeably off and I spent an evening dialing it in. Once calibrated it's sharp, but I expected better at this price point.",
    date: "2026-07-11",
    status: "Pending",
  },
  {
    product: "Orbit Mouse",
    rating: 5,
    title: "My wrist finally stopped aching",
    body: "Perfect ergonomics for long editing sessions and the scroll wheel is buttery smooth. Setup was instant on both my laptops.",
    date: "2026-07-10",
    status: "Published",
  },
  {
    product: "Lumina Lamp",
    rating: 3,
    title: "Lovely light, twitchy controls",
    body: "The warm light and smooth dimmer are great, but the touch base is a bit too sensitive — it switches on if you so much as brush past it.",
    date: "2026-07-09",
    status: "Published",
  },
  {
    product: "Echo Speaker",
    rating: 4,
    title: "Big sound for its size",
    body: "Room-filling audio and pairing was instant. Bass could be a touch tighter, but for the price I'm very happy with it.",
    date: "2026-07-08",
    status: "Published",
  },
  {
    product: "Zephyr Drone",
    rating: 1,
    title: "Connection kept dropping",
    body: "Lost the signal twice in the first week and the return-to-home failed once over water. Support was slow to reply. Can't recommend it in its current state.",
    date: "2026-07-07",
    status: "Flagged",
  },
  {
    product: "Cobalt Charger",
    rating: 5,
    title: "Charges everything at once",
    body: "Powers my phone and laptop simultaneously without breaking a sweat, and it's compact enough to live in my bag permanently. Exactly what I wanted.",
    date: "2026-07-06",
    status: "Published",
  },
  {
    product: "Terra Backpack",
    rating: 4,
    title: "Thoughtfully designed",
    body: "Well built with smart compartments and a properly padded laptop sleeve. My only wish is that the water-bottle pocket was a touch deeper.",
    date: "2026-07-05",
    status: "Pending",
  },
  {
    product: "Aurora Headphones",
    rating: 4,
    title: "Warm, detailed sound",
    body: "A great daily driver — audio is warm and detailed. The ear cushions get a little warm after a couple of hours, but nothing dealbreaking.",
    date: "2026-07-04",
    status: "Published",
  },
  {
    product: "Pulse Watch",
    rating: 3,
    title: "Good, improving with updates",
    body: "Strong fitness features, though notifications are occasionally delayed. Firmware updates have steadily made it better, so I'm optimistic.",
    date: "2026-07-03",
    status: "Published",
  },
];

const initialReviews: Review[] = reviewSeeds.map((seed, i) => {
  const author = customers[(i * 4 + 3) % customers.length];
  return {
    ...seed,
    id: `REV-${5000 + i}`,
    author: author.name,
    avatar: author.avatar,
  };
});

const statusStyles: Record<ReviewStatus, string> = {
  Published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Flagged: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const TABS = ["All", "Published", "Pending", "Flagged"] as const;
type TabValue = (typeof TABS)[number];

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= rating ? (
          <IconStarFilled
            key={i}
            className={cn("size-3.5 text-amber-500", className)}
          />
        ) : (
          <IconStar
            key={i}
            className={cn("size-3.5 text-muted-foreground/40", className)}
          />
        )
      )}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[]>(initialReviews);
  const [tab, setTab] = useState<TabValue>("All");
  const [search, setSearch] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleting = rows.find((r) => r.id === deleteId) ?? null;

  const summary = useMemo(() => {
    const total = rows.length;
    const published = rows.filter((r) => r.status === "Published").length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    const flagged = rows.filter((r) => r.status === "Flagged").length;
    const sum = rows.reduce((s, r) => s + r.rating, 0);
    const avg = total ? sum / total : 0;
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of rows) counts[r.rating] = (counts[r.rating] ?? 0) + 1;
    return { total, published, pending, flagged, avg, counts };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesTab = tab === "All" || r.status === tab;
      const matchesSearch =
        !q ||
        r.author.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [rows, tab, search]);

  function approve(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Published" } : r))
    );
    toast.success("Review published", { description: "It's now visible on the storefront." });
  }

  function flag(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Flagged" } : r))
    );
    toast("Review flagged", { description: "Hidden pending moderation." });
  }

  function openReply(review: Review) {
    setReplyingId(review.id);
    setReplyText(review.reply ?? "");
  }

  function sendReply(id: string) {
    const text = replyText.trim();
    if (!text) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, reply: text } : r)));
    setReplyingId(null);
    setReplyText("");
    toast.success("Reply posted", { description: "Your response is now public." });
  }

  const tiles = [
    { label: "Total", value: summary.total },
    { label: "Published", value: summary.published },
    { label: "Pending", value: summary.pending },
    { label: "Flagged", value: summary.flagged },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Moderate customer feedback and respond to shoppers."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t.label}
              </p>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {t.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rating summary */}
        <Card className="lg:col-span-1 lg:self-start">
          <CardHeader>
            <CardTitle className="text-base">Rating summary</CardTitle>
            <CardDescription>Across all products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-5xl font-semibold tracking-tight tabular-nums">
                {summary.avg.toFixed(1)}
              </span>
              <Stars rating={Math.round(summary.avg)} className="size-5" />
              <p className="text-sm text-muted-foreground">
                Based on {summary.total} review{summary.total === 1 ? "" : "s"}
              </p>
            </div>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.counts[star] ?? 0;
                const pct = summary.total ? (count / summary.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="flex w-8 items-center gap-1 tabular-nums text-muted-foreground">
                      {star}
                      <IconStarFilled className="size-3 text-amber-500" />
                    </span>
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="w-6 text-right tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reviews list */}
        <Card className="lg:col-span-2">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
                <TabsList>
                  {TABS.map((t) => (
                    <TabsTrigger key={t} value={t}>
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:max-w-56">
                <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reviews…"
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            {filtered.map((r) => (
              <div key={r.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={r.avatar} alt={r.author} />
                    <AvatarFallback>{r.author.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium">{r.author}</span>
                      <span className="text-xs text-muted-foreground">
                        on {r.product}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn("ml-auto", statusStyles[r.status])}
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(r.date)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-sm text-muted-foreground">{r.body}</p>

                    {r.reply && replyingId !== r.id && (
                      <div className="mt-3 rounded-lg border bg-muted/40 p-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                          <IconMessage2 className="size-3.5" /> Store response
                        </p>
                        <p className="text-sm text-muted-foreground">{r.reply}</p>
                      </div>
                    )}

                    {replyingId === r.id && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${r.author}…`}
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => sendReply(r.id)}>
                            <IconSend className="size-4" /> Post reply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {r.status !== "Published" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approve(r.id)}
                        >
                          <IconCircleCheck className="size-4" /> Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReply(r)}
                      >
                        <IconMessageReply className="size-4" />
                        {r.reply ? "Edit reply" : "Reply"}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <IconDotsVertical className="size-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={r.status === "Published"}
                            onSelect={() => approve(r.id)}
                          >
                            <IconCircleCheck className="size-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={r.status === "Flagged"}
                            onSelect={() => flag(r.id)}
                          >
                            <IconFlag className="size-4" /> Flag
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteId(r.id)}
                          >
                            <IconTrash className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-14 text-center text-muted-foreground">
                <IconMessage2 className="mx-auto mb-2 size-6 opacity-50" />
                No reviews match your filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        name={deleting ? `${deleting.author}'s review` : "review"}
        onConfirm={() => setRows((prev) => prev.filter((r) => r.id !== deleteId))}
      />
    </div>
  );
}
