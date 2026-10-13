import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";

// Skeleton for Milestone 2. No accounts or settings exist yet; a minimal
// profile follows the first working run flow (PRODUCT.md §5, Profile).
export function ProfileScreen() {
  return (
    <Screen title="Profile" subtitle="You and your settings">
      <EmptyState
        title="Profile coming soon"
        body="Your runner profile and settings will live here."
      />
    </Screen>
  );
}
