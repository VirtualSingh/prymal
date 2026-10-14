/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addSample,
  emptyTrack,
  haversineM,
  JUMP_RESET_COUNT,
  MAX_ACCURACY_M,
  MAX_SAMPLE_AGE_MS,
  routePointCount,
  startNewSegment,
  type GpsSample,
  type TrackState,
} from "./track.ts";

const LAT = 28.6;
const LON = 77.2;
const M_PER_DEG_LAT = 111_195;

function sample(
  metersNorth: number,
  timestamp: number,
  accuracyM: number | null = 5,
): GpsSample {
  return {
    latitude: LAT + metersNorth / M_PER_DEG_LAT,
    longitude: LON,
    accuracyM,
    timestamp,
  };
}

/** Feed samples, each received at its own timestamp. */
function feed(samples: GpsSample[], from: TrackState = emptyTrack) {
  return samples.reduce((t, s) => addSample(t, s, s.timestamp), from);
}

describe("haversineM", () => {
  it("measures a known north-south distance", () => {
    const d = haversineM(sample(0, 0), sample(1000, 0));
    assert.ok(Math.abs(d - 1000) < 1, `got ${d}`);
  });

  it("is zero for the same point", () => {
    assert.equal(haversineM(sample(0, 0), sample(0, 0)), 0);
  });
});

describe("addSample", () => {
  it("uses the first good reading as the start without adding distance", () => {
    const t = feed([sample(0, 1_000)]);
    assert.equal(t.distanceM, 0);
    assert.equal(routePointCount(t), 1);
  });

  it("adds distance for a steady run", () => {
    // 3 m/s for 100 s, one reading per second.
    const readings = Array.from({ length: 101 }, (_, i) =>
      sample(i * 3, 1_000 + i * 1_000),
    );
    const t = feed(readings);
    assert.ok(Math.abs(t.distanceM - 300) <= 6, `got ${t.distanceM}`);
    assert.equal(t.ignoredCount, 0);
  });

  it("ignores readings with poor or missing accuracy", () => {
    const t = feed([
      sample(0, 1_000),
      sample(50, 11_000, MAX_ACCURACY_M + 1),
      sample(50, 12_000, null),
    ]);
    assert.equal(t.distanceM, 0);
    assert.equal(t.ignoredCount, 2);
  });

  it("ignores stale readings", () => {
    const t = addSample(emptyTrack, sample(0, 0), MAX_SAMPLE_AGE_MS + 1);
    assert.equal(routePointCount(t), 0);
    assert.equal(t.ignoredCount, 1);
  });

  it("ignores duplicate and out-of-order readings", () => {
    const t = feed([sample(0, 5_000), sample(20, 5_000), sample(20, 4_000)]);
    assert.equal(t.distanceM, 0);
    assert.equal(t.ignoredCount, 2);
  });

  it("adds no distance from jitter while standing still", () => {
    const wobble = [0, 3, -2, 4, -3, 2, -4, 3, 0, -2];
    const t = feed(wobble.map((m, i) => sample(m, 1_000 + i * 1_000)));
    assert.equal(t.distanceM, 0);
  });

  it("still counts slow movement once it exceeds the jitter threshold", () => {
    // 1 m/s walk: each step is below the threshold, but the anchor holds,
    // so distance arrives in chunks.
    const t = feed(
      Array.from({ length: 61 }, (_, i) => sample(i, 1_000 + i * 1_000)),
    );
    assert.ok(t.distanceM >= 55 && t.distanceM < 60.5, `got ${t.distanceM}`);
  });

  it("ignores an impossible jump and continues from the good point", () => {
    const t = feed([
      sample(0, 1_000),
      sample(500, 2_000), // 500 m in 1 s
      sample(3, 3_000),
      sample(10, 4_000),
    ]);
    assert.equal(t.ignoredCount, 1);
    assert.ok(Math.abs(t.distanceM - 10) < 0.5, `got ${t.distanceM}`);
  });

  it("restarts after repeated jumps instead of blocking distance forever", () => {
    // The first point was bad: everything after it is ~1 km away.
    const readings = [sample(0, 1_000)];
    for (let i = 0; i < JUMP_RESET_COUNT; i++) {
      readings.push(sample(1_000 + i * 3, 2_000 + i * 1_000));
    }
    // Then a normal 8 m step from the new starting point.
    const restartAt = 1_000 + (JUMP_RESET_COUNT - 1) * 3;
    readings.push(sample(restartAt + 8, 2_000 + JUMP_RESET_COUNT * 1_000));
    const t = feed(readings);
    assert.equal(t.segments.length, 2, "restarted in a new segment");
    assert.equal(t.ignoredCount, JUMP_RESET_COUNT - 1);
    assert.ok(
      Math.abs(t.distanceM - 8) < 0.5,
      `only the 8 m after the restart counts, got ${t.distanceM}`,
    );
  });

  it("returns the same object for jitter so React can skip a render", () => {
    const t1 = feed([sample(0, 1_000)]);
    const t2 = addSample(t1, sample(1, 2_000), 2_000);
    assert.equal(t2, t1);
  });
});

describe("startNewSegment", () => {
  it("only adds a segment when the current one has points", () => {
    assert.equal(startNewSegment(emptyTrack).segments.length, 1);
    const t = startNewSegment(feed([sample(0, 1_000)]));
    assert.equal(t.segments.length, 2);
    assert.equal(startNewSegment(t).segments.length, 2);
  });
});
