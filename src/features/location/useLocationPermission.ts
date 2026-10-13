import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform } from "react-native";

export type LocationAccess =
  | { kind: "checking" }
  | { kind: "undetermined" }
  | { kind: "denied"; canAskAgain: boolean }
  | { kind: "servicesOff" }
  | { kind: "granted" }
  | { kind: "error"; message: string };

async function readAccess(
  permission: Location.LocationPermissionResponse,
): Promise<LocationAccess> {
  if (permission.granted) {
    const servicesOn = await Location.hasServicesEnabledAsync();
    return servicesOn ? { kind: "granted" } : { kind: "servicesOff" };
  }
  if (permission.status === Location.PermissionStatus.UNDETERMINED) {
    return { kind: "undetermined" };
  }
  return { kind: "denied", canAskAgain: permission.canAskAgain };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Foreground ("while using the app") location only. Checking never prompts;
// the system dialog appears only from request(), after the run screen has
// explained why. Re-checks when the app returns to the foreground, so coming
// back from Settings updates the screen without a restart.
export function useLocationPermission() {
  const [access, setAccess] = useState<LocationAccess>({ kind: "checking" });
  // Only the latest check may update state, so a slow, stale check can't
  // overwrite a newer result.
  const latestCheck = useRef(0);

  const run = useCallback(
    async (getPermission: () => Promise<Location.LocationPermissionResponse>) => {
      const id = ++latestCheck.current;
      try {
        const next = await readAccess(await getPermission());
        if (id === latestCheck.current) setAccess(next);
      } catch (err) {
        if (id === latestCheck.current) {
          setAccess({ kind: "error", message: errorMessage(err) });
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

  return { access, check, request, turnOnLocation, openSettings };
}
