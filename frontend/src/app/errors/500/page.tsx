import type { Metadata } from "next";
import { IconAlertTriangle, IconReload } from "@tabler/icons-react";

import { ErrorState } from "@/components/error-state";

export const metadata: Metadata = {
  title: "Something went wrong",
  description: "An unexpected error occurred on our end.",
};

export default function ServerErrorPage() {
  return (
    <ErrorState
      code="500"
      title="Something went wrong on our end"
      description="An unexpected error occurred while processing your request. Our team has been notified — please try again in a few moments."
      icon={IconAlertTriangle}
      secondaryHref="/errors/500"
      secondaryLabel="Try again"
      secondaryIcon={IconReload}
    />
  );
}
