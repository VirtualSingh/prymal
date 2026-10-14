// Turns raw GPS readings into an accepted route and a distance.
//
// Filtering is deliberately conservative: it's better to under-count a few
// metres than to add distance from GPS noise. Thresholds are first guesses
// to be tuned against real outdoor runs (ROADMAP Milestone 4).
//
// Raw readings are not stored. Only accepted route points are kept, and the
// distance is derived from them.

export type GpsSample = {
  latitude: number;
  longitude: number;
  /** Horizontal accuracy radius in metres; null if the device didn't report it. */
  accuracyM: number | null;
  /** Time of the fix (epoch ms), as reported by the device. */
  timestamp: number;
};

export type TrackPoint = {
  latitude: number;
  longitude: number;
  accuracyM: number;
  timestamp: number;
};

export type TrackState = {
  /** Accepted route points. A new segment starts after each resume. */
  segments: TrackPoint[][];
  distanceM: number;
  /** Readings rejected as unreliable (poor accuracy, stale, impossible jump). */
  ignoredCount: number;
  /** Consecutive readings rejected as impossible jumps from the last point. */
  consecutiveJumps: number;
};

/** Readings less precise than this are ignored. */
export const MAX_ACCURACY_M = 25;
/** Readings older than this when received are stale (e.g. cached fixes). */
export const MAX_SAMPLE_AGE_MS = 30_000;
/** Faster than ~43 km/h isn't running; treat it as a GPS jump. */
export const MAX_SPEED_MPS = 12;
/**
 * After this many jump rejections in a row, assume the last accepted point
 * was the bad one and restart from the current position (without adding
 * the gap), so one bad point can't block distance for the rest of the run.
 */
export const JUMP_RESET_COUNT = 5;
/** Movement smaller than this (or the readings' accuracy) is treated as jitter. */
export const MIN_MOVE_M = 5;

export const emptyTrack: TrackState = {
  segments: [[]],
  distanceM: 0,
  ignoredCount: 0,
  consecutiveJumps: 0,
};

const EARTH_RADIUS_M = 6_371_008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates, in metres. */
export function haversineM(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function routePointCount(track: TrackState): number {
  return track.segments.reduce((n, segment) => n + segment.length, 0);
}

/** Start a new segment (after a pause) so the paused gap isn't counted. */
export function startNewSegment(track: TrackState): TrackState {
  const last = track.segments[track.segments.length - 1];
  if (last.length === 0) return { ...track, consecutiveJumps: 0 };
  return { ...track, segments: [...track.segments, []], consecutiveJumps: 0 };
}

function ignore(track: TrackState): TrackState {
  return { ...track, ignoredCount: track.ignoredCount + 1 };
}

function appendPoint(
  track: TrackState,
  point: TrackPoint,
  addedM: number,
): TrackState {
  const segments = track.segments.slice();
  segments[segments.length - 1] = [...segments[segments.length - 1], point];
  return {
    ...track,
    segments,
    distanceM: track.distanceM + addedM,
    consecutiveJumps: 0,
  };
}

/**
 * Feed one GPS reading. Returns the same object when nothing changes
 * (jitter), so React can skip re-rendering.
 */
export function addSample(
  track: TrackState,
  sample: GpsSample,
  receivedAt: number,
): TrackState {
  const { accuracyM } = sample;
  if (
    accuracyM === null ||
    !Number.isFinite(accuracyM) ||
    accuracyM > MAX_ACCURACY_M ||
    !Number.isFinite(sample.latitude) ||
    !Number.isFinite(sample.longitude)
  ) {
    return ignore(track);
  }
  if (receivedAt - sample.timestamp > MAX_SAMPLE_AGE_MS) {
    return ignore(track);
  }

  const point: TrackPoint = {
    latitude: sample.latitude,
    longitude: sample.longitude,
    accuracyM,
    timestamp: sample.timestamp,
  };
  const segment = track.segments[track.segments.length - 1];
  const anchor = segment[segment.length - 1];

  // First good reading of a segment just sets the starting point.
  if (!anchor) return appendPoint(track, point, 0);

  // Duplicate or out-of-order reading.
  if (point.timestamp <= anchor.timestamp) return ignore(track);

  const moved = haversineM(anchor, point);
  const seconds = (point.timestamp - anchor.timestamp) / 1000;

  if (moved / seconds > MAX_SPEED_MPS) {
    const jumps = track.consecutiveJumps + 1;
    if (jumps >= JUMP_RESET_COUNT) {
      // Restart from here without counting the gap.
      return appendPoint(startNewSegment(track), point, 0);
    }
    return { ...ignore(track), consecutiveJumps: jumps };
  }

  // Jitter: keep the anchor until movement clearly exceeds GPS noise. Small
  // real movements still add up, because the anchor stays where it was.
  if (moved < Math.max(MIN_MOVE_M, Math.min(anchor.accuracyM, accuracyM))) {
    return track.consecutiveJumps === 0
      ? track
      : { ...track, consecutiveJumps: 0 };
  }

  return appendPoint(track, point, moved);
}
