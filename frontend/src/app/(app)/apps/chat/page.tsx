"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconSearch,
  IconSend,
  IconPhone,
  IconVideo,
  IconDotsVertical,
  IconPaperclip,
  IconMoodSmile,
  IconUser,
  IconBellOff,
  IconEraser,
  IconBan,
} from "@tabler/icons-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { customers } from "@/data";

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

const snippets = [
  "Sounds great, let's ship it 🚀",
  "Can you review the latest mockups?",
  "The invoice has been sent over.",
  "Perfect, talk tomorrow!",
  "I pushed the fix to staging.",
  "Thanks for the quick turnaround.",
  "Let me check and get back to you.",
  "Meeting moved to 3pm — works?",
  "Loving the new dashboard design.",
  "Could we hop on a quick call?",
];

const times = ["9:41", "10:12", "11:03", "12:30", "1:15", "2:48", "3:22", "4:07", "Yesterday", "Mon"];

const conversations = customers.slice(0, 10).map((c, i) => ({
  id: c.id,
  name: c.name,
  avatar: c.avatar,
  snippet: snippets[i],
  time: times[i],
  unread: i === 1 ? 3 : i === 4 ? 1 : i === 6 ? 2 : 0,
  online: i % 3 === 0,
}));

const seedThreads: Record<string, Message[]> = {};
conversations.forEach((c, i) => {
  seedThreads[c.id] = [
    { id: `${c.id}-1`, from: "them", text: "Hey! Do you have a minute to chat?", time: "9:12" },
    { id: `${c.id}-2`, from: "me", text: "Sure, what's up?", time: "9:14" },
    {
      id: `${c.id}-3`,
      from: "them",
      text: "I was reviewing the Q3 numbers and wanted your take on the projections.",
      time: "9:15",
    },
    { id: `${c.id}-4`, from: "me", text: "Happy to help. Send them my way and I'll take a look this afternoon.", time: "9:16" },
    { id: `${c.id}-5`, from: "them", text: snippets[i], time: "9:18" },
  ];
});

export default function ChatPage() {
  // First conversation is open on load, so it starts read.
  const [convos, setConvos] = useState(() =>
    conversations.map((c, i) => (i === 0 ? { ...c, unread: 0 } : c))
  );
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [threads, setThreads] = useState<Record<string, Message[]>>(seedThreads);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  // Mobile master-detail: show the list first, the thread after tapping one.
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const active = convos.find((c) => c.id === activeId)!;
  const messages = threads[activeId] ?? [];

  const filtered = convos.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Opening a conversation marks it read (clears its unread badge).
  function openConversation(id: string) {
    setActiveId(id);
    setMobileThreadOpen(true);
    setConvos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    setThreads((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        { id: `${activeId}-${Date.now()}`, from: "me", text, time: "now" },
      ],
    }));
    setDraft("");
  }

  function clearChat() {
    setThreads((prev) => ({ ...prev, [activeId]: [] }));
    toast.success("Conversation cleared");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Chat with your customers and teammates in real time.
        </p>
      </div>

      <Card className="grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden p-0 md:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <div
          className={cn(
            "flex-col border-r md:flex",
            mobileThreadOpen ? "hidden" : "flex"
          )}
        >
          <div className="p-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="pl-9"
              />
            </div>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                    c.id === activeId && "bg-muted",
                  )}
                >
                  <div className="relative">
                    <Avatar className="size-10">
                      <AvatarImage src={c.avatar} alt={c.name} />
                      <AvatarFallback>{c.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">{c.snippet}</span>
                      {c.unread > 0 && (
                        <Badge className="size-5 shrink-0 justify-center rounded-full p-0 text-[10px] tabular-nums">
                          {c.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Active conversation */}
        <div
          className={cn(
            "min-w-0 flex-col md:flex",
            mobileThreadOpen ? "flex" : "hidden"
          )}
        >
          <div className="flex items-center gap-3 border-b p-4">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-1 shrink-0 md:hidden"
              onClick={() => setMobileThreadOpen(false)}
              aria-label="Back to conversations"
            >
              <IconArrowLeft className="size-5" />
            </Button>
            <div className="relative">
              <Avatar className="size-9">
                <AvatarImage src={active.avatar} alt={active.name} />
                <AvatarFallback>{active.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {active.online && (
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{active.name}</p>
              <p className="text-xs text-muted-foreground">
                {active.online ? "Online" : "Last seen recently"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast(`Calling ${active.name}…`, { description: "Voice calls aren't available in the demo." })}
              aria-label="Voice call"
            >
              <IconPhone className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast(`Starting video call with ${active.name}…`, { description: "Video calls aren't available in the demo." })}
              aria-label="Video call"
            >
              <IconVideo className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Conversation actions">
                  <IconDotsVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toast(`${active.name}'s profile`)}>
                  <IconUser className="size-4" /> View profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Notifications muted")}>
                  <IconBellOff className="size-4" /> Mute notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearChat}>
                  <IconEraser className="size-4" /> Clear messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => toast.success(`${active.name} blocked`)}
                >
                  <IconBan className="size-4" /> Block user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ScrollArea className="flex-1 bg-muted/20">
            <div className="flex flex-col gap-3 p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex items-end gap-2", m.from === "me" && "flex-row-reverse")}
                >
                  {m.from === "them" && (
                    <Avatar className="size-7">
                      <AvatarImage src={active.avatar} alt={active.name} />
                      <AvatarFallback>{active.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      m.from === "me"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted",
                    )}
                  >
                    <p>{m.text}</p>
                    <p
                      className={cn(
                        "mt-1 text-right text-[10px]",
                        m.from === "me"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 border-t p-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => toast("Attach a file", { description: "File sharing isn't available in the demo." })}
              aria-label="Attach file"
            >
              <IconPaperclip className="size-4" />
            </Button>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
              }}
              placeholder="Type a message…"
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setDraft((d) => d + " 🙂")}
              aria-label="Add emoji"
            >
              <IconMoodSmile className="size-4" />
            </Button>
            <Button size="icon" className="shrink-0" onClick={send}>
              <IconSend className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
