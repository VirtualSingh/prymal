import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

import type { GpsSample } from "@/features/run/track";

export type GpsSignal =
  | { kind: "off" }
  | { kind: "searching" }
  | { kind: "ready"; accuracyM: number | null }
  | { kind: "error"; message: string };

/** Readings with a larger error radius than this are flagged as weak. */
export const WEAK_ACCURACY_M = 20;

// Watches foreground location while `enabled`, reports signal quality, and
// passes each reading to `onSample`. Coordinates are never logged.
//
// One watcher per `enabled` period. watchPositionAsync resolves
// asynchronously, so if the effect is cleaned up before it resolves, the
// subscription is removed as soon as it arrives instead of leaking.
export function useGpsSignal(
  enabled: boolean,
  onSample?: (sample: GpsSample) => void,
): GpsSignal {
  const [signal, setSignal] = useState<GpsSignal>({ kind: "off" });

  // Read the latest callback without restarting the watcher when it changes.
  const onSampleRef = useRef(onSample);
  useEffect(() => {
    onSampleRef.current = onSample;
  }, [onSample]);

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
        if (cancelled) return;
        const { latitude, longitude, accuracy } = location.coords;
        setSignal({ kind: "ready", accuracyM: accuracy });
        onSampleRef.current?.({
          latitude,
          longitude,
          accuracyM: accuracy,
          timestamp: location.timestamp,
        });
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
