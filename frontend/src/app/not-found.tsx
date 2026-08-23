import { IconMapPinQuestion, IconLifebuoy } from "@tabler/icons-react";

import { ErrorState } from "@/components/error-state";

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved. Check the address, or head back to your dashboard to keep going."
      icon={IconMapPinQuestion}
      secondaryHref="/help"
      secondaryLabel="Contact support"
      secondaryIcon={IconLifebuoy}
    />
  );
}
