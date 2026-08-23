"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconSearch,
  IconMail,
  IconMessageCircle,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HelpSearch() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    toast(`Searching for “${q}”`, {
      description: "Showing the most relevant articles.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto max-w-lg">
      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for articles, guides and more..."
        className="h-11 pl-10"
      />
    </form>
  );
}

/**
 * Clickable wrapper that fires a toast. Renders server-provided children
 * (icons, text, cards) so it can replace inert `<Link href="#">` targets.
 */
export function ClickToast({
  message,
  description,
  className,
  children,
}: {
  message: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        toast(message, description ? { description } : undefined)
      }
      className={className}
    >
      {children}
    </button>
  );
}

export function SupportButtons() {
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() =>
          toast.success("Support request created", {
            description: "Our team will reply within 24 hours.",
          })
        }
      >
        <IconMail className="size-4" /> Contact support
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Live chat", {
            description: "Connecting you to an available agent…",
          })
        }
      >
        <IconMessageCircle className="size-4" /> Live chat
      </Button>
    </div>
  );
}
