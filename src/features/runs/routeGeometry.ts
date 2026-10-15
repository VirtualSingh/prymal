// Pure geometry for a saved route: map framing and per-km splits.
// No React Native or Expo imports, so it can be unit-tested with Node.

import { haversineM } from "../run/track.ts";
import type { RunPointRecord } from "./runRecord.ts";

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

/** Smallest span shown, so a very short route isn't zoomed in absurdly. */
const MIN_DELTA_DEG = 0.003;

/**
 * Map region that fits all points with some margin, or null if there are
 * none. (Doesn't handle routes crossing the ±180° meridian.)
 */
export function routeRegion(points: LatLng[], margin = 1.4): Region | null {
  if (points.length === 0) return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLon = Math.min(minLon, p.longitude);
    maxLon = Math.max(maxLon, p.longitude);
  }
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max(MIN_DELTA_DEG, (maxLat - minLat) * margin),
    longitudeDelta: Math.max(MIN_DELTA_DEG, (maxLon - minLon) * margin),
  };
}

/** Points grouped into their recording segments, in order. */
export function routeSegments(points: RunPointRecord[]): LatLng[][] {
  const segments = new Map<number, LatLng[]>();
  const sorted = [...points].sort((a, b) => a.segment - b.segment || a.seq - b.seq);
  for (const p of sorted) {
    const list = segments.get(p.segment) ?? [];
    list.push({ latitude: p.latitude, longitude: p.longitude });
    segments.set(p.segment, list);
  }
  return [...segments.values()];
}

export type Split = {
  /** 1-based kilometre number. */
  index: number;
  distanceM: number;
  /** Moving time for this split, from GPS point timestamps. */
  durationMs: number;
  /** The last, incomplete kilometre. */
  partial: boolean;
};

const SPLIT_M = 1000;
/** A final partial split shorter than this is too short to be useful. */
export const MIN_PARTIAL_SPLIT_M = 50;

/**
 * Per-kilometre splits from saved route points. Distance is the same sum
 * of point-to-point distances used for the run's total. Time comes from
 * the points' timestamps within each segment, so paused gaps between
 * segments are excluded. Kilometre boundaries are interpolated between
 * points.
 */
export function computeSplits(points: RunPointRecord[]): Split[] {
  const sorted = [...points].sort((a, b) => a.segment - b.segment || a.seq - b.seq);
  const splits: Split[] = [];
  let distance = 0;
  let time = 0;
  let nextBoundary = SPLIT_M;
  let lastBoundaryTime = 0;

  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1];
    const b = sorted[i];
    if (a.segment !== b.segment) continue; // paused gap: not running
    const d = haversineM(a, b);
    const dt = Math.max(0, b.timestamp - a.timestamp);
    while (d > 0 && distance + d >= nextBoundary) {
      const crossedAt = time + ((nextBoundary - distance) / d) * dt;
      splits.push({
        index: splits.length + 1,
        distanceM: SPLIT_M,
        durationMs: crossedAt - lastBoundaryTime,
        partial: false,
      });
      lastBoundaryTime = crossedAt;
      nextBoundary += SPLIT_M;
    }
    distance += d;
    time += dt;
  }

  const remainder = distance - (nextBoundary - SPLIT_M);
  if (remainder >= MIN_PARTIAL_SPLIT_M) {
    splits.push({
      index: splits.length + 1,
      distanceM: remainder,
      durationMs: time - lastBoundaryTime,
      partial: true,
    });
  }
  return splits;
}
