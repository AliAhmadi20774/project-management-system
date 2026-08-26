"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconCheck,
  IconChecks,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";

import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type User = { id: number; name: string; avatar_url: string | null };
type Message = {
  id: number;
  client_id: string;
  content: string;
  created_at: string;
  sender: User;
  read_by_recipient: boolean;
};
type Conversation = {
  id: number;
  other_user: User;
  last_message: Message | null;
  last_message_at: string | null;
  unread_count: number;
};
type MessagePage = { results: Message[]; next_before: number | null };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function timestamp(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "";
}

export default function ChatPage() {
  const { user } = useAuth();
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const activeIdRef = useRef<number | null>(null);
  const currentUserIdRef = useRef<number | undefined>(undefined);
  const loadedConversationsRef = useRef(false);
  const shouldReconnect = useRef(false);
  const localTypingConversationRef = useRef<number | null>(null);
  const typingStopTimer = useRef<number | null>(null);
  const remoteTypingStopTimer = useRef<number | null>(null);
  const messageLoadVersion = useRef(0);
  const messageScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollMessagesRef = useRef(true);
  const prependScrollRef = useRef<{ height: number; top: number } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextBefore, setNextBefore] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [typing, setTyping] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const active = conversations.find((item) => item.id === activeId) ?? null;
  const filtered = useMemo(
    () =>
      conversations.filter((item) =>
        item.other_user.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [conversations, query],
  );
  const filteredUsers = useMemo(
    () =>
      users.filter((item) =>
        item.name.toLowerCase().includes(userQuery.toLowerCase()),
      ),
    [users, userQuery],
  );
  function messageViewport() {
    return messageScrollContainerRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    ) ?? null;
  }
  function isNearMessageBottom() {
    const viewport = messageViewport();
    return !viewport || viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 120;
  }
  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/chat/conversations", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not load conversations.");
    const items = (await response.json()) as Conversation[];
    setConversations(items);
    setActiveId((current) => {
      if (!loadedConversationsRef.current) {
        loadedConversationsRef.current = true;
        return items[0]?.id ?? null;
      }
      return current && items.some((item) => item.id === current)
        ? current
        : current;
    });
  }, []);
  const loadMessages = useCallback(
    async (conversationId: number, before?: number) => {
      const requestVersion = ++messageLoadVersion.current;
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages${before ? `?before=${before}` : ""}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Could not load messages.");
      const page = (await response.json()) as MessagePage;
      // Do not let an older HTTP response overwrite a message received over
      // WebSocket while that response was in flight.
      if (requestVersion !== messageLoadVersion.current) return;
      const viewport = messageViewport();
      if (before && viewport) {
        prependScrollRef.current = {
          height: viewport.scrollHeight,
          top: viewport.scrollTop,
        };
        shouldScrollMessagesRef.current = false;
      } else {
        shouldScrollMessagesRef.current = isNearMessageBottom();
      }
      setMessages((current) => before ? [...page.results, ...current] : page.results);
      setNextBefore(page.next_before);
    },
    [],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadConversations().catch((error) => toast.error(error.message));
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadConversations]);
  useEffect(() => {
    if (!activeId) return;
    const id = window.setTimeout(() => {
      void loadMessages(activeId).catch((error) => toast.error(error.message));
    }, 0);
    return () => window.clearTimeout(id);
  }, [activeId, loadMessages]);
  useEffect(() => {
    if (!messages.length) return;
    const frame = window.requestAnimationFrame(() => {
      const viewport = messageViewport();
      if (!viewport) return;
      if (prependScrollRef.current) {
        const previous = prependScrollRef.current;
        viewport.scrollTop = previous.top + (viewport.scrollHeight - previous.height);
        prependScrollRef.current = null;
        return;
      }
      if (shouldScrollMessagesRef.current) viewport.scrollTop = viewport.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, activeId]);
  // Safety net for an interrupted websocket: persisted messages are reconciled
  // quickly, so a transient connection issue cannot hide a sent message.
  useEffect(() => {
    if (!activeId) return;
    const id = window.setInterval(() => {
      void loadMessages(activeId).catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(id);
  }, [activeId, loadMessages]);
  useEffect(() => {
    const id = window.setInterval(() => {
      void loadConversations().catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(id);
  }, [loadConversations]);

  const connect = useCallback(async () => {
    try {
      const ticketResponse = await fetch("/api/chat/ticket", {
        method: "POST",
      });
      if (!ticketResponse.ok) throw new Error("Could not start realtime chat.");
      const { ticket } = (await ticketResponse.json()) as { ticket: string };
      const fallback = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8000/ws/chat/`;
      const endpoint = process.env.NEXT_PUBLIC_CHAT_WS_URL || fallback;
      const ws = new WebSocket(
        `${endpoint}?ticket=${encodeURIComponent(ticket)}`,
      );
      socket.current = ws;
      ws.onopen = () => {
        if (activeIdRef.current)
          ws.send(
            JSON.stringify({
              type: "subscribe",
              conversation_id: activeIdRef.current,
            }),
          );
      };
      ws.onclose = () => {
        if (shouldReconnect.current)
          reconnectTimer.current = window.setTimeout(
            () => setConnectionAttempt((value) => value + 1),
            5000,
          );
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as {
          type: string;
          conversation_id?: number;
          message?: Message;
          user_id?: number;
          is_typing?: boolean;
          online?: boolean;
          online_user_ids?: number[];
          read_at?: string;
        };
        if (
          data.type === "message.created" &&
          data.message &&
          data.conversation_id
        ) {
          setConversations((items) =>
            items
              .map((item) =>
                item.id === data.conversation_id
                  ? {
                      ...item,
                      last_message: data.message!,
                      last_message_at: data.message!.created_at,
                      unread_count:
                        data.message!.sender.id === currentUserIdRef.current
                          ? item.unread_count
                          : item.unread_count + 1,
                    }
                  : item,
              )
              .sort((a, b) =>
                (b.last_message_at ?? "").localeCompare(
                  a.last_message_at ?? "",
                ),
              ),
          );
          if (data.conversation_id === activeIdRef.current) {
            shouldScrollMessagesRef.current = isNearMessageBottom();
            messageLoadVersion.current += 1;
            setTyping(false);
            setMessages((items) =>
              items.some((message) => message.id === data.message!.id)
                ? items
                : [...items, data.message!],
            );
            if (
              data.message.sender.id !== currentUserIdRef.current &&
              socket.current?.readyState === WebSocket.OPEN
            ) {
              socket.current.send(
                JSON.stringify({
                  type: "read",
                  conversation_id: data.conversation_id,
                }),
              );
            }
          }
        }
        if (
          data.type === "conversation.read" &&
          data.conversation_id === activeIdRef.current &&
          data.user_id !== currentUserIdRef.current &&
          data.read_at
        ) {
          const readAt = new Date(data.read_at).getTime();
          setMessages((items) =>
            items.map((message) =>
              message.sender.id === currentUserIdRef.current &&
              new Date(message.created_at).getTime() <= readAt
                ? { ...message, read_by_recipient: true }
                : message,
            ),
          );
        }
        if (
          data.type === "typing" &&
          data.conversation_id === activeIdRef.current &&
          data.user_id !== currentUserIdRef.current
        ) {
          setTyping(Boolean(data.is_typing));
          if (remoteTypingStopTimer.current)
            window.clearTimeout(remoteTypingStopTimer.current);
          if (data.is_typing)
            remoteTypingStopTimer.current = window.setTimeout(
              () => setTyping(false),
              1800,
            );
        }
        if (data.type === "presence.snapshot")
          setOnlineUserIds(data.online_user_ids ?? []);
        if (data.type === "presence.changed" && data.user_id)
          setOnlineUserIds((ids) =>
            data.online
              ? [...new Set([...ids, data.user_id!])]
              : ids.filter((id) => id !== data.user_id),
          );
        if (data.type === "conversation.changed") {
          void loadConversations().catch(() => undefined);
          if (data.conversation_id === activeIdRef.current) {
            void loadMessages(data.conversation_id).catch(() => undefined);
          }
        }
      };
    } catch {
      if (shouldReconnect.current)
        reconnectTimer.current = window.setTimeout(
          () => setConnectionAttempt((value) => value + 1),
          5000,
        );
    }
  }, [loadConversations, loadMessages]);
  useEffect(() => {
    currentUserIdRef.current = user?.id;
  }, [user?.id]);
  useEffect(() => {
    activeIdRef.current = activeId;
    if (activeId && socket.current?.readyState === WebSocket.OPEN)
      socket.current.send(
        JSON.stringify({ type: "subscribe", conversation_id: activeId }),
      );
  }, [activeId]);
  useEffect(() => {
    shouldReconnect.current = true;
    const id = window.setTimeout(() => {
      void connect();
    }, 0);
    return () => {
      shouldReconnect.current = false;
      window.clearTimeout(id);
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      socket.current?.close();
    };
  }, [connect, connectionAttempt]);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (socket.current?.readyState === WebSocket.OPEN)
        socket.current.send(JSON.stringify({ type: "heartbeat" }));
    }, 25000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(
    () => () => {
      if (typingStopTimer.current) window.clearTimeout(typingStopTimer.current);
      if (remoteTypingStopTimer.current)
        window.clearTimeout(remoteTypingStopTimer.current);
    },
    [],
  );

  function sendTypingEvent(conversationId: number, isTyping: boolean) {
    if (socket.current?.readyState !== WebSocket.OPEN) return;
    socket.current.send(
      JSON.stringify({
        type: "typing",
        conversation_id: conversationId,
        is_typing: isTyping,
      }),
    );
  }
  function stopLocalTyping(conversationId?: number) {
    const currentId = conversationId ?? localTypingConversationRef.current;
    if (typingStopTimer.current) window.clearTimeout(typingStopTimer.current);
    typingStopTimer.current = null;
    if (currentId && localTypingConversationRef.current === currentId) {
      sendTypingEvent(currentId, false);
      localTypingConversationRef.current = null;
    }
  }
  function scheduleLocalTyping(conversationId: number) {
    if (localTypingConversationRef.current !== conversationId) {
      stopLocalTyping();
      sendTypingEvent(conversationId, true);
      localTypingConversationRef.current = conversationId;
    }
    if (typingStopTimer.current) window.clearTimeout(typingStopTimer.current);
    typingStopTimer.current = window.setTimeout(
      () => stopLocalTyping(conversationId),
      900,
    );
  }

  async function selectConversation(id: number) {
    stopLocalTyping();
    setActiveId(id);
    setMobileThreadOpen(true);
    setTyping(false);
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({ type: "read", conversation_id: id }),
      );
    }
    setConversations((items) =>
      items.map((item) =>
        item.id === id ? { ...item, unread_count: 0 } : item,
      ),
    );
  }
  async function send() {
    const content = draft.trim();
    if (!content || !activeId) return;
    const client_id = crypto.randomUUID();
    stopLocalTyping(activeId);
    setDraft("");
    const payload = {
      type: "send_message",
      conversation_id: activeId,
      content,
      client_id,
    };
    if (socket.current?.readyState === WebSocket.OPEN)
      socket.current.send(JSON.stringify(payload));
    else {
      const response = await fetch(
        `/api/chat/conversations/${activeId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, client_id }),
        },
      );
      if (!response.ok) toast.error("Message was not sent.");
    }
  }
  async function openNewChat() {
    setNewOpen(true);
    setUserQuery("");
    if (users.length) return;
    const response = await fetch("/api/chat/users", { cache: "no-store" });
    if (response.ok) setUsers(await response.json());
    else toast.error("Could not load users.");
  }
  async function startChat(userId: number) {
    const response = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) return toast.error("Could not create conversation.");
    const conversation = (await response.json()) as Conversation;
    setNewOpen(false);
    setConversations((items) =>
      items.some((item) => item.id === conversation.id)
        ? items
        : [conversation, ...items],
    );
    await selectConversation(conversation.id);
  }
  async function deleteConversation() {
    if (!active) return;
    const response = await fetch(`/api/chat/conversations/${active.id}`, {
      method: "DELETE",
    });
    if (!response.ok) return toast.error("Could not delete conversation.");
    setDeleteOpen(false);
    setMessages([]);
    setNextBefore(null);
    setActiveId(null);
    await loadConversations();
    toast.success("Conversation deleted.");
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-0 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Private conversations with your team in real time.
        </p>
      </div>
      <Card className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden p-0 md:grid-cols-[320px_1fr]">
        <div
          className={cn(
            "min-h-0 flex-col border-r md:flex",
            mobileThreadOpen ? "hidden" : "flex",
          )}
        >
          <div className="flex gap-2 p-4">
            <div className="relative min-w-0 flex-1">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                className="pl-9"
              />
            </div>
            <Button
              size="icon"
              onClick={() => void openNewChat()}
              aria-label="New conversation"
            >
              <IconPlus className="size-4" />
            </Button>
          </div>
          <Separator />
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-2">
              {filtered.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => void selectConversation(conversation.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted/60",
                    activeId === conversation.id && "bg-muted",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10">
                      <AvatarImage
                        src={conversation.other_user.avatar_url ?? undefined}
                      />
                      <AvatarFallback>
                        {initials(conversation.other_user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUserIds.includes(conversation.other_user.id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500"
                        aria-label="Online"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {conversation.other_user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timestamp(conversation.last_message_at)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {conversation.last_message?.content ??
                          "No messages yet"}
                      </span>
                      {conversation.unread_count > 0 && (
                        <Badge className="size-5 justify-center rounded-full p-0 text-[10px]">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {!filtered.length && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No conversations yet.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
        <div
          className={cn(
            "min-h-0 min-w-0 flex-col md:flex",
            mobileThreadOpen ? "flex" : "hidden",
          )}
        >
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileThreadOpen(false)}
                >
                  <IconArrowLeft className="size-4" />
                </Button>
                <div className="relative shrink-0">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={active.other_user.avatar_url ?? undefined}
                    />
                    <AvatarFallback>
                      {initials(active.other_user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUserIds.includes(active.other_user.id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500"
                      aria-label="Online"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {active.other_user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {typing
                      ? "Typing…"
                      : onlineUserIds.includes(active.other_user.id)
                        ? "Online"
                        : "Private conversation"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteOpen(true)}
                  aria-label="Delete conversation"
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
              <div ref={messageScrollContainerRef} className="min-h-0 flex-1 bg-muted/20">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-3 p-4">
                  {nextBefore && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void loadMessages(active.id, nextBefore)}
                    >
                      Load older messages
                    </Button>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender.id === user?.id
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                          message.sender.id === user?.id
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <div
                          className={cn(
                            "mt-1 flex items-center justify-end gap-1 text-[10px]",
                            message.sender.id === user?.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          <span>{timestamp(message.created_at)}</span>
                          {message.sender.id === user?.id &&
                            (message.read_by_recipient ? (
                              <IconChecks
                                className="size-3"
                                aria-label="Read"
                              />
                            ) : (
                              <IconCheck className="size-3" aria-label="Sent" />
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              </div>
              <div className="shrink-0 border-t bg-card p-3">
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      if (event.target.value.trim())
                        scheduleLocalTyping(active.id);
                      else stopLocalTyping(active.id);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.nativeEvent.isComposing
                      )
                        void send();
                    }}
                    placeholder="Type a message…"
                  />
                  <Button
                    size="icon"
                    onClick={() => void send()}
                    disabled={!draft.trim()}
                  >
                    <IconSend className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <IconMessageCircle className="size-8" />
              <p>Choose a conversation or start a new one.</p>
              <Button onClick={() => void openNewChat()}>
                <IconPlus className="size-4" /> New conversation
              </Button>
            </div>
          )}
        </div>
      </Card>
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New conversation</DialogTitle>
            <DialogDescription>
              Choose a team member to start a private chat.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Search team members"
              className="pl-9"
            />
          </div>
          <ScrollArea className="max-h-80">
            <div className="space-y-1">
              {filteredUsers.map((item) => (
                <button
                  key={item.id}
                  onClick={() => void startChat(item.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={item.avatar_url ?? undefined} />
                    <AvatarFallback>{initials(item.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
              {!filteredUsers.length && (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No users found.
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes this conversation and all of its messages
              for both participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteConversation()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
