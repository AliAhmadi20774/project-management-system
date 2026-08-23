"use client";

import { toast } from "sonner";
import { IconDownload, IconPrinter, IconSend } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

export function InvoiceActions({
  number,
  clientEmail,
}: {
  number: string;
  clientEmail: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.success(`Downloading ${number}`, {
            description: "Your PDF will be ready in a moment.",
          })
        }
      >
        <IconDownload className="size-4" /> Download
      </Button>
      <Button variant="outline" onClick={() => window.print()}>
        <IconPrinter className="size-4" /> Print
      </Button>
      <Button
        onClick={() =>
          toast.success(`Invoice ${number} sent`, {
            description: `Emailed to ${clientEmail}.`,
          })
        }
      >
        <IconSend className="size-4" /> Send
      </Button>
    </div>
  );
}
