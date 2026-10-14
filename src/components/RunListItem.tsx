import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  averagePaceMsPerKm,
  formatDistanceKm,
  formatDuration,
  formatPace,
  formatRunDateTime,
} from "@/features/run/format";
import type { RunRecord } from "@/features/runs/runRecord";
import { colors, radii, spacing } from "@/theme";

export function RunListItem({ run }: { run: RunRecord }) {
  const distance = formatDistanceKm(run.distanceM);
  const duration = formatDuration(run.durationMs);
  const pace = formatPace(averagePaceMsPerKm(run.durationMs, run.distanceM));
  const when = formatRunDateTime(run.startedAt);

  return (
    <Pressable
      onPress={() => router.push(`/activity/${run.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Run on ${when}. ${distance} kilometres in ${duration}.${
        run.recovered ? " Recovered run." : ""
      }`}
      accessibilityHint="Opens run details"
    >
      <View style={styles.main}>
        <View style={styles.titleRow}>
          <Text style={styles.when} numberOfLines={1}>
            {when}
          </Text>
          {run.recovered ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Recovered</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.distance}>
          {distance}
          <Text style={styles.unit}> km</Text>
        </Text>
        <Text style={styles.meta}>
          {duration} · {pace} /km
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    minHeight: 64,
  },
  pressed: {
    opacity: 0.8,
  },
  main: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  when: {
    flexShrink: 1,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  distance: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    marginTop: spacing.xs,
  },
  unit: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    marginTop: 2,
  },
});
