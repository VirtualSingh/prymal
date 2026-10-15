// Runs runStore's real SQL against a real SQLite database (Node's built-in
// node:sqlite) through a small adapter with the parts of the expo-sqlite
// API that runStore uses. This checks the schema, transactions, cascades,
// and crash recovery without a phone. It doesn't test expo-sqlite itself.
/// <reference types="node" />
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

import type { SQLiteDatabase } from "expo-sqlite";

import {
  initialRunSession,
  runSessionReducer,
  type RunAction,
  type RunSession,
} from "../run/runSession.ts";
import {
  deleteAllRuns,
  deleteRun,
  getRunPoints,
  initDatabase,
  listRuns,
  recoverInterruptedRun,
  saveFinishedSession,
  writeCheckpoint,
} from "./runStore.ts";

type Params = SQLInputValue[];

function openTestDb() {
  const raw = new DatabaseSync(":memory:");
  const adapter = {
    async execAsync(sql: string) {
      raw.exec(sql);
    },
    async getFirstAsync<T>(sql: string, params: Params = []) {
      return (raw.prepare(sql).get(...params) ?? null) as T | null;
    },
    async getAllAsync<T>(sql: string, params: Params = []) {
      return raw.prepare(sql).all(...params) as T[];
    },
    async runAsync(sql: string, params: Params = []) {
      const r = raw.prepare(sql).run(...params);
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async prepareAsync(sql: string) {
      const stmt = raw.prepare(sql);
      return {
        async executeAsync(params: Params) {
          stmt.run(...params);
        },
        async finalizeAsync() {},
      };
    },
    async withExclusiveTransactionAsync(task: (txn: unknown) => Promise<void>) {
      raw.exec("BEGIN EXCLUSIVE");
      try {
        await task(adapter);
        raw.exec("COMMIT");
      } catch (err) {
        raw.exec("ROLLBACK");
        throw err;
      }
    },
  };
  const count = (sql: string) =>
    (raw.prepare(sql).get() as { n: number }).n;
  return { db: adapter as unknown as SQLiteDatabase, raw, count };
}

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

const finishedRun = () =>
  apply([
    { type: "start", at: 1_000 },
    sampleAt(0, 2_000),
    sampleAt(30, 12_000),
    sampleAt(60, 22_000),
    { type: "finish", at: 31_000 },
  ]);

describe("runStore (real SQLite)", () => {
  it("creates the schema once and is safe to re-run", async () => {
    const { db, raw } = openTestDb();
    await initDatabase(db);
    await initDatabase(db);
    const version = raw.prepare("PRAGMA user_version").get() as {
      user_version: number;
    };
    assert.equal(version.user_version, 1);
    const tables = raw
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((r) => (r as { name: string }).name);
    assert.deepEqual(tables, ["active_run", "run_points", "runs"]);
  });

  it("saves a finished run with its points and lists it", async () => {
    const { db, count } = openTestDb();
    await initDatabase(db);
    await saveFinishedSession(db, finishedRun(), "run_a");

    const runs = await listRuns(db);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].id, "run_a");
    assert.equal(runs[0].durationMs, 30_000);
    assert.ok(Math.abs(runs[0].distanceM - 60) < 0.5);
    assert.equal(runs[0].routePointCount, 3);
    assert.equal(runs[0].recovered, false);
    assert.equal(count("SELECT COUNT(*) AS n FROM run_points"), 3);
  });

  it("retrying a save with the same id doesn't duplicate anything", async () => {
    const { db, count } = openTestDb();
    await initDatabase(db);
    await saveFinishedSession(db, finishedRun(), "run_a");
    await saveFinishedSession(db, finishedRun(), "run_a");
    assert.equal(count("SELECT COUNT(*) AS n FROM runs"), 1);
    assert.equal(count("SELECT COUNT(*) AS n FROM run_points"), 3);
  });

  it("lists newest first", async () => {
    const { db } = openTestDb();
    await initDatabase(db);
    const later = apply([
      { type: "start", at: 100_000 },
      { type: "finish", at: 110_000 },
    ]);
    await saveFinishedSession(db, finishedRun(), "older");
    await saveFinishedSession(db, later, "newer");
    assert.deepEqual(
      (await listRuns(db)).map((r) => r.id),
      ["newer", "older"],
    );
  });

  it("deleting a run deletes its points (foreign key cascade)", async () => {
    const { db, count } = openTestDb();
    await initDatabase(db);
    await saveFinishedSession(db, finishedRun(), "run_a");
    await deleteRun(db, "run_a");
    assert.equal(count("SELECT COUNT(*) AS n FROM runs"), 0);
    assert.equal(count("SELECT COUNT(*) AS n FROM run_points"), 0);
  });

  it("a successful save clears the in-progress checkpoint", async () => {
    const { db, count } = openTestDb();
    await initDatabase(db);
    await writeCheckpoint(db, apply([{ type: "start", at: 0 }]), 5_000);
    await saveFinishedSession(db, finishedRun(), "run_a");
    assert.equal(count("SELECT COUNT(*) AS n FROM active_run"), 0);
  });

  it("a failed save rolls back and keeps the checkpoint", async () => {
    const { db, count } = openTestDb();
    await initDatabase(db);
    const good = finishedRun();
    await writeCheckpoint(db, good, 31_000);
    // A point with a null latitude violates NOT NULL mid-transaction.
    const broken: RunSession = structuredClone(good);
    (broken.track.segments[0][1] as { latitude: unknown }).latitude = null;
    await assert.rejects(saveFinishedSession(db, broken, "run_bad"));
    assert.equal(count("SELECT COUNT(*) AS n FROM runs"), 0);
    assert.equal(count("SELECT COUNT(*) AS n FROM run_points"), 0);
    assert.equal(count("SELECT COUNT(*) AS n FROM active_run"), 1);
  });

  it("recovers a run in progress at its checkpoint time on next launch", async () => {
    const { db, count } = openTestDb();
    await initDatabase(db);
    const inProgress = apply([
      { type: "start", at: 0 },
      sampleAt(0, 1_000),
      sampleAt(40, 11_000),
    ]);
    await writeCheckpoint(db, inProgress, 15_000);

    // App restarts: initDatabase runs recovery.
    await initDatabase(db);
    const runs = await listRuns(db);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].recovered, true);
    assert.equal(runs[0].durationMs, 15_000);
    assert.ok(Math.abs(runs[0].distanceM - 40) < 0.5);
    assert.equal(count("SELECT COUNT(*) AS n FROM active_run"), 0);
    assert.equal(await recoverInterruptedRun(db), null, "nothing left to recover");
  });

  it("recovers a finished run whose save didn't complete", async () => {
    const { db } = openTestDb();
    await initDatabase(db);
    await writeCheckpoint(db, finishedRun(), 31_000);
    await initDatabase(db);
    const runs = await listRuns(db);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].durationMs, 30_000);
  });

  it("returns a run's points in recording order", async () => {
    const { db } = openTestDb();
    await initDatabase(db);
    const s = apply([
      { type: "start", at: 0 },
      sampleAt(0, 1_000),
      sampleAt(30, 11_000),
      { type: "pause", at: 12_000 },
      { type: "resume", at: 20_000 },
      sampleAt(100, 21_000),
      { type: "finish", at: 30_000 },
    ]);
    await saveFinishedSession(db, s, "run_a");
    const points = await getRunPoints(db, "run_a");
    assert.deepEqual(
      points.map((p) => [p.segment, p.seq, p.timestamp]),
      [
        [0, 0, 1_000],
        [0, 1, 11_000],
        [1, 0, 21_000],
      ],
    );
    assert.equal(points[0].accuracyM, 5);
    assert.deepEqual(await getRunPoints(db, "missing"), []);
  });

  it("delete all removes runs, points, and the checkpoint", async () => {
    const { db, count } = openTestDb();
    await initDatabase(db);
    await saveFinishedSession(db, finishedRun(), "run_a");
    await saveFinishedSession(db, finishedRun(), "run_b");
    await writeCheckpoint(db, apply([{ type: "start", at: 0 }]), 1_000);
    await deleteAllRuns(db);
    assert.equal(count("SELECT COUNT(*) AS n FROM runs"), 0);
    assert.equal(count("SELECT COUNT(*) AS n FROM run_points"), 0);
    assert.equal(count("SELECT COUNT(*) AS n FROM active_run"), 0);
  });

  it("discards a corrupt checkpoint instead of failing start-up", async () => {
    const { db, raw, count } = openTestDb();
    await initDatabase(db);
    raw.exec(
      "INSERT INTO active_run (id, session_json, checkpoint_at) VALUES (1, '{bad', 0)",
    );
    await initDatabase(db);
    assert.equal(count("SELECT COUNT(*) AS n FROM runs"), 0);
    assert.equal(count("SELECT COUNT(*) AS n FROM active_run"), 0);
  });
});
