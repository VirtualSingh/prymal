import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";

import { getRun, getRunPoints, listRuns } from "./runStore";

export type Loadable<T> =
  | { kind: "loading" }
  | { kind: "ready"; value: T }
  | { kind: "error"; message: string };

// Reloads every time the screen gains focus, so lists are current after a
// run is saved or deleted elsewhere, without a shared cache to keep in sync.
function useFocusedQuery<T>(query: () => Promise<T>) {
  const [state, setState] = useState<Loadable<T>>({ kind: "loading" });
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const id = ++latestRequest.current;
    query()
      .then((value) => {
        if (id === latestRequest.current) setState({ kind: "ready", value });
      })
      .catch((err: unknown) => {
        if (id === latestRequest.current) {
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });
  }, [query]);

  useFocusEffect(load);

  const retry = useCallback(() => {
    setState({ kind: "loading" });
    load();
  }, [load]);

  return { state, retry };
}

/** All saved runs, newest first. */
export function useRuns() {
  const db = useSQLiteContext();
  const query = useCallback(() => listRuns(db), [db]);
  return useFocusedQuery(query);
}

/** One saved run, or null if it doesn't exist (e.g. deleted). */
export function useRun(id: string) {
  const db = useSQLiteContext();
  const query = useCallback(() => getRun(db, id), [db, id]);
  return useFocusedQuery(query);
}

/** A saved run's route points, in recording order. */
export function useRunPoints(id: string) {
  const db = useSQLiteContext();
  const query = useCallback(() => getRunPoints(db, id), [db, id]);
  return useFocusedQuery(query);
}
