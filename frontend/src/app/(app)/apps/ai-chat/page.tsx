"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  IconSparkles,
  IconPaperclip,
  IconArrowUp,
  IconCopy,
  IconThumbUp,
  IconThumbDown,
  IconRefresh,
  IconPlus,
  IconMenu2,
  IconMessage,
  IconChevronDown,
  IconCheck,
  IconBulb,
  IconCode,
  IconChartBar,
  IconPencil,
  IconShare3,
  IconWorld,
  IconPhoto,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data";

// ---------------------------------------------------------------------------
// Static, deterministic content (no Math.random at render)
// ---------------------------------------------------------------------------

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

const firstName = currentUser.name.split(" ")[0];

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", tag: "OpenAI", hint: "Fast, great all-rounder" },
  { id: "claude-3.5", name: "Claude 3.5 Sonnet", tag: "Anthropic", hint: "Best for writing & code" },
  { id: "gemini", name: "Gemini 1.5 Pro", tag: "Google", hint: "Huge context window" },
] as const;

const SUGGESTIONS = [
  {
    icon: IconBulb,
    title: "Brainstorm ideas",
    prompt: "Give me 5 fresh growth ideas for a B2B SaaS onboarding flow.",
  },
  {
    icon: IconCode,
    title: "Write some code",
    prompt: "Write a typed useDebounce hook in React with proper cleanup on unmount.",
  },
  {
    icon: IconChartBar,
    title: "Analyze the numbers",
    prompt: "Summarize the key trends in our Q3 revenue and flag anything worth watching.",
  },
  {
    icon: IconPencil,
    title: "Draft an email",
    prompt: "Draft a warm, low-pressure follow-up email to a customer whose trial just expired.",
  },
] as const;

const HISTORY: { label: string; items: string[] }[] = [
  {
    label: "Today",
    items: [
      "Refactor auth middleware",
      "Q3 marketing copy directions",
      "Explain vector databases simply",
    ],
  },
  {
    label: "Yesterday",
    items: [
      "SQL query optimization pass",
      "Onboarding email sequence",
      "React state management patterns",
    ],
  },
  {
    label: "Previous 7 days",
    items: [
      "Trip itinerary — Kyoto in spring",
      "Docker Compose for local dev",
      "Feedback on my résumé draft",
    ],
  },
];

// Canned, believable multi-paragraph replies. Cycled deterministically.
const REPLIES: string[] = [
  `Great question — here's how I'd approach it.

It helps to break this into a few clear stages so nothing slips through the cracks:

1. **Clarify the goal.** Write down the single outcome you actually want before touching anything else.
2. **Map the constraints.** Note what's fixed — deadlines, APIs, data shape — versus what's still flexible.
3. **Sketch the smallest version.** Build the thinnest slice that proves the idea works end to end.

Once you have that foundation, iterate in short loops and measure as you go. A few things I'd keep an eye on:

- Keep each change small enough to reason about in one sitting
- Write assumptions down so you can revisit them later
- Ship early to real users and let their feedback steer the next step

Want me to turn this into a concrete plan for your specific case?`,

  `Absolutely — here's a clean, production-ready version you can drop in.

The key idea is to keep the logic **pure and predictable**: no hidden side effects, and everything is easy to test in isolation. I've also handled the edge cases you'll actually hit in practice — empty inputs, rapid updates, and cleanup on unmount.

A couple of notes on the tradeoffs:

- It favors readability over micro-optimizations, which is the right call for the vast majority of apps.
- If this ends up in a hot path, you can memoize the result so it isn't recomputed on every render.

Tell me which framework you're on and I'll tailor it exactly to your setup.`,

  `Here's the short version first, then the detail.

**In one line:** the trend is healthy and accelerating, but the growth is concentrated in a handful of segments rather than spread evenly.

Breaking it down:

- **Revenue** is up meaningfully quarter over quarter, driven mostly by expansion inside existing accounts.
- **New customer volume** is steady, which suggests your top-of-funnel is stable while monetization is improving.
- **Churn** ticked down slightly — a good sign that recent retention work is starting to pay off.

The one thing I'd watch is concentration risk: if a small number of accounts drive most of the upside, a single churn event could swing the whole quarter. Happy to model that scenario if it's useful.`,

  `Done — here's a draft you can send as-is or tweak.

I kept the tone **warm and low-pressure**, led with value rather than a hard ask, and gave them one clear, easy next step. People respond far better to a specific, small request than to an open-ended one.

If you'd like, I can produce two more variants — a shorter one for busy readers and a slightly more formal one — so you can A/B test which lands best.`,
];

