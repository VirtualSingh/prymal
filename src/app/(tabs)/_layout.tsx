import { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { StyleSheet, type ColorValue } from "react-native";
import { Tabs } from "expo-router/js-tabs";

import { colors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Filled icon when selected, outline otherwise, so selection is shown by
// shape as well as by color.
function tabIcon(filled: IconName, outline: IconName) {
  return ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) => (
    <Ionicons name={focused ? filled : outline} color={color} size={size} />
  );
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
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: tabIcon("home", "home-outline") }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
          tabBarIcon: tabIcon("footsteps", "footsteps-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("person", "person-outline"),
        }}
      />
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
});
