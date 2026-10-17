// Which way the run screen gets GPS readings. Pure, so it's unit-tested.
//
// - "background": Android foreground service via expo-task-manager. Keeps
//   recording when the user switches apps or locks the screen. Needs the
//   app's own build (not Expo Go) and "Allow all the time" permission.
// - "foreground": watchPositionAsync. Stops when the app leaves the screen.
//   Used before Start (to show GPS signal), while paused, and as the
//   fallback when background recording isn't possible.
// - "off": no location use.

import type { RunStatus } from "../run/runSession.ts";

export type LocationSource = "off" | "foreground" | "background";

export type LocationSourceInput = {
  status: RunStatus;
  foregroundGranted: boolean;
  /** False in Expo Go, which can't run Android foreground services. */
  backgroundSupported: boolean;
  backgroundGranted: boolean;
};

export function chooseLocationSource(input: LocationSourceInput): LocationSource {
  const { status, foregroundGranted, backgroundSupported, backgroundGranted } = input;
  if (!foregroundGranted || status === "finished") return "off";
  if (status === "recording" && backgroundSupported && backgroundGranted) {
    return "background";
  }
  return "foreground";
}

/** Why a recording run can't continue in the background, or null if it can. */
export type BackgroundLimit = "expoGo" | "permission" | null;

export function backgroundLimit(input: LocationSourceInput): BackgroundLimit {
  if (!input.backgroundSupported) return "expoGo";
  if (!input.backgroundGranted) return "permission";
  return null;
}

// Relay from the background task (defined at module scope, outside React)
// to the mounted run screen. If nothing is listening (e.g. the screen is
// gone), readings are dropped.

type Listener<T> = (items: T[]) => void;

export function createRelay<T>() {
  const listeners = new Set<Listener<T>>();
  return {
    emit(items: T[]): number {
      for (const listener of listeners) listener(items);
      return listeners.size;
    },
    subscribe(listener: Listener<T>): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
