import { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing } from "@/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: ComponentProps<typeof Ionicons>["name"];
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  accessibilityHint,
}: ButtonProps) {
  const primary = variant === "primary";
  const textColor = primary ? colors.textOnAccent : colors.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <Ionicons name={icon} size={22} color={textColor} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
  },
});
