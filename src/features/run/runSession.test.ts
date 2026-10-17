// Run with `npm test` (Node's built-in test runner; Node strips the types).
// TypeScript 6 no longer auto-loads @types packages, so Node's types (for
// node:test / node:assert) are referenced explicitly.
/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getElapsedMs,
  initialRunSession,
  isTooShortToSave,
  runSessionReducer,
  SHORT_RUN_MAX_M,
  SHORT_RUN_MAX_MS,
  type RunAction,
  type RunSession,
} from "./runSession.ts";

function apply(actions: RunAction[], from: RunSession = initialRunSession) {
  return actions.reduce(runSessionReducer, from);
}

describe("runSessionReducer", () => {
  it("starts recording from idle", () => {
    const s = apply([{ type: "start", at: 1_000 }]);
    assert.equal(s.status, "recording");
    assert.equal(s.startedAt, 1_000);
    assert.equal(getElapsedMs(s, 6_000), 5_000);
  });

  it("freezes elapsed time while paused", () => {
    const s = apply([
      { type: "start", at: 0 },
      { type: "pause", at: 10_000 },
    ]);
    assert.equal(s.status, "paused");
    assert.equal(getElapsedMs(s, 10_000), 10_000);
    assert.equal(getElapsedMs(s, 999_000), 10_000);
  });

  it("excludes paused time after resume", () => {
    const s = apply([
      { type: "start", at: 0 },
      { type: "pause", at: 10_000 },
      { type: "resume", at: 60_000 },
    ]);
    assert.equal(s.status, "recording");
    assert.equal(getElapsedMs(s, 65_000), 15_000);
  });

  it("handles several pause/resume cycles", () => {
    const s = apply([
      { type: "start", at: 0 },
      { type: "pause", at: 1_000 },
      { type: "resume", at: 2_000 },
      { type: "pause", at: 4_000 },
      { type: "resume", at: 10_000 },
    ]);
    assert.equal(getElapsedMs(s, 11_000), 4_000);
  });

  it("finishing while recording keeps the final segment", () => {
    const s = apply([
      { type: "start", at: 0 },
      { type: "finish", at: 30_000 },
    ]);
    assert.equal(s.status, "finished");
    assert.equal(s.finishedAt, 30_000);
    assert.equal(getElapsedMs(s, 90_000), 30_000);
  });

  it("finishing while paused doesn't add the paused gap", () => {
    const s = apply([
      { type: "start", at: 0 },
      { type: "pause", at: 20_000 },
      { type: "finish", at: 80_000 },
    ]);
    assert.equal(getElapsedMs(s, 80_000), 20_000);
  });

  it("ignores transitions that don't apply to the current status", () => {
    assert.equal(
      runSessionReducer(initialRunSession, { type: "pause", at: 1 }),
      initialRunSession,
    );
    assert.equal(
      runSessionReducer(initialRunSession, { type: "finish", at: 1 }),
      initialRunSession,
    );

    const recording = apply([{ type: "start", at: 0 }]);
    assert.equal(
      runSessionReducer(recording, { type: "start", at: 5 }),
      recording,
      "double start must not restart the clock",
    );
    assert.equal(runSessionReducer(recording, { type: "resume", at: 5 }), recording);

    const paused = apply([{ type: "pause", at: 5 }], recording);
    assert.equal(
      runSessionReducer(paused, { type: "pause", at: 9 }),
      paused,
      "double pause must not change accumulated time",
    );

    const finished = apply([{ type: "finish", at: 9 }], paused);
    for (const type of ["start", "pause", "resume", "finish"] as const) {
      assert.equal(runSessionReducer(finished, { type, at: 99 }), finished);
    }
  });

  it("never reports negative time if the clock moves backwards", () => {
    const s = apply([{ type: "start", at: 10_000 }]);
    assert.equal(getElapsedMs(s, 5_000), 0);
    const paused = apply([{ type: "pause", at: 5_000 }], s);
    assert.equal(paused.accumulatedMs, 0);
  });

  it("reset returns to idle", () => {
    const s = apply([{ type: "start", at: 0 }, { type: "reset" }]);
    assert.deepEqual(s, initialRunSession);
  });
});

describe("isTooShortToSave", () => {
  it("is true only when both time and distance are small", () => {
    assert.equal(isTooShortToSave(30_000, 20), true);
    assert.equal(isTooShortToSave(SHORT_RUN_MAX_MS - 1, SHORT_RUN_MAX_M - 1), true);
    assert.equal(isTooShortToSave(SHORT_RUN_MAX_MS, 0), false, "a full minute counts");
    assert.equal(isTooShortToSave(10_000, SHORT_RUN_MAX_M), false, "100 m counts");
    assert.equal(isTooShortToSave(5 * 60_000, 0), false, "long indoor run");
  });
});

describe("runSessionReducer GPS samples", () => {
  // ~1 m of latitude ≈ 1 / 111_195 degrees.
  const at = (metersNorth: number, timestamp: number) => ({
    type: "sample" as const,
    sample: {
      latitude: 28.6 + metersNorth / 111_195,
      longitude: 77.2,
      accuracyM: 5,
      timestamp,
    },
    receivedAt: timestamp,
  });

  it("ignores samples unless recording", () => {
    assert.equal(
      runSessionReducer(initialRunSession, at(0, 1_000)),
      initialRunSession,
    );
    const paused = apply([
      { type: "start", at: 0 },
      { type: "pause", at: 1_000 },
    ]);
    assert.equal(runSessionReducer(paused, at(50, 2_000)), paused);
  });

  it("adds distance while recording", () => {
    const s = apply([
      { type: "start", at: 0 },
      at(0, 1_000),
      at(30, 11_000),
      at(60, 21_000),
    ]);
    assert.ok(Math.abs(s.track.distanceM - 60) < 0.5, `got ${s.track.distanceM}`);
  });

  it("doesn't count ground covered while paused", () => {
    const s = apply([
      { type: "start", at: 0 },
      at(0, 1_000),
      at(30, 11_000),
      { type: "pause", at: 12_000 },
      { type: "resume", at: 100_000 },
      at(500, 101_000), // walked 470 m while paused
      at(530, 111_000),
    ]);
    assert.ok(Math.abs(s.track.distanceM - 60) < 0.5, `got ${s.track.distanceM}`);
    assert.equal(s.track.segments.length, 2);
  });

  it("start clears any previous track", () => {
    const s = apply([{ type: "start", at: 0 }]);
    assert.equal(s.track.distanceM, 0);
    assert.equal(s.track.segments.length, 1);
  });
});
