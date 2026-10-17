import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

import type { GpsSample } from "@/features/run/track";
import {
  backgroundReadings,
  startBackgroundUpdates,
  stopBackgroundUpdates,
  toGpsSample,
} from "./backgroundLocation";
import type { LocationSource } from "./locationSource";

export type GpsSignal =
  | { kind: "off" }
  | { kind: "searching" }
  | { kind: "ready"; accuracyM: number | null }
  | { kind: "error"; message: string };

/** Readings with a larger error radius than this are flagged as weak. */
export const WEAK_ACCURACY_M = 20;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Delivers GPS readings from the chosen source (see locationSource.ts),
// reports signal quality, and passes each reading to `onSample`.
// Coordinates are never logged.
//
// Exactly one source is active at a time; switching source tears the old
// one down first. watchPositionAsync resolves asynchronously, so if the
// effect is cleaned up before it resolves, the subscription is removed as
// soon as it arrives instead of leaking.
export function useGpsSignal(
  source: LocationSource,
  onSample?: (sample: GpsSample) => void,
): GpsSignal {
  const [signal, setSignal] = useState<GpsSignal>({ kind: "off" });

  // Read the latest callback without restarting the source when it changes.
  const onSampleRef = useRef(onSample);
  useEffect(() => {
    onSampleRef.current = onSample;
  }, [onSample]);

  useEffect(() => {
    if (source === "off") {
      setSignal({ kind: "off" });
      return;
    }

    let cancelled = false;
    const deliver = (sample: GpsSample) => {
      if (cancelled) return;
      setSignal({ kind: "ready", accuracyM: sample.accuracyM });
      onSampleRef.current?.(sample);
    };
    const fail = (message: string) => {
      if (!cancelled) setSignal({ kind: "error", message });
    };
    // Keep showing the last known signal when switching source mid-run.
    setSignal((prev) => (prev.kind === "ready" ? prev : { kind: "searching" }));

    if (source === "background") {
      const unsubscribe = backgroundReadings.subscribe((samples) =>
        samples.forEach(deliver),
      );
      startBackgroundUpdates().catch((err: unknown) => fail(errorMessage(err)));
      return () => {
        cancelled = true;
        unsubscribe();
        stopBackgroundUpdates().catch(() => {});
      };
    }

    let subscription: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => deliver(toGpsSample(location)),
      fail,
    )
      .then((sub) => {
        if (cancelled) sub.remove();
        else subscription = sub;
      })
      .catch((err: unknown) => fail(errorMessage(err)));

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [source]);

  return signal;
}
