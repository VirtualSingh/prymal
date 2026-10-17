// What the run screen says about GPS. Pure, so it's unit-tested.

export type GpsSignal =
  | { kind: "off" }
  | { kind: "searching" }
  /** `at`: when the reading arrived (epoch ms, phone clock). */
  | { kind: "ready"; accuracyM: number | null; at: number }
  | { kind: "error"; message: string };

/** Readings with a larger error radius than this are flagged as weak. */
export const WEAK_ACCURACY_M = 20;

/**
 * While recording, no reading for this long means the signal is lost (a
 * tunnel, indoors, location switched off), even though the last reading
 * may have been good. Readings normally arrive every ~1 s.
 */
export const GPS_LOST_MS = 10_000;

export type GpsStatusView = {
  text: string;
  icon: "navigate" | "warning-outline" | "search" | "location-outline";
  /** Needs the runner's attention. */
  warn: boolean;
};

export type GpsStatusInput = {
  signal: GpsSignal;
  now: number;
  recording: boolean;
  /** Foreground location permission, and phone location on. */
  locationAvailable: boolean;
};

export function describeGpsStatus(input: GpsStatusInput): GpsStatusView {
  const { signal, now, recording, locationAvailable } = input;

  if (!locationAvailable) {
    return {
      text: "Location is off for Prymal. Distance is paused.",
      icon: "location-outline",
      warn: true,
    };
  }

  switch (signal.kind) {
    case "error":
      return {
        text: `GPS unavailable: ${signal.message}`,
        icon: "warning-outline",
        warn: true,
      };
    case "off":
    case "searching":
      return recording
        ? {
            text: "Searching for GPS… distance starts when it's found.",
            icon: "search",
            warn: true,
          }
        : { text: "Searching for GPS…", icon: "search", warn: false };
    case "ready": {
      if (recording && now - signal.at > GPS_LOST_MS) {
        return {
          text: "GPS signal lost. Distance resumes when it's back.",
          icon: "warning-outline",
          warn: true,
        };
      }
      if (signal.accuracyM === null) {
        return { text: "GPS connected", icon: "navigate", warn: false };
      }
      const radius = `±${Math.round(signal.accuracyM)} m`;
      return signal.accuracyM > WEAK_ACCURACY_M
        ? { text: `GPS signal weak · ${radius}`, icon: "warning-outline", warn: true }
        : { text: `GPS good · ${radius}`, icon: "navigate", warn: false };
    }
  }
}