// ---------------------------------------------------------------------------
// Lightweight rich-text renderer (bold + bullet + numbered lists)
// ---------------------------------------------------------------------------

function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

function RichText({ text }: { text: string }) {
  const blocks = text.split("\n\n");
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isBullet = lines.every((l) => l.startsWith("- "));
        const isNumbered = lines.every((l) => /^\d+\.\s/.test(l));

        if (isBullet) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2.5">
                  <span className="mt-[0.5rem] size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  <span>{inline(l.slice(2))}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (isNumbered) {
          return (
            <ol key={i} className="space-y-2">
              {lines.map((l, j) => {
                const m = l.match(/^(\d+)\.\s(.*)$/);
                return (
                  <li key={j} className="flex gap-3">
                    <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                      {m ? m[1] : j + 1}
                    </span>
                    <span>{inline(m ? m[2] : l)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function AiAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] text-white shadow-sm",
        className,
      )}
    >
      <IconSparkles className="size-4" />
    </span>
  );
}

function IconAction({
  label,
  icon: Icon,
  onClick,
  active,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn(
            "size-7 text-muted-foreground hover:text-foreground",
            active && "text-foreground",
          )}
        >
          <Icon className="size-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modelId, setModelId] = useState<(typeof MODELS)[number]["id"]>(
    "gpt-4o",
  );
  // Mobile: the history rail slides in as an overlay.
  const [railOpen, setRailOpen] = useState(false);

  const replyIndex = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const activeModel = MODELS.find((m) => m.id === modelId)!;
  const hasMessages = messages.length > 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  function send(raw: string) {
    const text = raw.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ]);
    setInput("");

    const reply = REPLIES[replyIndex.current % REPLIES.length];
    replyIndex.current += 1;
    setIsTyping(true);

    timerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
      setIsTyping(false);
    }, 1200);
  }

  function regenerate(id: string) {
    if (isTyping) return;
    const reply = REPLIES[replyIndex.current % REPLIES.length];
    replyIndex.current += 1;
    setIsTyping(true);
    timerRef.current = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: reply } : m)),
      );
      setIsTyping(false);
    }, 1000);
  }

  function newChat() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setRailOpen(false);
    replyIndex.current = 0;
    taRef.current?.focus();
  }

  function copy(text: string) {
    navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Couldn't copy"));
  }

  function shareChat() {
    navigator.clipboard
      ?.writeText("https://orbynadmin.com/ai/share/demo")
      .then(() => toast.success("Share link copied to clipboard"))
      .catch(() => toast.error("Couldn't copy"));
  }

  return (
    <div className="h-[calc(100vh-9rem)]">
      <Card className="relative flex h-full flex-row gap-0 overflow-hidden p-0">
        {/* Mobile backdrop for the history rail (fades in/out) */}
        <button
          type="button"
          aria-label="Close history"
          className={cn(
            "absolute inset-0 z-10 bg-black/40 transition-opacity duration-300 md:hidden",
            railOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setRailOpen(false)}
        />
        {/* ---------------------------------------------------------------- */}
        {/* Left rail                                                         */}
        {/* ---------------------------------------------------------------- */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-20 flex w-72 flex-col border-r bg-card shadow-xl transition-transform duration-300 ease-in-out",
            "md:static md:z-auto md:w-64 md:translate-x-0 md:bg-muted/30 md:shadow-none md:transition-none",
            railOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center gap-2 px-4 py-3.5">
            <AiAvatar className="size-8" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight">
                OrbynAdmin AI
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Assistant workspace
              </p>
            </div>
          </div>

          <div className="px-3 pb-2">
            <Button
              onClick={newChat}
              className="w-full gap-2"
              variant="outline"
            >
              <IconPlus className="size-4" /> New chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 px-3 py-2">
              {HISTORY.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-2 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  {group.items.map((title, i) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => {
                        setRailOpen(false);
                        toast(`Opened “${title}”`, {
                          description: "Saved chats aren't persisted in the demo.",
                        });
                      }}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                        group.label === "Today" &&
                          i === 0 &&
                          "bg-muted font-medium",
                      )}
                    >
                      <IconMessage className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Separator />
          <div className="flex items-center gap-2.5 p-3">
            <Avatar className="size-8">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                Free plan
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400"
            >
              Free
            </Badge>
          </div>
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* Center — conversation                                            */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setRailOpen(true)}
              aria-label="Chat history"
            >
              <IconMenu2 className="size-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium tracking-tight">
                {hasMessages ? messages[0].content : "New conversation"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {activeModel.name}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="hidden gap-1 bg-emerald-500/10 text-emerald-600 sm:flex dark:text-emerald-400"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={shareChat}
            >
              <IconShare3 className="size-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          {/* Thread / empty state */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {hasMessages ? (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-3">
                      <AiAvatar className="mt-0.5 size-8 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <RichText text={m.content} />
                        <div className="-ml-1.5 flex items-center gap-0.5">
                          <IconAction
                            label="Copy"
                            icon={IconCopy}
                            onClick={() => copy(m.content)}
                          />
                          <IconAction
                            label="Good response"
                            icon={IconThumbUp}
                            onClick={() => toast.success("Thanks for the feedback")}
                          />
                          <IconAction
                            label="Bad response"
                            icon={IconThumbDown}
                            onClick={() =>
                              toast("Feedback noted", {
                                description: "We'll use it to improve replies.",
                              })
                            }
                          />
                          <IconAction
                            label="Regenerate"
                            icon={IconRefresh}
                            onClick={() => regenerate(m.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}

                {isTyping && (
                  <div className="flex gap-3">
                    <AiAvatar className="mt-0.5 size-8 shrink-0" />
                    <div className="flex items-center gap-1.5 pt-2.5">
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            ) : (
              <div className="m-auto flex w-full max-w-2xl flex-col items-center px-4 py-8 text-center">
                <AiAvatar className="mb-5 size-14 rounded-2xl [&_svg]:size-7" />
                <h1 className="text-3xl font-semibold tracking-tight">
                  How can I help you, {firstName}?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask anything, or start with one of these.
                </p>

                <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => send(s.prompt)}
                      className="group flex flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/20 hover:bg-muted/50"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-background">
                        <s.icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium">{s.title}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {s.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="px-4 pb-4">
            <div className="mx-auto w-full max-w-3xl">
              <div className="rounded-2xl border bg-background shadow-lg shadow-black/5 ring-1 ring-foreground/5 transition-shadow focus-within:ring-2 focus-within:ring-ring/40">
                <Textarea
                  ref={taRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={`Message ${activeModel.name}…`}
                  rows={1}
                  className="max-h-44 min-h-11 resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
                <div className="flex items-center gap-1 px-2.5 pb-2.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        onClick={() =>
                          toast("Attach a file", {
                            description: "File uploads aren't available in the demo.",
                          })
                        }
                      >
                        <IconPaperclip className="size-4" />
                        <span className="sr-only">Attach file</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        onClick={() =>
                          toast("Add an image", {
                            description: "Image uploads aren't available in the demo.",
                          })
                        }
                      >
                        <IconPhoto className="size-4" />
                        <span className="sr-only">Add image</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add image</TooltipContent>
                  </Tooltip>

                  {/* Model selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground"
                      >
                        <IconSparkles className="size-4" />
                        <span className="text-xs font-medium">
                          {activeModel.name}
                        </span>
                        <IconChevronDown className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconWorld className="size-3.5" /> Choose a model
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {MODELS.map((m) => (
                        <DropdownMenuItem
                          key={m.id}
                          onSelect={() => setModelId(m.id)}
                          className="flex items-start gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {m.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px]"
                              >
                                {m.tag}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {m.hint}
                            </p>
                          </div>
                          {m.id === modelId && (
                            <IconCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="ml-auto">
                    <Button
                      size="icon"
                      className="size-8 rounded-lg"
                      disabled={!input.trim() || isTyping}
                      onClick={() => send(input)}
                    >
                      <IconArrowUp className="size-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                OrbynAdmin AI can make mistakes. Check important info before relying on
                it.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
