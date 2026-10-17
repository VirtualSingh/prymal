/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  describeGpsStatus,
  GPS_LOST_MS,
  WEAK_ACCURACY_M,
  type GpsStatusInput,
} from "./gpsStatus.ts";

const base = (overrides: Partial<GpsStatusInput>): GpsStatusInput => ({
  signal: { kind: "ready", accuracyM: 5, at: 100_000 },
  now: 101_000,
  recording: true,
  locationAvailable: true,
  ...overrides,
});

describe("describeGpsStatus", () => {
  it("reports a good signal with its accuracy", () => {
    const v = describeGpsStatus(base({}));
    assert.equal(v.text, "GPS good · ±5 m");
    assert.equal(v.warn, false);
  });

  it("flags weak accuracy", () => {
    const v = describeGpsStatus(
      base({ signal: { kind: "ready", accuracyM: WEAK_ACCURACY_M + 5, at: 100_000 } }),
    );
    assert.match(v.text, /weak/);
    assert.equal(v.warn, true);
  });

  it("says the signal is lost when readings stop while recording", () => {
    const v = describeGpsStatus(base({ now: 100_000 + GPS_LOST_MS + 1 }));
    assert.match(v.text, /lost/);
    assert.equal(v.warn, true);
  });

  it("doesn't call an old reading lost when not recording", () => {
    const v = describeGpsStatus(
      base({ recording: false, now: 100_000 + GPS_LOST_MS * 10 }),
    );
    assert.equal(v.warn, false);
  });

  it("is not lost right at the threshold", () => {
    const v = describeGpsStatus(base({ now: 100_000 + GPS_LOST_MS }));
    assert.doesNotMatch(v.text, /lost/);
  });

  it("explains that location access is off", () => {
    const v = describeGpsStatus(base({ locationAvailable: false }));
    assert.match(v.text, /Location is off/);
    assert.equal(v.warn, true);
  });

  it("warns while searching only if recording", () => {
    assert.equal(
      describeGpsStatus(base({ signal: { kind: "searching" } })).warn,
      true,
    );
    assert.equal(
      describeGpsStatus(base({ signal: { kind: "searching" }, recording: false })).warn,
      false,
    );
  });

  it("shows errors", () => {
    const v = describeGpsStatus(base({ signal: { kind: "error", message: "timeout" } }));
    assert.equal(v.text, "GPS unavailable: timeout");
    assert.equal(v.warn, true);
  });
});
