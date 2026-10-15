/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeSplits,
  MIN_PARTIAL_SPLIT_M,
  routeRegion,
  routeSegments,
} from "./routeGeometry.ts";
import type { RunPointRecord } from "./runRecord.ts";

const M_PER_DEG_LAT = 111_195;

/** A point `metersNorth` of a fixed origin at `seconds` into the run. */
function pt(
  metersNorth: number,
  seconds: number,
  segment = 0,
  seq = 0,
): RunPointRecord {
  return {
    latitude: 28.6 + metersNorth / M_PER_DEG_LAT,
    longitude: 77.2,
    accuracyM: 5,
    timestamp: seconds * 1000,
    segment,
    seq,
  };
}

/** Steady run north: one point every `stepS` seconds at `speedMps`. */
function steady(totalM: number, speedMps: number, stepS = 5, segment = 0, startS = 0, startM = 0) {
  const points: RunPointRecord[] = [];
  const stepM = speedMps * stepS;
  for (let i = 0; i * stepM <= totalM; i++) {
    points.push(pt(startM + i * stepM, startS + i * stepS, segment, i));
  }
  return points;
}

describe("routeRegion", () => {
  it("is null with no points", () => {
    assert.equal(routeRegion([]), null);
  });

  it("centres on the route and covers it with margin", () => {
    const r = routeRegion([pt(0, 0), pt(2000, 600)]);
    assert.ok(r);
    const spanDeg = 2000 / M_PER_DEG_LAT;
    assert.ok(Math.abs(r.latitude - (28.6 + spanDeg / 2)) < 1e-9);
    assert.ok(r.latitudeDelta > spanDeg, "covers the full span");
    assert.equal(r.longitude, 77.2);
  });

  it("never zooms in past the minimum span", () => {
    const r = routeRegion([pt(0, 0)]);
    assert.ok(r && r.latitudeDelta > 0 && r.longitudeDelta > 0);
  });
});

describe("routeSegments", () => {
  it("groups by segment in order regardless of input order", () => {
    const segs = routeSegments([pt(20, 3, 1, 0), pt(0, 0, 0, 0), pt(10, 1, 0, 1)]);
    assert.equal(segs.length, 2);
    assert.equal(segs[0].length, 2);
    assert.equal(segs[1].length, 1);
  });
});

describe("computeSplits", () => {
  it("returns nothing for an empty or tiny route", () => {
    assert.deepEqual(computeSplits([]), []);
    assert.deepEqual(computeSplits([pt(0, 0), pt(MIN_PARTIAL_SPLIT_M - 10, 10)]), []);
  });

  it("splits a steady 5:00/km run into equal kilometres", () => {
    // 1000 m / 300 s = 3.333 m/s; 2.5 km.
    const splits = computeSplits(steady(2500, 1000 / 300));
    assert.equal(splits.length, 3);
    for (const s of splits.slice(0, 2)) {
      assert.equal(s.partial, false);
      assert.equal(s.distanceM, 1000);
      assert.ok(Math.abs(s.durationMs - 300_000) < 500, `got ${s.durationMs}`);
    }
    const last = splits[2];
    assert.equal(last.partial, true);
    assert.ok(Math.abs(last.distanceM - 500) < 2, `got ${last.distanceM}`);
    assert.ok(Math.abs(last.durationMs - 150_000) < 1_000, `got ${last.durationMs}`);
  });

  it("interpolates a boundary that falls between two points", () => {
    // Two points 1200 m apart over 120 s: the 1 km mark is at 100 s.
    const splits = computeSplits([pt(0, 0), pt(1200, 120)]);
    assert.ok(Math.abs(splits[0].durationMs - 100_000) < 50, `got ${splits[0].durationMs}`);
    assert.equal(splits[1].partial, true);
    assert.ok(Math.abs(splits[1].distanceM - 200) < 1);
    assert.ok(Math.abs(splits[1].durationMs - 20_000) < 50);
  });

  it("excludes paused time and paused distance between segments", () => {
    // 600 m, pause (moved 5 km, 10 min), then 600 m more at the same pace.
    const first = steady(600, 3, 5, 0, 0, 0);
    const second = steady(600, 3, 5, 1, 1_000, 5_000);
    const splits = computeSplits([...first, ...second]);
    assert.equal(splits[0].partial, false);
    // 1000 m at 3 m/s = 333 s, with no pause time.
    assert.ok(Math.abs(splits[0].durationMs - 333_333) < 2_000, `got ${splits[0].durationMs}`);
    assert.ok(Math.abs(splits[1].distanceM - 200) < 2);
  });

  it("split distances add up to the route distance", () => {
    const points = steady(3300, 3.1, 3);
    const total = computeSplits(points).reduce((m, s) => m + s.distanceM, 0);
    const last = points[points.length - 1];
    const routeM = (last.latitude - points[0].latitude) * M_PER_DEG_LAT;
    assert.ok(Math.abs(total - routeM) < 3, `${total} vs ${routeM}`);
  });
});
