import type { Metadata } from "next";
import { IconLock, IconLifebuoy } from "@tabler/icons-react";

import { ErrorState } from "@/components/error-state";

export const metadata: Metadata = {
  title: "Access denied",
  description: "You don't have permission to view this page.",
};

export default function ForbiddenPage() {
  return (
    <ErrorState
      code="403"
      title="Access denied"
      description="You don't have permission to view this page. If you believe this is a mistake, ask your workspace administrator to grant you access."
      icon={IconLock}
      secondaryHref="/help"
      secondaryLabel="Contact support"
      secondaryIcon={IconLifebuoy}
    />
  );
}
