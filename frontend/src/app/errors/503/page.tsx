import type { Metadata } from "next";
import { IconServerBolt, IconActivityHeartbeat } from "@tabler/icons-react";

import { ErrorState } from "@/components/error-state";

export const metadata: Metadata = {
  title: "Service unavailable",
  description: "The service is temporarily unavailable.",
};

export default function ServiceUnavailablePage() {
  return (
    <ErrorState
      code="503"
      title="Service temporarily unavailable"
      description="We're carrying out some maintenance or handling heavy load right now. The service will be back shortly — please check back in a few minutes."
      icon={IconServerBolt}
      secondaryHref="/maintenance"
      secondaryLabel="Status page"
      secondaryIcon={IconActivityHeartbeat}
    />
  );
}
