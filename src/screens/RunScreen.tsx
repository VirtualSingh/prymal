import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router, useNavigation } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { useEffect, useRef, type RefObject } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { backgroundTrackingSupported } from "@/features/location/backgroundLocation";
import {
  describeGpsStatus,
  type GpsStatusView,
} from "@/features/location/gpsStatus";
import { useGpsSignal } from "@/features/location/useGpsSignal";
import {
  backgroundLimit,
  chooseLocationSource,
  type BackgroundLimit,
  type LocationSourceInput,
} from "@/features/location/locationSource";
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
import { isTooShortToSave, type RunStatus } from "@/features/run/runSession";
import { routePointCount } from "@/features/run/track";
import { useRunSession } from "@/features/run/useRunSession";
import {
  useRunPersistence,
  type SaveState,
} from "@/features/runs/useRunPersistence";
import { colors, radii, spacing } from "@/theme";

export function RunScreen() {
  const permission = useLocationPermission();
  const { session, now, elapsedMs, start, pause, resume, finish, addSample } =
    useRunSession();
  const { status, track } = session;
  const inProgress = status === "recording" || status === "paused";
  const sourceInput: LocationSourceInput = {
    status,
    foregroundGranted: permission.access.kind === "granted",
    backgroundSupported: backgroundTrackingSupported,
    backgroundGranted: permission.background === "granted",
  };
  const limit = backgroundLimit(sourceInput);
  const gps = useGpsSignal(chooseLocationSource(sourceInput), addSample);
  // Background recording isn't possible or didn't start: GPS stops if the
  // screen locks, so keep it on during the run.
  const foregroundOnly = limit !== null || gps.backgroundFailed;
  const gpsView = describeGpsStatus({
    signal: gps.signal,
    now,
    recording: status === "recording",
    locationAvailable: permission.access.kind === "granted",
  });
  const pace = averagePaceMsPerKm(elapsedMs, track.distanceM);
  const persistence = useRunPersistence(session);
  // Set when the user already chose to discard, so leaving doesn't ask twice.
  const leaveConfirmed = useRef(false);

  useDiscardGuard(inProgress, persistence.discard, leaveConfirmed);

  const confirmStart = () => {
    if (gps.signal.kind === "ready") {
      start();
      return;
    }
    Alert.alert(
      "No GPS signal yet",
      "You can start now: the timer runs and distance starts counting once GPS is found (usually within a minute outdoors).",
      [
        { text: "Wait", style: "cancel" },
        { text: "Start anyway", onPress: start },
      ],
    );
  };

  const discardRun = () => {
    leaveConfirmed.current = true;
    persistence.discard();
    router.back();
  };

  const confirmFinish = () => {
    if (isTooShortToSave(elapsedMs, track.distanceM)) {
      Alert.alert(
        "Very short run",
        "This run is under a minute and under 100 m. Save it anyway?",
        [
          { text: "Keep going", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: discardRun },
          { text: "Save", onPress: finish },
        ],
      );
      return;
    }
    Alert.alert("Finish run?", "You won't be able to resume it.", [
      { text: "Keep going", style: "cancel" },
      { text: "Finish", onPress: finish },
    ]);
  };

  // The permission flow only gates starting. If access changes mid-run, the
  // timer keeps going and the GPS row reports the problem.
  const showPermissionGate =
    status === "idle" && permission.access.kind !== "granted";

  return (
    <SafeAreaView style={styles.root}>
      {inProgress && foregroundOnly ? <KeepScreenOn /> : null}
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
          saveState={persistence.saveState}
          onRetrySave={persistence.retrySave}
        />
      ) : (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
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
            <GpsStatus view={gpsView} />
            {status === "idle" && permission.background === "notGranted" ? (
              <BackgroundPermissionCard
                onAllow={permission.requestBackground}
                onOpenSettings={permission.openSettings}
              />
            ) : (
              <BackgroundNote
                status={status}
                limit={limit}
                backgroundActive={gps.activeSource === "background"}
                backgroundFailed={gps.backgroundFailed}
              />
            )}
          </ScrollView>

          <View style={styles.controls}>
            {status === "idle" ? (
              <Button label="Start" icon="play" onPress={confirmStart} />
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

// Keeps the display on while mounted. Only used when the run can't record
// in the background (Expo Go, or "Allow all the time" not granted): then GPS
// stops when the screen locks, so the screen stays on during the run.
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
function useDiscardGuard(
  active: boolean,
  onDiscard: () => void,
  leaveConfirmed: RefObject<boolean>,
) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!active) return;
    return navigation.addListener("beforeRemove", (event) => {
      if (leaveConfirmed.current) return;
      event.preventDefault();
      Alert.alert(
        "Discard this run?",
        "It hasn't been saved. Leaving now will discard it.",
        [
          { text: "Keep running", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              leaveConfirmed.current = true;
              onDiscard();
              navigation.dispatch(event.data.action);
            },
          },
        ],
      );
    });
  }, [navigation, active, onDiscard, leaveConfirmed]);
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
              "Prymal uses your location during a run to measure distance and " +
              "map your route. It isn't used outside runs or shared.",
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.gate}>
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
    </ScrollView>
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

