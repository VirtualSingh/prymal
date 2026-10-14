import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { EmptyState, RouteGlyph } from "@/components/EmptyState";
import { RunListItem } from "@/components/RunListItem";
import { ScreenHeader, screenStyles } from "@/components/Screen";
import { useRuns } from "@/features/runs/useRuns";
import { colors, spacing } from "@/theme";

// Saved runs, newest first. FlatList keeps long histories smooth by only
// rendering rows near the screen.
export function ActivitiesScreen() {
  const { state, retry } = useRuns();
  const runs = state.kind === "ready" ? state.value : [];

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={screenStyles.root}>
      <FlatList
        data={runs}
        keyExtractor={(run) => run.id}
        renderItem={({ item }) => <RunListItem run={item} />}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={screenStyles.content}
        ListHeaderComponent={
          <ScreenHeader
            title="Activities"
            subtitle={
              state.kind === "ready" && runs.length > 0
                ? `${runs.length} ${runs.length === 1 ? "run" : "runs"}`
                : "Your run history"
            }
          />
        }
        ListEmptyComponent={
          state.kind === "loading" ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : state.kind === "error" ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                Couldn't load your runs: {state.message}
              </Text>
              <Button label="Try again" variant="secondary" onPress={retry} />
            </View>
          ) : (
            <EmptyState
              decoration={<RouteGlyph />}
              title="No runs yet"
              body="Finish a run and it will be saved here."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: {
    height: spacing.md,
  },
  loading: {
    paddingVertical: spacing.xxl,
  },
  errorBox: {
    gap: spacing.md,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
