import * as Location from "expo-location";
import { useEffect, useState } from "react";

export type GpsSignal =
  | { kind: "off" }
  | { kind: "searching" }
  | { kind: "ready"; accuracyM: number | null }
  | { kind: "error"; message: string };

/** Readings with a larger error radius than this are flagged as weak. */
export const WEAK_ACCURACY_M = 20;

// Milestone 3: report GPS signal quality only. Coordinates are deliberately
// not stored or logged; recording route samples starts in Milestone 4.
//
// One watcher per `enabled` period. watchPositionAsync resolves
// asynchronously, so if the effect is cleaned up before it resolves, the
// subscription is removed as soon as it arrives instead of leaking.
export function useGpsSignal(enabled: boolean): GpsSignal {
  const [signal, setSignal] = useState<GpsSignal>({ kind: "off" });

  useEffect(() => {
    if (!enabled) {
      setSignal({ kind: "off" });
      return;
    }

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;
    setSignal({ kind: "searching" });

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => {
        if (!cancelled) {
          setSignal({ kind: "ready", accuracyM: location.coords.accuracy });
        }
      },
      (reason) => {
        if (!cancelled) setSignal({ kind: "error", message: reason });
      },
    )
      .then((sub) => {
        if (cancelled) sub.remove();
        else subscription = sub;
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSignal({
            kind: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  return signal;
}
