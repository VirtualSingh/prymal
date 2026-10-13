// Design tokens from DESIGN.md §3. Keep colors here rather than hard-coding
// them across components so the palette can be tuned in one place.
export const colors = {
  background: "#111411",
  surface: "#20241F",
  accent: "#DFFF69",
  textPrimary: "#FFFFFF",
  textSecondary: "#A2A69A",
  borderSubtle: "#343A30",
  textOnAccent: "#17200B",
  textOnAccentSecondary: "#34401F",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  md: 16,
  lg: 24,
  pill: 999,
} as const;
