"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconSend,
  IconPaperclip,
  IconMoodSmile,
  IconCircleCheck,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReplyBox({
  ticketId,
  agentName,
  agentAvatar,
}: {
  ticketId: string;
  agentName: string;
  agentAvatar: string;
}) {
  const [value, setValue] = useState("");

  function send() {
    if (!value.trim()) {
      toast.error("Your reply is empty", {
        description: "Write a message before sending.",
      });
      return;
    }
    toast.success("Reply sent", {
      description: `Your message on ${ticketId} was delivered to the customer.`,
    });
    setValue("");
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2.5 border-b px-4 py-3">
        <Avatar className="size-7">
          <AvatarImage src={agentAvatar} alt={agentName} />
          <AvatarFallback>{agentName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium">Reply as {agentName}</p>
      </div>
      <div className="p-4">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write a reply to the customer…"
          rows={4}
          className="resize-none border-0 p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() => toast("Attach a file", { description: "Drag a file here or browse." })}
          >
            <IconPaperclip className="size-4" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() => toast("Insert emoji")}
          >
            <IconMoodSmile className="size-4" />
            <span className="sr-only">Insert emoji</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast.success("Ticket resolved", {
                description: `${ticketId} was marked as resolved.`,
              })
            }
          >
            <IconCircleCheck className="size-4" /> Resolve
          </Button>
          <Button type="button" onClick={send}>
            <IconSend className="size-4" /> Send reply
          </Button>
        </div>
      </div>
    </div>
  );
}
