/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { RunStatus } from "../run/runSession.ts";
import {
  backgroundLimit,
  chooseLocationSource,
  createRelay,
  type LocationSourceInput,
} from "./locationSource.ts";

const input = (overrides: Partial<LocationSourceInput>): LocationSourceInput => ({
  status: "recording",
  foregroundGranted: true,
  backgroundSupported: true,
  backgroundGranted: true,
  ...overrides,
});

describe("chooseLocationSource", () => {
  it("records in the background when supported and allowed", () => {
    assert.equal(chooseLocationSource(input({})), "background");
  });

  it("uses the foreground watcher before Start and while paused", () => {
    for (const status of ["idle", "paused"] as RunStatus[]) {
      assert.equal(chooseLocationSource(input({ status })), "foreground", status);
    }
  });

  it("falls back to foreground in Expo Go or without background permission", () => {
    assert.equal(
      chooseLocationSource(input({ backgroundSupported: false })),
      "foreground",
    );
    assert.equal(
      chooseLocationSource(input({ backgroundGranted: false })),
      "foreground",
    );
  });

  it("is off without location permission or after finishing", () => {
    assert.equal(chooseLocationSource(input({ foregroundGranted: false })), "off");
    assert.equal(chooseLocationSource(input({ status: "finished" })), "off");
  });
});

describe("backgroundLimit", () => {
  it("explains why background recording isn't available", () => {
    assert.equal(backgroundLimit(input({ backgroundSupported: false })), "expoGo");
    assert.equal(backgroundLimit(input({ backgroundGranted: false })), "permission");
    assert.equal(backgroundLimit(input({})), null);
  });
});

describe("createRelay", () => {
  it("delivers to subscribers until they unsubscribe", () => {
    const relay = createRelay<number>();
    const received: number[] = [];
    const unsubscribe = relay.subscribe((items) => received.push(...items));
    assert.equal(relay.emit([1, 2]), 1);
    unsubscribe();
    assert.equal(relay.emit([3]), 0);
    assert.deepEqual(received, [1, 2]);
  });
});
