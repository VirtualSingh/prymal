// Run with `npm test` (Node's built-in test runner; Node strips the types).
// TypeScript 6 no longer auto-loads @types packages, so Node's types (for
// node:test / node:assert) are referenced explicitly.
/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatDuration,
  getElapsedMs,
  initialRunSession,
  runSessionReducer,
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
