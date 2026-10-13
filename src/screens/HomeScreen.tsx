import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState, RouteGlyph } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { formatDistanceKm, getHomeSummary } from "@/data/homeSummary";
import { colors, radii, spacing } from "@/theme";

export function HomeScreen() {
  const summary = getHomeSummary();

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
          value={formatDistanceKm(summary.weeklyDistanceKm)}
        />
        <StatCard label="Total runs" value={String(summary.totalRuns)} />
      </View>

      <Text style={styles.sectionHeading} accessibilityRole="header">
        Recent activity
      </Text>
      {summary.recentRuns.length === 0 ? (
        <EmptyState
          decoration={<RouteGlyph />}
          title="Your first run starts here"
          body="Complete a run to see your progress."
        />
      ) : null}
    </Screen>
  );
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

  sectionHeading: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
});
