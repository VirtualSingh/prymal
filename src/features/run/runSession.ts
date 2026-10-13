// Pure run-session state machine: idle → recording ⇄ paused → finished.
//
// Elapsed time is derived from wall-clock timestamps (Date.now()) rather than
// counted timer ticks, so it stays correct when JS timers are throttled, the
// app is backgrounded, or the screen sleeps. Transitions that don't make sense
// for the current status (e.g. "pause" while idle) return the same state, so a
// double tap can't corrupt the session.

export type RunStatus = "idle" | "recording" | "paused" | "finished";

export type RunSession = {
  status: RunStatus;
  /** When the run was first started (epoch ms). */
  startedAt: number | null;
  /** Start of the current recording segment; null unless recording. */
  segmentStartedAt: number | null;
  /** Total of all completed recording segments. */
  accumulatedMs: number;
  finishedAt: number | null;
};

export type RunAction =
  | { type: "start"; at: number }
  | { type: "pause"; at: number }
  | { type: "resume"; at: number }
  | { type: "finish"; at: number }
  | { type: "reset" };

export const initialRunSession: RunSession = {
  status: "idle",
  startedAt: null,
  segmentStartedAt: null,
  accumulatedMs: 0,
  finishedAt: null,
};

// Clamp at zero so a wall clock moved backwards can't produce negative time.
function currentSegmentMs(session: RunSession, at: number): number {
  if (session.segmentStartedAt === null) return 0;
  return Math.max(0, at - session.segmentStartedAt);
}

export function runSessionReducer(
  session: RunSession,
  action: RunAction,
): RunSession {
  switch (action.type) {
    case "start":
      if (session.status !== "idle") return session;
      return {
        ...session,
        status: "recording",
        startedAt: action.at,
        segmentStartedAt: action.at,
      };

    case "pause":
      if (session.status !== "recording") return session;
      return {
        ...session,
        status: "paused",
        accumulatedMs: session.accumulatedMs + currentSegmentMs(session, action.at),
        segmentStartedAt: null,
      };

    case "resume":
      if (session.status !== "paused") return session;
      return { ...session, status: "recording", segmentStartedAt: action.at };

    case "finish":
      if (session.status !== "recording" && session.status !== "paused") {
        return session;
      }
      return {
        ...session,
        status: "finished",
        accumulatedMs: session.accumulatedMs + currentSegmentMs(session, action.at),
        segmentStartedAt: null,
        finishedAt: action.at,
      };

    case "reset":
      return initialRunSession;
  }
}

export function getElapsedMs(session: RunSession, now: number): number {
  return (
    session.accumulatedMs +
    (session.status === "recording" ? currentSegmentMs(session, now) : 0)
  );
}

/** "mm:ss" under an hour, "h:mm:ss" from an hour up. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
