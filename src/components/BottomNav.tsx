import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../theme";

type NavItem = {
  key: "home" | "activities" | "profile";
  label: string;
  available: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Home", available: true },
  { key: "activities", label: "Activities", available: false },
  { key: "profile", label: "Profile", available: false },
];

// Presentational only for Milestone 1: there is a single screen, so nothing
// here is pressable. Unavailable destinations are labelled "Soon" so they
// don't read as broken buttons. Real navigation arrives in Milestone 2.
export function BottomNav({ active }: { active: NavItem["key"] }) {
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.bar}>
      <View style={styles.row} accessibilityRole="tablist">
        {NAV_ITEMS.map((item) => {
          const selected = item.key === active;
          return (
            <View
              key={item.key}
              style={styles.item}
              accessible
              accessibilityRole="tab"
              accessibilityLabel={
                item.available ? item.label : `${item.label}, coming soon`
              }
              accessibilityState={{ selected, disabled: !item.available }}
            >
              <View
                style={[styles.indicator, selected && styles.indicatorActive]}
              />
              <Text
                style={[styles.label, selected && styles.labelActive]}
                maxFontSizeMultiplier={1.4}
              >
                {item.label}
              </Text>
              {!item.available && (
                <Text style={styles.soon} maxFontSizeMultiplier={1.4}>
                  Soon
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  row: {
    flexDirection: "row",
  },
  item: {
    flex: 1,
    alignItems: "center",
    minHeight: 60,
    paddingBottom: spacing.sm,
  },
  indicator: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: spacing.sm,
    backgroundColor: "transparent",
  },
  indicatorActive: {
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.accent,
  },
  soon: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
