import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform } from "react-native";

import { backgroundTrackingSupported } from "./backgroundLocation";

export type LocationAccess =
  | { kind: "checking" }
  | { kind: "undetermined" }
  | { kind: "denied"; canAskAgain: boolean }
  | { kind: "servicesOff" }
  | { kind: "granted" }
  | { kind: "error"; message: string };

/**
 * "Allow all the time", needed to keep recording while the runner uses other
 * apps. "unsupported" in Expo Go, which can't record in the background.
 */
export type BackgroundAccess = "unsupported" | "unknown" | "granted" | "notGranted";

type Snapshot = { access: LocationAccess; background: BackgroundAccess };

async function readBackground(): Promise<BackgroundAccess> {
  if (!backgroundTrackingSupported) return "unsupported";
  const permission = await Location.getBackgroundPermissionsAsync();
  return permission.granted ? "granted" : "notGranted";
}

async function readSnapshot(
  permission: Location.LocationPermissionResponse,
): Promise<Snapshot> {
  if (permission.granted) {
    const [servicesOn, background] = await Promise.all([
      Location.hasServicesEnabledAsync(),
      readBackground(),
    ]);
    return {
      access: servicesOn ? { kind: "granted" } : { kind: "servicesOff" },
      background,
    };
  }
  const background: BackgroundAccess = backgroundTrackingSupported
    ? "notGranted"
    : "unsupported";
  if (permission.status === Location.PermissionStatus.UNDETERMINED) {
    return { access: { kind: "undetermined" }, background };
  }
  return {
    access: { kind: "denied", canAskAgain: permission.canAskAgain },
    background,
  };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Location permissions for runs. Checking never prompts; system dialogs
// appear only from request()/requestBackground(), after the run screen has
// explained why. Re-checks when the app returns to the foreground, so coming
// back from Settings updates the screen without a restart.
export function useLocationPermission() {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    access: { kind: "checking" },
    background: "unknown",
  });
  // Only the latest check may update state, so a slow, stale check can't
  // overwrite a newer result.
  const latestCheck = useRef(0);

  const run = useCallback(
    async (getPermission: () => Promise<Location.LocationPermissionResponse>) => {
      const id = ++latestCheck.current;
      try {
        const next = await readSnapshot(await getPermission());
        if (id === latestCheck.current) setSnapshot(next);
      } catch (err) {
        if (id === latestCheck.current) {
          setSnapshot((prev) => ({
            ...prev,
            access: { kind: "error", message: errorMessage(err) },
          }));
        }
      }
    },
    [],
  );

  const check = useCallback(() => run(Location.getForegroundPermissionsAsync), [run]);
  const request = useCallback(
    () => run(Location.requestForegroundPermissionsAsync),
    [run],
  );

  // On Android 11+ this opens the system settings page, where the user picks
  // "Allow all the time"; the AppState re-check picks up the result.
  const requestBackground = useCallback(async () => {
    try {
      await Location.requestBackgroundPermissionsAsync();
    } catch {
      // Falls through to the re-check, which reports the actual state.
    }
    await check();
  }, [check]);

  const turnOnLocation = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        // Shows Android's in-app "turn on location" dialog.
        await Location.enableNetworkProviderAsync();
      } catch {
        // User declined the dialog; the re-check below reports servicesOff.
      }
    } else {
      await Linking.openSettings();
    }
    await check();
  }, [check]);

  const openSettings = useCallback(() => Linking.openSettings(), []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      latestCheck.current++; // ignore any check still in flight
      sub.remove();
    };
  }, [check]);

  return {
    access: snapshot.access,
    background: snapshot.background,
    check,
    request,
    requestBackground,
    turnOnLocation,
    openSettings,
  };
}
