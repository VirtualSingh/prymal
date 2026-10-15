import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { routeRegion, routeSegments } from "@/features/runs/routeGeometry";
import type { RunPointRecord } from "@/features/runs/runRecord";
import { colors, radii, spacing } from "@/theme";

// Static preview of a saved route: Google Maps on Android (no API key needed
// in Expo Go; a store/development build needs one, see PROGRESS.md).
// Gestures are off so the map doesn't fight the page's scrolling. The map
// is local to this phone; routes are not shared anywhere.
export function RouteMap({ points }: { points: RunPointRecord[] }) {
  const segments = useMemo(() => routeSegments(points), [points]);
  const region = useMemo(() => routeRegion(segments.flat()), [segments]);

  if (!region || points.length < 2) {
    return (
      <View style={[styles.frame, styles.empty]}>
        <Text style={styles.emptyText}>
          No route to show. GPS didn't record enough points for this run.
        </Text>
      </View>
    );
  }

  const start = segments[0][0];
  const lastSegment = segments[segments.length - 1];
  const finish = lastSegment[lastSegment.length - 1];

  return (
    <View
      style={styles.frame}
      accessible
      accessibilityLabel="Map of your route"
      importantForAccessibility="yes"
    >
      <View style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          userInterfaceStyle="dark"
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          showsPointsOfInterests={false}
          loadingEnabled
          loadingBackgroundColor={colors.surface}
          loadingIndicatorColor={colors.accent}
        >
          {segments.map((coordinates, i) =>
            coordinates.length > 1 ? (
              <Polyline
                key={i}
                coordinates={coordinates}
                strokeColor={colors.accent}
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            ) : null,
          )}
          <Marker coordinate={start} anchor={{ x: 0.5, y: 0.5 }} title="Start">
            <View style={[styles.dot, styles.startDot]} />
          </Marker>
          <Marker coordinate={finish} anchor={{ x: 0.5, y: 0.5 }} title="Finish">
            <View style={[styles.dot, styles.finishDot]} />
          </Marker>
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 220,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
  startDot: {
    backgroundColor: colors.background,
    borderColor: colors.textPrimary,
  },
  finishDot: {
    backgroundColor: colors.accent,
    borderColor: colors.background,
  },
});
