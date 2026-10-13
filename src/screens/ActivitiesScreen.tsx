import { EmptyState, RouteGlyph } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";

// Skeleton for Milestone 2. Saved runs and the run list arrive with local
// persistence (ROADMAP Milestones 5–6).
export function ActivitiesScreen() {
  return (
    <Screen title="Activities" subtitle="Your run history">
      <EmptyState
        decoration={<RouteGlyph />}
        title="No runs yet"
        body="Saved runs will appear here. Saving runs arrives in a later update."
      />
    </Screen>
  );
}
