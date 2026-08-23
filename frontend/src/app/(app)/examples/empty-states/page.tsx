import { PageHeader } from "@/components/page-header";
import { EmptyStatesGrid } from "./empty-states-grid";

export const metadata = { title: "Empty States" };

export default function EmptyStatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Empty States"
        description="Consistent, on-brand states for zero-data, no-results and error surfaces."
      />

      <EmptyStatesGrid />
    </div>
  );
}
