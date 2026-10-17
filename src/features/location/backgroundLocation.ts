// Background run recording: an Android foreground service (with a visible
// notification) that keeps delivering GPS readings while the runner uses
// other apps or locks the screen. Needs the app's own build; Expo Go can't
// run it on Android, so nothing here is registered there.
//
// Imported for its side effect from the root layout: expo-task-manager
// requires defineTask "in the global scope of your JavaScript bundle".
import { isRunningInExpoGo } from "expo";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import type { GpsSample } from "@/features/run/track";
import { colors } from "@/theme";
import { createRelay } from "./locationSource";

const TASK_NAME = "prymal-run-location";

export const backgroundTrackingSupported = !isRunningInExpoGo();

/** Readings from the background task, for whoever is recording a run. */
export const backgroundReadings = createRelay<GpsSample>();

export function toGpsSample(location: Location.LocationObject): GpsSample {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracyM: location.coords.accuracy,
    timestamp: location.timestamp,
  };
}

if (backgroundTrackingSupported) {
  TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
    TASK_NAME,
    async ({ data, error }) => {
      // Coordinates are never logged.
      if (error || !data) return;
      backgroundReadings.emit(data.locations.map(toGpsSample));
    },
  );
}

// Start/stop run strictly in order, so a quick stop can't land before a
// pending start and leave the service (and its notification) running.
let queue: Promise<void> = Promise.resolve();
function enqueue(task: () => Promise<void>): Promise<void> {
  const next = queue.then(task);
  queue = next.catch(() => {});
  return next;
}

export function startBackgroundUpdates(): Promise<void> {
  return enqueue(async () => {
    if (await Location.hasStartedLocationUpdatesAsync(TASK_NAME)) return;
    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 0,
      activityType: Location.ActivityType.Fitness,
      pausesUpdatesAutomatically: false,
      foregroundService: {
        notificationTitle: "Prymal is recording your run",
        notificationBody: "Distance keeps counting while you use other apps.",
        notificationColor: colors.accent,
        // If the app is swiped away, stop the service too: the run in
        // memory is gone (it's recovered from its checkpoint on next
        // launch), so tracking on would only drain the battery.
        killServiceOnDestroy: true,
      },
    });
  });
}

export function stopBackgroundUpdates(): Promise<void> {
  return enqueue(async () => {
    if (!backgroundTrackingSupported) return;
    if (await Location.hasStartedLocationUpdatesAsync(TASK_NAME)) {
      await Location.stopLocationUpdatesAsync(TASK_NAME);
    }
  });
}
