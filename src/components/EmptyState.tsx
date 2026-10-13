import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/theme";

type EmptyStateProps = {
  title: string;
  body: string;
  decoration?: ReactNode;
};

export function EmptyState({ title, body, decoration }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      {decoration ? <View style={styles.decoration}>{decoration}</View> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

// A simple dotted path drawn with Views, so no icon library is needed.
export function RouteGlyph() {
  return (
    <View
      style={styles.routeGlyph}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.routeDot, styles.routeDotStart]} />
      <View style={styles.routeDash} />
      <View style={styles.routeDash} />
      <View style={styles.routeDash} />
      <View style={[styles.routeDot, styles.routeDotEnd]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  decoration: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  routeGlyph: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
