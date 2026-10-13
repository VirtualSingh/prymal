// MOCK DATA — Milestone 1 only.
// No runs can be recorded yet, so Home shows the empty state a brand-new
// runner would see. Replace getHomeSummary() with real persisted activity
// data once run tracking and storage exist (ROADMAP Milestones 3–5).

export type RecentRun = {
  id: string;
  startedAt: string; // ISO 8601
  distanceKm: number;
  durationSeconds: number;
};

export type HomeSummary = {
  weeklyDistanceKm: number;
  totalRuns: number;
  recentRuns: RecentRun[];
};

const MOCK_HOME_SUMMARY: HomeSummary = {
  weeklyDistanceKm: 0,
  totalRuns: 0,
  recentRuns: [],
};

export function getHomeSummary(): HomeSummary {
  return MOCK_HOME_SUMMARY;
}

export function formatDistanceKm(km: number): string {
  return `${km.toFixed(1)} km`;
}
