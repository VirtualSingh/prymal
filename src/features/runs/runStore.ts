// Local run storage (expo-sqlite). Saved data never leaves the device.
//
// Tables:
//   runs        one row per saved run: the derived summary
//   run_points  accepted GPS route points per run (deleted with the run)
//   active_run  at most one row: a checkpoint of the run in progress, used
//               to recover it if the app is closed mid-run
import type { SQLiteDatabase } from "expo-sqlite";

import type { RunSession } from "@/features/run/runSession";
import {
  buildRunRecord,
  finishRecoveredSession,
  newRunId,
  parseSessionSnapshot,
  type RunPointRecord,
  type RunRecord,
} from "./runRecord.ts";

export const DATABASE_NAME = "prymal.db";
const DATABASE_VERSION = 1;

/**
 * Passed to SQLiteProvider's onInit: migrate, then recover any run that was
 * in progress when the app last closed. Module-level so its identity is
 * stable (SQLiteProvider re-initialises if onInit changes).
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;

  if (version < 1) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(`
        CREATE TABLE IF NOT EXISTS runs (
          id TEXT PRIMARY KEY NOT NULL,
          started_at INTEGER NOT NULL,
          finished_at INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL,
          distance_m REAL NOT NULL,
          route_point_count INTEGER NOT NULL,
          ignored_reading_count INTEGER NOT NULL,
          recovered INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS runs_started_at ON runs (started_at DESC);
        CREATE TABLE IF NOT EXISTS run_points (
          run_id TEXT NOT NULL REFERENCES runs (id) ON DELETE CASCADE,
          segment INTEGER NOT NULL,
          seq INTEGER NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          accuracy_m REAL NOT NULL,
          recorded_at INTEGER NOT NULL,
          PRIMARY KEY (run_id, segment, seq)
        );
        CREATE TABLE IF NOT EXISTS active_run (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          session_json TEXT NOT NULL,
          checkpoint_at INTEGER NOT NULL
        );
        PRAGMA user_version = ${DATABASE_VERSION};
      `);
    });
  }

  await recoverInterruptedRun(db);
}

type RunRow = {
  id: string;
  started_at: number;
  finished_at: number;
  duration_ms: number;
  distance_m: number;
  route_point_count: number;
  ignored_reading_count: number;
  recovered: number;
};

function toRunRecord(row: RunRow): RunRecord {
  return {
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMs: row.duration_ms,
    distanceM: row.distance_m,
    routePointCount: row.route_point_count,
    ignoredReadingCount: row.ignored_reading_count,
    recovered: row.recovered === 1,
  };
}

/** Save a run and its points atomically, and clear the in-progress checkpoint. */
async function saveRun(
  db: SQLiteDatabase,
  run: RunRecord,
  points: RunPointRecord[],
): Promise<void> {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT OR REPLACE INTO runs (id, started_at, finished_at, duration_ms,
         distance_m, route_point_count, ignored_reading_count, recovered,
         created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        run.id,
        run.startedAt,
        run.finishedAt,
        run.durationMs,
        run.distanceM,
        run.routePointCount,
        run.ignoredReadingCount,
        run.recovered ? 1 : 0,
        Date.now(),
      ],
    );
    // Retrying a save with the same id must not duplicate points.
    await txn.runAsync("DELETE FROM run_points WHERE run_id = ?", [run.id]);
    const insertPoint = await txn.prepareAsync(
      `INSERT INTO run_points (run_id, segment, seq, latitude, longitude,
         accuracy_m, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    try {
      for (const p of points) {
        await insertPoint.executeAsync([
          run.id,
          p.segment,
          p.seq,
          p.latitude,
          p.longitude,
          p.accuracyM,
          p.timestamp,
        ]);
      }
    } finally {
      await insertPoint.finalizeAsync();
    }
    await txn.runAsync("DELETE FROM active_run");
  });
}

/** Save a finished session under `id`. Throws if the session isn't finished. */
export async function saveFinishedSession(
  db: SQLiteDatabase,
  session: RunSession,
  id: string,
): Promise<void> {
  const record = buildRunRecord(session, id);
  if (!record) throw new Error("Only a finished run can be saved.");
  await saveRun(db, record.run, record.points);
}

export async function listRuns(db: SQLiteDatabase): Promise<RunRecord[]> {
  const rows = await db.getAllAsync<RunRow>(
    "SELECT * FROM runs ORDER BY started_at DESC",
  );
  return rows.map(toRunRecord);
}

export async function getRun(
  db: SQLiteDatabase,
  id: string,
): Promise<RunRecord | null> {
  const row = await db.getFirstAsync<RunRow>("SELECT * FROM runs WHERE id = ?", [
    id,
  ]);
  return row ? toRunRecord(row) : null;
}

export async function deleteRun(db: SQLiteDatabase, id: string): Promise<void> {
  // run_points rows go with it (ON DELETE CASCADE).
  await db.runAsync("DELETE FROM runs WHERE id = ?", [id]);
}

export async function writeCheckpoint(
  db: SQLiteDatabase,
  session: RunSession,
  checkpointAt: number,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO active_run (id, session_json, checkpoint_at)
     VALUES (1, ?, ?)`,
    [JSON.stringify(session), checkpointAt],
  );
}

export async function clearCheckpoint(db: SQLiteDatabase): Promise<void> {
  await db.runAsync("DELETE FROM active_run");
}

/**
 * If the app closed mid-run, save that run (finished at its last
 * checkpoint, marked recovered) and clear the checkpoint.
 * Returns the recovered run id, or null.
 */
export async function recoverInterruptedRun(
  db: SQLiteDatabase,
): Promise<string | null> {
  const row = await db.getFirstAsync<{
    session_json: string;
    checkpoint_at: number;
  }>("SELECT session_json, checkpoint_at FROM active_run WHERE id = 1");
  if (!row) return null;

  const snapshot = parseSessionSnapshot(row.session_json);
  const finished = snapshot
    ? finishRecoveredSession(snapshot, row.checkpoint_at)
    : null;
  const record =
    finished && finished.startedAt !== null
      ? buildRunRecord(finished, newRunId(finished.startedAt), true)
      : null;

  if (!record) {
    await clearCheckpoint(db);
    return null;
  }
  await saveRun(db, record.run, record.points);
  return record.run.id;
}
