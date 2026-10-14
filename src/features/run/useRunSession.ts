import { useCallback, useEffect, useReducer, useState } from "react";

import {
  getElapsedMs,
  initialRunSession,
  runSessionReducer,
} from "./runSession";
import type { GpsSample } from "./track";

// Ties the pure reducer to React and a display clock. Exactly one interval
// exists, and only while recording; it's cleared whenever status changes or
// the screen unmounts, so timers can't pile up across pause/resume. The
// interval only re-renders the clock: elapsed time comes from timestamps.
const TICK_MS = 250;

export function useRunSession() {
  const [session, dispatch] = useReducer(runSessionReducer, initialRunSession);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (session.status !== "recording") return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [session.status]);

  const start = useCallback(() => dispatch({ type: "start", at: Date.now() }), []);
  const pause = useCallback(() => dispatch({ type: "pause", at: Date.now() }), []);
  const resume = useCallback(() => dispatch({ type: "resume", at: Date.now() }), []);
  const finish = useCallback(() => dispatch({ type: "finish", at: Date.now() }), []);
  // Safe to call any time: the reducer ignores readings unless recording.
  const addSample = useCallback(
    (sample: GpsSample) =>
      dispatch({ type: "sample", sample, receivedAt: Date.now() }),
    [],
  );

  return {
    session,
    elapsedMs: getElapsedMs(session, now),
    start,
    pause,
    resume,
    finish,
    addSample,
  };
}
