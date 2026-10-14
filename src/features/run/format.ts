/** "mm:ss" under an hour, "h:mm:ss" from an hour up. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Kilometres with two decimals, e.g. "3.27". Unit label is rendered separately. */
export function formatDistanceKm(meters: number): string {
  const km = Math.max(0, meters) / 1000;
  // Truncate rather than round, so 0.999 km shows "0.99", not "1.00".
  return (Math.floor(km * 100) / 100).toFixed(2);
}

/** Kilometres with one decimal, truncated, e.g. "3.2". For compact stats. */
export function formatDistanceKmShort(meters: number): string {
  const km = Math.max(0, meters) / 1000;
  return (Math.floor(km * 10) / 10).toFixed(1);
}

/** e.g. "Tue, 14 Oct · 7:42 am", in the phone's locale and time zone. */
export function formatRunDateTime(epochMs: number): string {
  const d = new Date(epochMs);
  const date = d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

/**
 * Below this distance, average pace is too noisy to be meaningful (a few
 * metres of GPS error would show absurd paces), so it isn't shown.
 */
export const MIN_DISTANCE_FOR_PACE_M = 100;

/** Average pace in ms per km, or null when it can't be shown honestly. */
export function averagePaceMsPerKm(
  elapsedMs: number,
  distanceM: number,
): number | null {
  if (!(distanceM >= MIN_DISTANCE_FOR_PACE_M) || !(elapsedMs > 0)) return null;
  const pace = elapsedMs / (distanceM / 1000);
  return Number.isFinite(pace) ? pace : null;
}

/** "m:ss" per km, or "--:--" when there's no meaningful pace yet. */
export function formatPace(msPerKm: number | null): string {
  if (msPerKm === null || !Number.isFinite(msPerKm) || msPerKm <= 0) {
    return "--:--";
  }
  const totalSeconds = Math.round(msPerKm / 1000);
  // Slower than 99:59 /km is effectively standing still; don't show it.
  if (totalSeconds > 99 * 60 + 59) return "--:--";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
