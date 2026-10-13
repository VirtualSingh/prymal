import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "../components/BottomNav";
import { formatDistanceKm, getHomeSummary } from "../data/homeSummary";
import { colors, radii, spacing } from "../theme";

export function HomeScreen() {
  const summary = getHomeSummary();

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.main}>
        <ScrollView contentContainerStyle={styles.content}>
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
            <View style={styles.emptyCard}>
              <RouteGlyph />
              <Text style={styles.emptyTitle}>Your first run starts here</Text>
              <Text style={styles.emptyBody}>
                Complete a run to see your progress.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
      <BottomNav active="home" />
    </View>
  );
}

// Run tracking doesn't exist yet (ROADMAP Milestone 3), so this is a
// non-pressable surface that says so, rather than a button that does nothing.
function StartRunCard() {
  return (
    <View
      style={styles.startCard}
      accessible
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      accessibilityLabel="Start a run. Coming soon, run tracking is not available yet."
    >
      <View style={styles.playCircle}>
        <View style={styles.playTriangle} />
      </View>
      <View style={styles.startText}>
        <Text style={styles.startTitle}>Start a run</Text>
        <Text style={styles.startSubtitle}>Track your next adventure</Text>
        <View style={styles.soonPill}>
          <Text style={styles.soonPillText}>Run tracking coming soon</Text>
        </View>
      </View>
    </View>
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

// A simple dotted path drawn with Views, so no icon library is needed.
function RouteGlyph() {
  return (
    <View style={styles.routeGlyph} importantForAccessibility="no-hide-descendants">
      <View style={[styles.routeDot, styles.routeDotStart]} />
      <View style={styles.routeDash} />
      <View style={styles.routeDash} />
      <View style={styles.routeDash} />
      <View style={[styles.routeDot, styles.routeDotEnd]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

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
  // Classic border trick for a right-pointing triangle.
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 16,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: colors.accent,
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
  soonPill: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.textOnAccentSecondary,
  },
  soonPillText: {
    color: colors.textOnAccent,
    fontSize: 12,
    fontWeight: "700",
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
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  routeGlyph: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeDotStart: {
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  routeDotEnd: {
    backgroundColor: colors.accent,
  },
  routeDash: {
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderSubtle,
  },
});
