import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme";

type ScreenProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

// Shared tab-screen shell: dark background, top safe area, scrollable content.
// The tab bar handles the bottom inset, so only top/left/right are applied.
export function Screen({ title, subtitle, children }: ScreenProps) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.xs,
  },
});
