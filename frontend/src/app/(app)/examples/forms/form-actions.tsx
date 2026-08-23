"use client";

import { toast } from "sonner";
import { IconDeviceFloppy, IconFilter, IconRefresh } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

export function SaveFooter({ saveLabel = "Save changes" }: { saveLabel?: string }) {
  return (
    <CardFooter className="justify-end gap-2">
      <Button variant="outline" onClick={() => toast("Changes discarded")}>
        Cancel
      </Button>
      <Button
        onClick={() =>
          toast.success("Saved", {
            description: "Your changes have been saved.",
          })
        }
      >
        <IconDeviceFloppy className="size-4" /> {saveLabel}
      </Button>
    </CardFooter>
  );
}

export function FilterActions() {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() =>
          toast.success("Filters applied", {
            description: "The list has been updated.",
          })
        }
      >
        <IconFilter className="size-4" /> Apply
      </Button>
      <Button variant="ghost" onClick={() => toast("Filters reset")}>
        <IconRefresh className="size-4" /> Reset
      </Button>
    </div>
  );
}
