/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  initialRunSession,
  runSessionReducer,
  type RunAction,
  type RunSession,
} from "../run/runSession.ts";
import {
  buildRunRecord,
  finishRecoveredSession,
  lifetimeStats,
  newRunId,
  parseSessionSnapshot,
  startOfWeek,
  summarizeRuns,
} from "./runRecord.ts";

function apply(actions: RunAction[], from: RunSession = initialRunSession) {
  return actions.reduce(runSessionReducer, from);
}

const sampleAt = (metersNorth: number, timestamp: number): RunAction => ({
  type: "sample",
  sample: {
    latitude: 28.6 + metersNorth / 111_195,
    longitude: 77.2,
    accuracyM: 5,
    timestamp,
  },
  receivedAt: timestamp,
});

describe("buildRunRecord", () => {
  it("returns null unless the session is finished", () => {
    assert.equal(buildRunRecord(initialRunSession, "x"), null);
    const recording = apply([{ type: "start", at: 0 }]);
    assert.equal(buildRunRecord(recording, "x"), null);
  });

  it("summarizes a finished run, excluding paused time", () => {
    const s = apply([
      { type: "start", at: 1_000 },
      sampleAt(0, 2_000),
      sampleAt(30, 12_000),
      { type: "pause", at: 20_000 },
      { type: "resume", at: 50_000 },
      sampleAt(100, 51_000),
      sampleAt(130, 61_000),
      { type: "finish", at: 70_000 },
    ]);
    const record = buildRunRecord(s, "run_1");
    assert.ok(record);
    assert.equal(record.run.id, "run_1");
    assert.equal(record.run.startedAt, 1_000);
    assert.equal(record.run.finishedAt, 70_000);
    assert.equal(record.run.durationMs, 19_000 + 20_000);
    assert.ok(Math.abs(record.run.distanceM - 60) < 0.5);
    assert.equal(record.run.routePointCount, 4);
    assert.equal(record.run.recovered, false);
  });

  it("numbers points by segment and order within the segment", () => {
    const s = apply([
      { type: "start", at: 0 },
      sampleAt(0, 1_000),
      sampleAt(30, 11_000),
      { type: "pause", at: 12_000 },
      { type: "resume", at: 20_000 },
      sampleAt(200, 21_000),
      { type: "finish", at: 30_000 },
    ]);
    const record = buildRunRecord(s, "r");
    assert.ok(record);
    assert.deepEqual(
      record.points.map((p) => [p.segment, p.seq]),
      [
        [0, 0],
        [0, 1],
        [1, 0],
      ],
    );
  });
});

describe("finishRecoveredSession", () => {
  it("finishes at the checkpoint time, not later", () => {
    const snapshot = apply([{ type: "start", at: 0 }]);
    const finished = finishRecoveredSession(snapshot, 60_000);
    assert.ok(finished);
    assert.equal(finished.status, "finished");
    assert.equal(finished.finishedAt, 60_000);
    const record = buildRunRecord(finished, "r", true);
    assert.equal(record?.run.durationMs, 60_000);
    assert.equal(record?.run.recovered, true);
  });

  it("keeps paused time excluded for a run paused at the checkpoint", () => {
    const snapshot = apply([
      { type: "start", at: 0 },
      { type: "pause", at: 30_000 },
    ]);
    const finished = finishRecoveredSession(snapshot, 90_000);
    assert.equal(buildRunRecord(finished!, "r")?.run.durationMs, 30_000);
  });

  it("ignores a snapshot of a run that never started", () => {
    assert.equal(finishRecoveredSession(initialRunSession, 1_000), null);
  });

  it("uses an already-finished snapshot as-is (its save didn't complete)", () => {
    const done = apply([
      { type: "start", at: 0 },
      { type: "finish", at: 5_000 },
    ]);
    assert.equal(finishRecoveredSession(done, 9_000), done);
  });
});

describe("startOfWeek", () => {
  it("returns Monday 00:00 local time", () => {
    // Wednesday 15 Oct 2026, 18:30 local.
    const start = startOfWeek(new Date(2026, 9, 15, 18, 30));
    assert.equal(start.getDay(), 1);
    assert.equal(start.getDate(), 12);
    assert.equal(start.getHours(), 0);
    assert.equal(start.getMinutes(), 0);
  });

  it("treats Sunday as the end of the week", () => {
    const start = startOfWeek(new Date(2026, 9, 18, 9, 0)); // Sunday
    assert.equal(start.getDate(), 12);
  });

  it("is the same day on Monday", () => {
    const start = startOfWeek(new Date(2026, 9, 12, 0, 1));
    assert.equal(start.getDate(), 12);
  });
});

describe("summarizeRuns", () => {
  it("counts all runs but only this week's distance", () => {
    const now = new Date(2026, 9, 15, 12, 0); // Wed
    const runs = [
      { startedAt: new Date(2026, 9, 14, 7, 0).getTime(), distanceM: 5_000 },
      { startedAt: new Date(2026, 9, 12, 0, 0).getTime(), distanceM: 3_000 },
      { startedAt: new Date(2026, 9, 11, 23, 59).getTime(), distanceM: 10_000 },
    ];
    assert.deepEqual(summarizeRuns(runs, now), {
      weeklyDistanceM: 8_000,
      totalRuns: 3,
    });
  });

  it("is zero with no runs", () => {
    assert.deepEqual(summarizeRuns([], new Date()), {
      weeklyDistanceM: 0,
      totalRuns: 0,
    });
  });
});

describe("lifetimeStats", () => {
  it("is all zero / null with no runs", () => {
    assert.deepEqual(lifetimeStats([]), {
      runCount: 0,
      totalDistanceM: 0,
      totalDurationMs: 0,
      longestRunM: 0,
      fastestPaceMsPerKm: null,
    });
  });

  it("totals runs and picks the longest and fastest", () => {
    const stats = lifetimeStats([
      { distanceM: 5_000, durationMs: 30 * 60_000 }, // 6:00/km
      { distanceM: 10_000, durationMs: 55 * 60_000 }, // 5:30/km
      { distanceM: 500, durationMs: 60_000 }, // 2:00/km but too short
    ]);
    assert.equal(stats.runCount, 3);
    assert.equal(stats.totalDistanceM, 15_500);
    assert.equal(stats.totalDurationMs, 86 * 60_000);
    assert.equal(stats.longestRunM, 10_000);
    assert.equal(stats.fastestPaceMsPerKm, 5.5 * 60_000);
  });
});

describe("parseSessionSnapshot", () => {
  it("round-trips a session through JSON", () => {
    const s = apply([
      { type: "start", at: 0 },
      sampleAt(0, 1_000),
      sampleAt(30, 11_000),
      { type: "pause", at: 12_000 },
    ]);
    assert.deepEqual(parseSessionSnapshot(JSON.stringify(s)), s);
  });

  it("rejects corrupt or unrelated data", () => {
    assert.equal(parseSessionSnapshot("not json"), null);
    assert.equal(parseSessionSnapshot("null"), null);
    assert.equal(parseSessionSnapshot("{}"), null);
    assert.equal(
      parseSessionSnapshot(
        JSON.stringify({ ...initialRunSession, status: "flying" }),
      ),
      null,
    );
    assert.equal(
      parseSessionSnapshot(JSON.stringify({ ...initialRunSession, track: null })),
      null,
    );
  });
});

describe("newRunId", () => {
  it("is prefixed, time-based, and padded", () => {
    assert.equal(newRunId(0, () => 0), "run_0_000000");
    assert.match(newRunId(Date.now()), /^run_[0-9a-z]+_[0-9a-z]{6}$/);
  });
});