// Shown before Start in the app's own build when "Allow all the time" isn't
// granted. Running without it still works, but stops if the user switches
// apps, so it's offered, not required.
function BackgroundPermissionCard({
  onAllow,
  onOpenSettings,
}: {
  onAllow: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <View style={styles.bgCard}>
      <Text style={styles.bgTitle} accessibilityRole="header">
        Keep recording in other apps
      </Text>
      <Text style={styles.bgBody}>
        To keep counting distance while you use Spotify, YouTube or other
        apps, set Prymal's location access to "Allow all the time". Prymal
        only uses it while a run is recording, and shows a notification
        while it does.
      </Text>
      <Button label="Allow all the time" variant="secondary" onPress={onAllow} />
      <Pressable onPress={onOpenSettings} hitSlop={8} accessibilityRole="link">
        <Text style={styles.bgLink}>Open app settings</Text>
      </Pressable>
    </View>
  );
}

// States only what's actually happening: while recording, the line about
// switching apps depends on the background service really running, not on
// whether it should be.
function BackgroundNote({
  status,
  limit,
  backgroundActive,
  backgroundFailed,
}: {
  status: RunStatus;
  limit: BackgroundLimit;
  backgroundActive: boolean;
  backgroundFailed: boolean;
}) {
  const ok = (
    <Text style={styles.bgNote}>Recording continues if you switch apps.</Text>
  );
  const warn = (text: string) => (
    <Text style={[styles.bgNote, styles.bgWarn]}>{text}</Text>
  );

  switch (status) {
    case "finished":
      return null;
    case "idle":
      return limit === null ? ok : null;
    case "paused":
      // Recording is stopped anyway; only warn about what happens on resume.
      return limit === null && !backgroundFailed
        ? null
        : warn("After you resume, keep Prymal open: it can't record in other apps.");
    case "recording":
      if (backgroundActive) return ok;
      if (backgroundFailed) {
        return warn(
          "Background recording couldn't start. Keep Prymal open: distance still counts while it's on screen.",
        );
      }
      return warn(
        limit === "expoGo"
          ? "Keep Prymal open: Expo Go can't record in the background."
          : 'Keep Prymal open: without "Allow all the time", recording stops in other apps.',
      );
  }
}

function GpsStatus({ view }: { view: GpsStatusView }) {
  const { text, icon, warn } = view;
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
  saveState,
  onRetrySave,
}: {
  elapsedMs: number;
  distanceM: number;
  pace: number | null;
  routePoints: number;
  ignoredReadings: number;
  saveState: SaveState;
  onRetrySave: () => void;
}) {
  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
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
        <SaveStatus saveState={saveState} />
      </ScrollView>
      <View style={styles.controls}>
        {saveState.kind === "error" ? (
          <Button label="Try saving again" onPress={onRetrySave} />
        ) : null}
        {saveState.kind === "saved" ? (
          <Button
            label="View run"
            variant="secondary"
            onPress={() => router.replace(`/activity/${saveState.id}`)}
          />
        ) : null}
        <Button
          label="Done"
          variant={saveState.kind === "error" ? "secondary" : "primary"}
          onPress={() => router.back()}
        />
      </View>
    </>
  );
}

function SaveStatus({ saveState }: { saveState: SaveState }) {
  switch (saveState.kind) {
    case "notSaved":
    case "saving":
      return (
        <View style={styles.saveRow}>
          <ActivityIndicator color={colors.textSecondary} size="small" />
          <Text style={styles.note}>Saving…</Text>
        </View>
      );
    case "saved":
      return (
        <View style={styles.saveRow} accessible accessibilityLiveRegion="polite">
          <Ionicons name="checkmark" size={16} color={colors.accent} />
          <Text style={[styles.note, styles.saved]}>Saved to Activities</Text>
        </View>
      );
    case "error":
      // The checkpoint survives a failed save, so the run is recovered on
      // the next app launch even if the user leaves now.
      return (
        <Text style={[styles.note, styles.saveError]} accessibilityLiveRegion="polite">
          Couldn't save this run ({saveState.message}). Try again, or it will
          be recovered next time you open Prymal.
        </Text>
      );
  }
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

  // Scrollable so small screens and large font sizes don't clip content;
  // flexGrow keeps it vertically centred when it does fit.
  scroll: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
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
  bgCard: {
    alignSelf: "stretch",
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  bgTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  bgBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  bgLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  bgNote: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.md,
  },
  bgWarn: {
    color: colors.textPrimary,
  },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  saved: {
    color: colors.accent,
    fontWeight: "700",
    marginTop: 0,
  },
  saveError: {
    color: colors.textPrimary,
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
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
