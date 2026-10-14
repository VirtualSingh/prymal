// Pure conversions between an in-memory run session and what gets saved.
// No storage or Expo imports here, so it can be unit-tested with Node.

import {
  getElapsedMs,
  runSessionReducer,
  type RunSession,
} from "../run/runSession.ts";
import { routePointCount, type TrackPoint } from "../run/track.ts";

/** Saved run summary (one row in `runs`). Derived from the route points. */
export type RunRecord = {
  id: string;
  startedAt: number;
  finishedAt: number;
  /** Moving time: excludes paused time. */
  durationMs: number;
  distanceM: number;
  routePointCount: number;
  ignoredReadingCount: number;
  /** Saved from a checkpoint after the app closed mid-run. */
  recovered: boolean;
};

/** One saved route point (one row in `run_points`). */
export type RunPointRecord = TrackPoint & {
  segment: number;
  seq: number;
};

export function newRunId(startedAt: number, random: () => number = Math.random) {
  const suffix = Math.floor(random() * 36 ** 6)
    .toString(36)
    .padStart(6, "0");
  return `run_${startedAt.toString(36)}_${suffix}`;
}

/**
 * Build the summary and point rows for a finished session.
 * Returns null if the session isn't finished or never started.
 */
export function buildRunRecord(
  session: RunSession,
  id: string,
  recovered = false,
): { run: RunRecord; points: RunPointRecord[] } | null {
  if (
    session.status !== "finished" ||
    session.startedAt === null ||
    session.finishedAt === null
  ) {
    return null;
  }
  const { track } = session;
  const points = track.segments.flatMap((segment, segmentIndex) =>
    segment.map((point, seq) => ({ ...point, segment: segmentIndex, seq })),
  );
  return {
    run: {
      id,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      durationMs: getElapsedMs(session, session.finishedAt),
      distanceM: track.distanceM,
      routePointCount: routePointCount(track),
      ignoredReadingCount: track.ignoredCount,
      recovered,
    },
    points,
  };
}

/**
 * Finish a session restored from a checkpoint after the app closed
 * unexpectedly. A run in progress is finished at the checkpoint time, not
 * "now", so time after the app died isn't counted as running. A snapshot
 * that was already finished (its save didn't complete) is used as-is.
 * Returns null if the snapshot never started.
 */
export function finishRecoveredSession(
  snapshot: RunSession,
  checkpointAt: number,
): RunSession | null {
  if (snapshot.status === "finished") return snapshot;
  if (snapshot.status !== "recording" && snapshot.status !== "paused") {
    return null;
  }
  return runSessionReducer(snapshot, { type: "finish", at: checkpointAt });
}

const isNumberOrNull = (v: unknown) => v === null || typeof v === "number";

/**
 * Parse a checkpoint written with JSON.stringify(session). Returns null for
 * anything that doesn't look like a run session, so a corrupt checkpoint
 * is discarded instead of crashing app start-up.
 */
export function parseSessionSnapshot(json: string): RunSession | null {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const s = value as Record<string, unknown>;
  const track = s.track as Record<string, unknown> | null | undefined;
  const valid =
    (s.status === "idle" ||
      s.status === "recording" ||
      s.status === "paused" ||
      s.status === "finished") &&
    isNumberOrNull(s.startedAt) &&
    isNumberOrNull(s.segmentStartedAt) &&
    isNumberOrNull(s.finishedAt) &&
    typeof s.accumulatedMs === "number" &&
    typeof track === "object" &&
    track !== null &&
    Array.isArray(track.segments) &&
    track.segments.length > 0 &&
    track.segments.every(Array.isArray) &&
    typeof track.distanceM === "number" &&
    typeof track.ignoredCount === "number" &&
    typeof track.consecutiveJumps === "number";
  return valid ? (value as RunSession) : null;
}

/** Monday 00:00 local time of the week containing `now`. */
export function startOfWeek(now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

export type RunStats = {
  weeklyDistanceM: number;
  totalRuns: number;
};

export function summarizeRuns(
  runs: Pick<RunRecord, "startedAt" | "distanceM">[],
  now: Date,
): RunStats {
  const weekStart = startOfWeek(now).getTime();
  let weeklyDistanceM = 0;
  for (const run of runs) {
    if (run.startedAt >= weekStart) weeklyDistanceM += run.distanceM;
  }
  return { weeklyDistanceM, totalRuns: runs.length };
}
