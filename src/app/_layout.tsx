import {
  DarkTheme,
  Stack,
  ThemeProvider,
  type ErrorBoundaryProps,
  type Theme,
} from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { DATABASE_NAME, initDatabase } from "@/features/runs/runStore";
import { colors, spacing } from "@/theme";

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

// Root stack: the tab group, with the run screen presented over it full
// screen (no tab bar while running) and run details pushed on top.
//
// SQLiteProvider opens the local database and runs initDatabase (migrations
// + recovery of a run interrupted by the app closing) before any screen
// renders. If that fails, the error reaches the ErrorBoundary below.
export default function RootLayout() {
  return (
    <ThemeProvider value={navTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="run"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="activity/[id]" />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={styles.errorRoot}>
      <View style={styles.errorBody}>
        <Text style={styles.errorTitle} accessibilityRole="header">
          Something went wrong
        </Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <Button label="Try again" onPress={retry} />
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorBody: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
});
