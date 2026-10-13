import { DarkTheme, Stack, ThemeProvider, type Theme } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/theme";

// Navigation chrome uses Prymal colors so screen transitions never flash the
// default light background.
const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.borderSubtle,
  },
};

// Root stack. Today it only holds the tab group; the active-run and
// run-summary screens (Milestone 3+) will be pushed on top of it.
export default function RootLayout() {
  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
