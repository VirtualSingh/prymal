import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import type { RunSession } from "@/features/run/runSession";
import { newRunId } from "./runRecord";
import {
  clearCheckpoint,
  saveFinishedSession,
  writeCheckpoint,
} from "./runStore";

export type SaveState =
  | { kind: "notSaved" }
  | { kind: "saving" }
  | { kind: "saved"; id: string }
  | { kind: "error"; message: string };

/** How often the in-progress run is checkpointed while recording. */
const CHECKPOINT_INTERVAL_MS = 15_000;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Persists the run screen's session:
// - while recording/paused: checkpoints on every status change, every 15 s,
//   and when the app leaves the foreground, so a killed app can recover it;
// - once finished: checkpoints the final state, then saves it (auto-save,
//   so finishing can't lose the run);
// - discard(): drops the checkpoint.
//
// All writes go through one promise queue, so they happen in order. This
// matters: a checkpoint landing after the final save would bring the run
// back as a duplicate "recovered" run on the next launch.
export function useRunPersistence(session: RunSession) {
  const db = useSQLiteContext();
  const [saveState, setSaveState] = useState<SaveState>({ kind: "notSaved" });

  const latest = useRef(session);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const runId = useRef<string | null>(null);

  // Declared first so the effects below always see the current session.
  useEffect(() => {
    latest.current = session;
  }, [session]);

  const enqueue = useCallback((task: () => Promise<void>) => {
    const next = queue.current.then(task);
    // Keep the queue alive after a failure; callers handle their own errors.
    queue.current = next.catch(() => {});
    return next;
  }, []);

  const checkpoint = useCallback(() => {
    const s = latest.current;
    if (s.status !== "recording" && s.status !== "paused") return;
    const at = Date.now();
    // A failed checkpoint only weakens crash recovery; the run continues.
    enqueue(() => writeCheckpoint(db, s, at)).catch(() => {});
  }, [db, enqueue]);

  const save = useCallback(() => {
    const s = latest.current;
    if (s.status !== "finished" || s.startedAt === null) return;
    runId.current ??= newRunId(s.startedAt);
    const id = runId.current;
    setSaveState({ kind: "saving" });
    // Checkpoint the finished run first: if the save fails, the full run
    // (not one up to 15 s stale) is recovered on the next launch. A
    // successful save deletes this checkpoint in the same transaction.
    enqueue(() => writeCheckpoint(db, s, s.finishedAt ?? Date.now())).catch(
      () => {},
    );
    enqueue(() => saveFinishedSession(db, s, id))
      .then(() => setSaveState({ kind: "saved", id }))
      .catch((err: unknown) =>
        setSaveState({ kind: "error", message: errorMessage(err) }),
      );
  }, [db, enqueue]);

  const { status } = session;

  useEffect(() => {
    if (status === "recording" || status === "paused") checkpoint();
    else if (status === "finished") save();
  }, [status, checkpoint, save]);

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(checkpoint, CHECKPOINT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status, checkpoint]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") checkpoint();
    });
    return () => sub.remove();
  }, [checkpoint]);

  const discard = useCallback(
    () => enqueue(() => clearCheckpoint(db)).catch(() => {}),
    [db, enqueue],
  );

  return { saveState, retrySave: save, discard };
}
