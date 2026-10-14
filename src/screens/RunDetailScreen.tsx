import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
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
import {
  averagePaceMsPerKm,
  formatDistanceKm,
  formatDuration,
  formatPace,
  formatRunDateTime,
} from "@/features/run/format";
import type { RunRecord } from "@/features/runs/runRecord";
import { deleteRun } from "@/features/runs/runStore";
import { useRun } from "@/features/runs/useRuns";
import { colors, radii, spacing } from "@/theme";

export function RunDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { state, retry } = useRun(id ?? "");

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle} accessibilityRole="header">
          Run details
        </Text>
        <View style={styles.iconButton} />
      </View>

      {state.kind === "loading" ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : state.kind === "error" ? (
        <View style={styles.centered}>
          <Text style={styles.message}>
            Couldn't load this run: {state.message}
          </Text>
          <Button label="Try again" variant="secondary" onPress={retry} />
        </View>
      ) : state.value === null ? (
        <View style={styles.centered}>
          <Text style={styles.message}>This run no longer exists.</Text>
          <Button label="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      ) : (
        <RunDetails run={state.value} />
      )}
    </SafeAreaView>
  );
}

function RunDetails({ run }: { run: RunRecord }) {
  const db = useSQLiteContext();
  const [deleting, setDeleting] = useState(false);
  const pace = formatPace(averagePaceMsPerKm(run.durationMs, run.distanceM));

  const confirmDelete = () =>
    Alert.alert("Delete this run?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setDeleting(true);
          deleteRun(db, run.id)
            .then(() => router.back())
            .catch((err: unknown) => {
              setDeleting(false);
              Alert.alert(
                "Couldn't delete the run",
                err instanceof Error ? err.message : String(err),
              );
            });
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.when}>{formatRunDateTime(run.startedAt)}</Text>
      <Text
        style={styles.distance}
        accessibilityLabel={`${formatDistanceKm(run.distanceM)} kilometres`}
      >
        {formatDistanceKm(run.distanceM)}
        <Text style={styles.distanceUnit}> km</Text>
      </Text>

      <View style={styles.grid}>
        <Stat label="Duration" value={formatDuration(run.durationMs)} />
        <Stat label="Avg pace" value={pace === "--:--" ? pace : `${pace} /km`} />
        <Stat label="Route points" value={String(run.routePointCount)} />
        <Stat label="Readings ignored" value={String(run.ignoredReadingCount)} />
      </View>

      {run.recovered ? (
        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.noticeText}>
            Saved automatically after Prymal closed during this run. Anything
            after the last automatic save isn't included.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {deleting ? (
          <ActivityIndicator color={colors.textSecondary} />
        ) : (
          <Button
            label="Delete run"
            icon="trash-outline"
            variant="secondary"
            onPress={confirmDelete}
          />
        )}
      </View>
    </ScrollView>
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
  iconButton: {
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  when: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  distance: {
    color: colors.textPrimary,
    fontSize: 56,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    marginTop: spacing.xs,
  },
  distanceUnit: {
    color: colors.textSecondary,
    fontSize: 22,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xl,
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
  notice: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  noticeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: spacing.xxl,
  },
});
