import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { EmptyState, RouteGlyph } from "@/components/EmptyState";
import { RunListItem } from "@/components/RunListItem";
import { Screen } from "@/components/Screen";
import { formatDistanceKmShort } from "@/features/run/format";
import { summarizeRuns } from "@/features/runs/runRecord";
import { useRuns } from "@/features/runs/useRuns";
import { colors, radii, spacing } from "@/theme";

const RECENT_COUNT = 3;

export function HomeScreen() {
  const { state, retry } = useRuns();
  const runs = state.kind === "ready" ? state.value : null;
  const stats = runs ? summarizeRuns(runs, new Date()) : null;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.wordmark} accessibilityRole="header">
          prymal<Text style={styles.wordmarkDot}>.</Text>
        </Text>
        <Text style={styles.tagline}>YOUR RUNNING JOURNEY</Text>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.eyebrow}>Welcome, runner</Text>
        <Text style={styles.headline} accessibilityRole="header">
          Ready to move?
        </Text>
        <Text style={styles.supporting}>Every run starts somewhere.</Text>
      </View>

      <StartRunCard />

      <View style={styles.statsRow}>
        <StatCard
          label="This week"
          value={stats ? `${formatDistanceKmShort(stats.weeklyDistanceM)} km` : "–"}
        />
        <StatCard
          label="Total runs"
          value={stats ? String(stats.totalRuns) : "–"}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading} accessibilityRole="header">
          Recent activity
        </Text>
        {runs && runs.length > RECENT_COUNT ? (
          <Pressable
            onPress={() => router.navigate("/activities")}
            hitSlop={12}
            accessibilityRole="link"
          >
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        ) : null}
      </View>
      <RecentActivity state={state} onRetry={retry} />
    </Screen>
  );
}

function RecentActivity({
  state,
  onRetry,
}: {
  state: ReturnType<typeof useRuns>["state"];
  onRetry: () => void;
}) {
  switch (state.kind) {
    case "loading":
      return <ActivityIndicator color={colors.accent} style={styles.loading} />;
    case "error":
      return (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Couldn't load your runs: {state.message}
          </Text>
          <Button label="Try again" variant="secondary" onPress={onRetry} />
        </View>
      );
    case "ready":
      if (state.value.length === 0) {
        return (
          <EmptyState
            decoration={<RouteGlyph />}
            title="Your first run starts here"
            body="Complete a run to see your progress."
          />
        );
      }
      return (
        <View style={styles.recentList}>
          {state.value.slice(0, RECENT_COUNT).map((run) => (
            <RunListItem key={run.id} run={run} />
          ))}
        </View>
      );
  }
}

// Opens the run screen. The run doesn't start until the user taps Start
// there, after any location-permission explanation.
function StartRunCard() {
  return (
    <Pressable
      onPress={() => router.push("/run")}
      style={({ pressed }) => [styles.startCard, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Start a run"
      accessibilityHint="Opens the run screen"
    >
      <View style={styles.playCircle}>
        <Ionicons
          name="play"
          size={28}
          color={colors.accent}
          style={styles.playIcon}
        />
      </View>
      <View style={styles.startText}>
        <Text style={styles.startTitle}>Start a run</Text>
        <Text style={styles.startSubtitle}>Track your next adventure</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textOnAccent} />
    </Pressable>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={styles.statCard}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  wordmark: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  wordmarkDot: {
    color: colors.accent,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginTop: spacing.xs,
  },

  welcome: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  headline: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  supporting: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.xs,
  },

  startCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    padding: spacing.xl,
    minHeight: 120,
    marginBottom: spacing.lg,
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.textOnAccent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  // The play glyph looks off-centre in a circle; nudge it right.
  playIcon: {
    marginLeft: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  startText: {
    flex: 1,
  },
  startTitle: {
    color: colors.textOnAccent,
    fontSize: 22,
    fontWeight: "800",
  },
  startSubtitle: {
    color: colors.textOnAccentSecondary,
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginTop: spacing.xs,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  recentList: {
    gap: spacing.md,
  },
  loading: {
    paddingVertical: spacing.xl,
  },
  errorBox: {
    gap: spacing.md,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
