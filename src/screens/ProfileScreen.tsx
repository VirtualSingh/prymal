import { Ionicons } from "@react-native-vector-icons/ionicons";
import Constants from "expo-constants";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import {
  formatDistanceKm,
  formatDistanceKmShort,
  formatDuration,
  formatPace,
} from "@/features/run/format";
import { lifetimeStats, type RunRecord } from "@/features/runs/runRecord";
import { deleteAllRuns } from "@/features/runs/runStore";
import { useRuns } from "@/features/runs/useRuns";
import { colors, radii, spacing } from "@/theme";

// No accounts yet (see ROADMAP Milestone 7), so the profile is about this
// phone: lifetime stats, what happens to your data, and deleting it.
export function ProfileScreen() {
  const { state, retry } = useRuns();

  return (
    <Screen title="Profile" subtitle="Your running so far">
      {state.kind === "loading" ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      ) : state.kind === "error" ? (
        <View style={styles.errorBox}>
          <Text style={styles.body}>Couldn't load your runs: {state.message}</Text>
          <Button label="Try again" variant="secondary" onPress={retry} />
        </View>
      ) : (
        <LifetimeStatsGrid runs={state.value} />
      )}

      <PrivacyCard />

      {state.kind === "ready" && state.value.length > 0 ? (
        <DeleteAllRuns count={state.value.length} onDeleted={retry} />
      ) : null}

      <Text style={styles.version}>
        Prymal {Constants.expoConfig?.version ?? ""}
      </Text>
    </Screen>
  );
}

function LifetimeStatsGrid({ runs }: { runs: RunRecord[] }) {
  const stats = lifetimeStats(runs);
  return (
    <View style={styles.grid}>
      <Stat label="Runs" value={String(stats.runCount)} />
      <Stat
        label="Total distance"
        value={`${formatDistanceKmShort(stats.totalDistanceM)} km`}
      />
      <Stat label="Total time" value={formatDuration(stats.totalDurationMs)} />
      <Stat
        label="Longest run"
        value={`${formatDistanceKm(stats.longestRunM)} km`}
      />
      <Stat
        label="Fastest pace (1 km+)"
        value={
          stats.fastestPaceMsPerKm === null
            ? "--:--"
            : `${formatPace(stats.fastestPaceMsPerKm)} /km`
        }
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Every statement here must stay true; update it when sync is added or
// location use changes.
function PrivacyCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
        <Text style={styles.cardTitle} accessibilityRole="header">
          Your data
        </Text>
      </View>
      <Text style={styles.body}>
        Your runs and routes are stored only on this phone. Prymal doesn't
        upload or share them.
      </Text>
      <Text style={styles.body}>
        Showing a route map downloads map images of that area from Google
        Maps.
      </Text>
      <Text style={styles.body}>
        Location is used only during runs. If you allow it "all the time",
        a run keeps recording while you use other apps, with a notification
        showing. Nothing is recorded outside a run.
      </Text>
    </View>
  );
}

function DeleteAllRuns({
  count,
  onDeleted,
}: {
  count: number;
  onDeleted: () => void;
}) {
  const db = useSQLiteContext();
  const [deleting, setDeleting] = useState(false);

  const confirm = () =>
    Alert.alert(
      "Delete all runs?",
      `This permanently deletes ${count} ${count === 1 ? "run" : "runs"} and their routes from this phone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: () => {
            setDeleting(true);
            deleteAllRuns(db)
              .then(onDeleted)
              .catch((err: unknown) =>
                Alert.alert(
                  "Couldn't delete runs",
                  err instanceof Error ? err.message : String(err),
                ),
              )
              .finally(() => setDeleting(false));
          },
        },
      ],
    );

  return (
    <View style={styles.dangerZone}>
      {deleting ? (
        <ActivityIndicator color={colors.textSecondary} />
      ) : (
        <Button
          label="Delete all runs"
          icon="trash-outline"
          variant="secondary"
          onPress={confirm}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: spacing.xl,
  },
  errorBox: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  stat: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  card: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  dangerZone: {
    marginTop: spacing.xl,
  },
  version: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
});
