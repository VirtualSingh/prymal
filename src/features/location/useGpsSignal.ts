import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

import type { GpsSample } from "@/features/run/track";
import {
  backgroundReadings,
  startBackgroundUpdates,
  stopBackgroundUpdates,
  toGpsSample,
} from "./backgroundLocation";
import type { GpsSignal } from "./gpsStatus";
import type { LocationSource } from "./locationSource";

export type { GpsSignal } from "./gpsStatus";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

type Handlers = {
  deliver: (sample: GpsSample) => void;
  fail: (message: string) => void;
  isCancelled: () => boolean;
};

/** Foreground watcher; returns its cleanup. */
function startForegroundWatcher({ deliver, fail, isCancelled }: Handlers) {
  let subscription: Location.LocationSubscription | null = null;
  // watchPositionAsync resolves asynchronously: if cleanup already ran,
  // remove the subscription as soon as it arrives instead of leaking it.
  let stopped = false;
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
      if (stopped || isCancelled()) sub.remove();
      else subscription = sub;
    })
    .catch((err: unknown) => fail(errorMessage(err)));
  return () => {
    stopped = true;
    subscription?.remove();
  };
}

// Delivers GPS readings from the chosen source (see locationSource.ts),
// reports signal quality, and passes each reading to `onSample`.
// Coordinates are never logged.
//
// Exactly one source is active at a time; switching source tears the old
// one down first. If the background service can't start (e.g. permission
// changed, or the phone refused), it falls back to the foreground watcher,
// so the run keeps recording while Prymal is open, and reports it via
// `backgroundFailed`.
export function useGpsSignal(
  source: LocationSource,
  onSample?: (sample: GpsSample) => void,
) {
  const [signal, setSignal] = useState<GpsSignal>({ kind: "off" });
  const [activeSource, setActiveSource] = useState<LocationSource>("off");
  const [backgroundFailed, setBackgroundFailed] = useState(false);

  // Read the latest callback without restarting the source when it changes.
  const onSampleRef = useRef(onSample);
  useEffect(() => {
    onSampleRef.current = onSample;
  }, [onSample]);

  useEffect(() => {
    setBackgroundFailed(false);
    setActiveSource(source);
    if (source === "off") {
      setSignal({ kind: "off" });
      return;
    }

    let cancelled = false;
    const handlers: Handlers = {
      deliver: (sample) => {
        if (cancelled) return;
        setSignal({ kind: "ready", accuracyM: sample.accuracyM, at: Date.now() });
        onSampleRef.current?.(sample);
      },
      fail: (message) => {
        if (!cancelled) setSignal({ kind: "error", message });
      },
      isCancelled: () => cancelled,
    };
    // Keep showing the last known signal when switching source mid-run.
    setSignal((prev) => (prev.kind === "ready" ? prev : { kind: "searching" }));

    if (source === "foreground") {
      const stop = startForegroundWatcher(handlers);
      return () => {
        cancelled = true;
        stop();
      };
    }

    let stopFallback: (() => void) | null = null;
    const unsubscribe = backgroundReadings.subscribe((samples) =>
      samples.forEach(handlers.deliver),
    );
    startBackgroundUpdates().catch(() => {
      if (cancelled) return;
      unsubscribe();
      stopBackgroundUpdates().catch(() => {});
      setBackgroundFailed(true);
      setActiveSource("foreground");
      stopFallback = startForegroundWatcher(handlers);
    });
    return () => {
      cancelled = true;
      unsubscribe();
      stopFallback?.();
      stopBackgroundUpdates().catch(() => {});
    };
  }, [source]);

  return { signal, activeSource, backgroundFailed };
}
