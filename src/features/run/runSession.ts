// Pure run-session state machine: idle → recording ⇄ paused → finished.
//
// Elapsed time is derived from wall-clock timestamps (Date.now()) rather than
// counted timer ticks, so it stays correct when JS timers are throttled, the
// app is backgrounded, or the screen sleeps. Transitions that don't make sense
// for the current status (e.g. "pause" while idle) return the same state, so a
// double tap can't corrupt the session.
//
// GPS readings only count while recording. Each resume starts a new route
// segment, so ground covered while paused isn't added to the distance.

import {
  addSample,
  emptyTrack,
  startNewSegment,
  type GpsSample,
  type TrackState,
} from "./track.ts";

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
  track: TrackState;
};

export type RunAction =
  | { type: "start"; at: number }
  | { type: "pause"; at: number }
  | { type: "resume"; at: number }
  | { type: "finish"; at: number }
  | { type: "sample"; sample: GpsSample; receivedAt: number }
  | { type: "reset" };

export const initialRunSession: RunSession = {
  status: "idle",
  startedAt: null,
  segmentStartedAt: null,
  accumulatedMs: 0,
  finishedAt: null,
  track: emptyTrack,
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
        track: emptyTrack,
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
      return {
        ...session,
        status: "recording",
        segmentStartedAt: action.at,
        track: startNewSegment(session.track),
      };

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

    case "sample": {
      if (session.status !== "recording") return session;
      const track = addSample(session.track, action.sample, action.receivedAt);
      return track === session.track ? session : { ...session, track };
    }

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
