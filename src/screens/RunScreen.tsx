import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router, useNavigation } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import {
  useGpsSignal,
  WEAK_ACCURACY_M,
  type GpsSignal,
} from "@/features/location/useGpsSignal";
import {
  useLocationPermission,
  type LocationAccess,
} from "@/features/location/useLocationPermission";
import {
  averagePaceMsPerKm,
  formatDistanceKm,
  formatDuration,
  formatPace,
} from "@/features/run/format";
import type { RunStatus } from "@/features/run/runSession";
import { routePointCount } from "@/features/run/track";
import { useRunSession } from "@/features/run/useRunSession";
import { colors, radii, spacing } from "@/theme";

export function RunScreen() {
  const permission = useLocationPermission();
  const { session, elapsedMs, start, pause, resume, finish, addSample } =
    useRunSession();
  const { status, track } = session;
  const inProgress = status === "recording" || status === "paused";
  const gps = useGpsSignal(
    permission.access.kind === "granted" && status !== "finished",
    addSample,
  );
  const pace = averagePaceMsPerKm(elapsedMs, track.distanceM);

  useDiscardGuard(inProgress);

  const confirmFinish = () =>
    Alert.alert("Finish run?", "You won't be able to resume it.", [
      { text: "Keep going", style: "cancel" },
      { text: "Finish", onPress: finish },
    ]);

  // The permission flow only gates starting. If access changes mid-run, the
  // timer keeps going and the GPS row reports the problem.
  const showPermissionGate =
    status === "idle" && permission.access.kind !== "granted";

  return (
    <SafeAreaView style={styles.root}>
      {inProgress ? <KeepScreenOn /> : null}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={inProgress ? "Discard run and close" : "Close"}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle} accessibilityRole="header">
          Run
        </Text>
        <View style={styles.closeButton} />
      </View>

      {showPermissionGate ? (
        <PermissionGate
          access={permission.access}
          onAllow={permission.request}
          onOpenSettings={permission.openSettings}
          onTurnOnLocation={permission.turnOnLocation}
          onRetry={permission.check}
        />
      ) : status === "finished" ? (
        <FinishedPanel
          elapsedMs={elapsedMs}
          distanceM={track.distanceM}
          pace={pace}
          routePoints={routePointCount(track)}
          ignoredReadings={track.ignoredCount}
        />
      ) : (
        <>
          <View style={styles.body}>
            <StatusBadge status={status} />
            <Text
              style={styles.timer}
              numberOfLines={1}
              adjustsFontSizeToFit
              accessibilityLabel={`Elapsed time ${formatDuration(elapsedMs)}`}
            >
              {formatDuration(elapsedMs)}
            </Text>
            <Text style={styles.timerLabel}>Duration</Text>
            <RunStats distanceM={track.distanceM} pace={pace} />
            <GpsStatus signal={gps} />
          </View>

          <View style={styles.controls}>
            {status === "idle" ? (
              <Button label="Start" icon="play" onPress={start} />
            ) : (
              <>
                {status === "recording" ? (
                  <Button
                    label="Pause"
                    icon="pause"
                    variant="secondary"
                    onPress={pause}
                  />
                ) : (
                  <Button label="Resume" icon="play" onPress={resume} />
                )}
                <Button
                  label="Finish"
                  icon="stop"
                  variant="secondary"
                  onPress={confirmFinish}
                />
              </>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

// Keeps the display on while mounted. GPS updates stop when the screen locks
// (foreground-only tracking), so the run screen stays on during a run.
function KeepScreenOn() {
  useKeepAwake("prymal-run", { suppressDeactivateWarnings: true });
  return null;
}

function RunStats({ distanceM, pace }: { distanceM: number; pace: number | null }) {
  return (
    <View style={styles.statsRow}>
      <Stat label="Distance" value={formatDistanceKm(distanceM)} unit="km" />
      <View style={styles.statsDivider} />
      <Stat label="Avg pace" value={formatPace(pace)} unit="/km" />
    </View>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View
      style={styles.stat}
      accessible
      accessibilityLabel={`${label} ${value === "--:--" ? "not available yet" : `${value} ${unit}`}`}
    >
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// While a run is in progress, intercept every way of leaving the screen
// (close button, Android back, gestures) and ask before discarding it.
function useDiscardGuard(active: boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!active) return;
    return navigation.addListener("beforeRemove", (event) => {
      event.preventDefault();
      Alert.alert(
        "Discard this run?",
        "It hasn't been saved. Leaving now will discard it.",
        [
          { text: "Keep running", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(event.data.action),
          },
        ],
      );
    });
  }, [navigation, active]);
}

function PermissionGate({
  access,
  onAllow,
  onOpenSettings,
  onTurnOnLocation,
  onRetry,
}: {
  access: LocationAccess;
  onAllow: () => void;
  onOpenSettings: () => void;
  onTurnOnLocation: () => void;
  onRetry: () => void;
}) {
  if (access.kind === "checking" || access.kind === "granted") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const content = (() => {
    switch (access.kind) {
      case "undetermined":
      case "denied":
        if (access.kind === "undetermined" || access.canAskAgain) {
          return {
            title: "Allow location to track your run",
            body:
              "Prymal uses your location only while this run screen is open, " +
              "to measure your run. It isn't tracked in the background or shared.",
            action: <Button label="Allow location" onPress={onAllow} />,
          };
        }
        return {
          title: "Location is blocked for Prymal",
          body:
            "To track runs, allow location for Prymal in your phone's settings, " +
            "then come back here.",
          action: <Button label="Open settings" onPress={onOpenSettings} />,
        };
      case "servicesOff":
        return {
          title: "Your phone's location is off",
          body: "Turn on location to track runs.",
          action: (
            <Button label="Turn on location" onPress={onTurnOnLocation} />
          ),
        };
      case "error":
        return {
          title: "Couldn't check location access",
          body: access.message,
          action: <Button label="Try again" onPress={onRetry} />,
        };
    }
  })();

  return (
    <View style={styles.gate}>
      <View style={styles.gateIcon}>
        <Ionicons name="location-outline" size={36} color={colors.accent} />
      </View>
      <Text style={styles.gateTitle} accessibilityRole="header">
        {content.title}
      </Text>
      <Text style={styles.gateBody}>{content.body}</Text>
      <View style={styles.gateActions}>
        {content.action}
        <Button
          label="Not now"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: RunStatus }) {
  const label =
    status === "recording"
      ? "Recording"
      : status === "paused"
        ? "Paused"
        : "Ready to start";
  return (
    <View
      style={[styles.badge, status === "recording" && styles.badgeRecording]}
      accessibilityLabel={`Run status: ${label}`}
    >
      {status === "recording" ? <View style={styles.recordingDot} /> : null}
      {status === "paused" ? (
        <Ionicons name="pause" size={14} color={colors.textPrimary} />
      ) : null}
      <Text
        style={[
          styles.badgeText,
          status === "recording" && styles.badgeTextRecording,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function describeGps(signal: GpsSignal): {
  text: string;
  icon: "navigate" | "warning-outline" | "search";
  warn: boolean;
} {
  switch (signal.kind) {
    case "off":
    case "searching":
      return { text: "Searching for GPS…", icon: "search", warn: false };
    case "ready": {
      if (signal.accuracyM === null) {
        return { text: "GPS connected", icon: "navigate", warn: false };
      }
      const radius = `±${Math.round(signal.accuracyM)} m`;
      return signal.accuracyM > WEAK_ACCURACY_M
        ? { text: `GPS signal weak · ${radius}`, icon: "warning-outline", warn: true }
        : { text: `GPS good · ${radius}`, icon: "navigate", warn: false };
    }
    case "error":
      return {
        text: `GPS unavailable: ${signal.message}`,
        icon: "warning-outline",
        warn: true,
      };
  }
}

function GpsStatus({ signal }: { signal: GpsSignal }) {
  const { text, icon, warn } = describeGps(signal);
  const color = warn ? colors.accent : colors.textSecondary;
  return (
    <View style={styles.gpsRow} accessible accessibilityLabel={text}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.gpsText, { color }]}>{text}</Text>
    </View>
  );
}

function FinishedPanel({
  elapsedMs,
  distanceM,
  pace,
  routePoints,
  ignoredReadings,
}: {
  elapsedMs: number;
  distanceM: number;
  pace: number | null;
  routePoints: number;
  ignoredReadings: number;
}) {
  return (
    <>
      <View style={styles.body}>
        <Ionicons name="checkmark-circle" size={56} color={colors.accent} />
        <Text style={styles.finishedTitle} accessibilityRole="header">
          Run complete
        </Text>
        <Text style={styles.timer} numberOfLines={1} adjustsFontSizeToFit>
          {formatDuration(elapsedMs)}
        </Text>
        <Text style={styles.timerLabel}>Duration</Text>
        <RunStats distanceM={distanceM} pace={pace} />
        {/* Shown to help judge GPS quality while filtering is being tuned. */}
        <Text style={styles.gpsSummary}>
          GPS: {routePoints} route points · {ignoredReadings} readings ignored
        </Text>
        <Text style={styles.note}>
          This run isn't saved yet. Saving runs arrives in a later update.
        </Text>
      </View>
      <View style={styles.controls}>
        <Button label="Done" onPress={() => router.back()} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    minHeight: 56,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  timer: {
    color: colors.textPrimary,
    fontSize: 80,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    marginTop: spacing.lg,
  },
  timerLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  note: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  gpsSummary: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.lg,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  statsDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.borderSubtle,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  statUnit: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  controls: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  badgeRecording: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textOnAccent,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  badgeTextRecording: {
    color: colors.textOnAccent,
  },

  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  gpsText: {
    fontSize: 15,
    fontWeight: "600",
  },

  finishedTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginTop: spacing.md,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gate: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  gateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  gateTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
  },
  gateBody: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.md,
  },
  gateActions: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
});
