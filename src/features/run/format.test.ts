/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  averagePaceMsPerKm,
  formatDistanceKm,
  formatDistanceKmShort,
  formatDuration,
  formatPace,
  MIN_DISTANCE_FOR_PACE_M,
} from "./format.ts";

describe("formatDuration", () => {
  it("formats under an hour as mm:ss", () => {
    assert.equal(formatDuration(0), "00:00");
    assert.equal(formatDuration(999), "00:00");
    assert.equal(formatDuration(61_000), "01:01");
    assert.equal(formatDuration(59 * 60_000 + 59_000), "59:59");
  });

  it("formats an hour or more as h:mm:ss", () => {
    assert.equal(formatDuration(3_600_000), "1:00:00");
    assert.equal(formatDuration(3_600_000 + 5 * 60_000 + 7_000), "1:05:07");
  });

  it("treats negative input as zero", () => {
    assert.equal(formatDuration(-5_000), "00:00");
  });
});

describe("formatDistanceKm", () => {
  it("shows two decimals, truncated", () => {
    assert.equal(formatDistanceKm(0), "0.00");
    assert.equal(formatDistanceKm(999), "0.99");
    assert.equal(formatDistanceKm(3_276), "3.27");
    assert.equal(formatDistanceKm(-10), "0.00");
  });
});

describe("formatDistanceKmShort", () => {
  it("shows one decimal, truncated", () => {
    assert.equal(formatDistanceKmShort(0), "0.0");
    assert.equal(formatDistanceKmShort(999), "0.9");
    assert.equal(formatDistanceKmShort(12_345), "12.3");
  });
});

describe("averagePaceMsPerKm", () => {
  it("is null until there's enough distance", () => {
    assert.equal(averagePaceMsPerKm(60_000, 0), null);
    assert.equal(averagePaceMsPerKm(60_000, MIN_DISTANCE_FOR_PACE_M - 1), null);
  });

  it("is null with no elapsed time", () => {
    assert.equal(averagePaceMsPerKm(0, 1_000), null);
  });

  it("computes ms per km", () => {
    // 5 km in 25 minutes = 5:00 /km.
    assert.equal(averagePaceMsPerKm(25 * 60_000, 5_000), 5 * 60_000);
  });

  it("never returns NaN or Infinity", () => {
    const cases: [number, number][] = [
      [NaN, 1_000],
      [60_000, NaN],
      [Infinity, 1_000],
    ];
    for (const [ms, m] of cases) {
      const pace = averagePaceMsPerKm(ms, m);
      assert.ok(pace === null || Number.isFinite(pace), `got ${pace}`);
    }
  });
});

describe("formatPace", () => {
  it("formats m:ss", () => {
    assert.equal(formatPace(5 * 60_000), "5:00");
    assert.equal(formatPace(5 * 60_000 + 7_000), "5:07");
    assert.equal(formatPace(4 * 60_000 + 59_600), "5:00");
  });

  it("shows --:-- when there's no meaningful pace", () => {
    assert.equal(formatPace(null), "--:--");
    assert.equal(formatPace(NaN), "--:--");
    assert.equal(formatPace(Infinity), "--:--");
    assert.equal(formatPace(0), "--:--");
    assert.equal(formatPace(200 * 60_000), "--:--");
  });
});
