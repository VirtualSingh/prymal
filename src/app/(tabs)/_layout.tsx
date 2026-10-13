import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router/js-tabs";

import { colors } from "@/theme";

// No icon library yet: each tab's "icon" is a short lime bar shown above the
// selected label, so selection isn't conveyed by label color alone.
function TabIndicator({ focused }: { focused: boolean }) {
  return <View style={[styles.indicator, focused && styles.indicatorActive]} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      // Android back from Activities/Profile returns to Home, then exits.
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused }) => <TabIndicator focused={focused} />,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="activities" options={{ title: "Activities" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderSubtle,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  indicator: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  indicatorActive: {
    backgroundColor: colors.accent,
  },
});
