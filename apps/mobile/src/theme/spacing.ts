export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  container: 20,
} as const;

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 24,
  '2xl': 28,
  full: 9999,
} as const;

/** Visible border weights — the "grosor" of the Caja Fuerte system. */
export const strokeWidth = {
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

/** Responsive layout limits shared by phone, tablet and web. */
export const layout = {
  contentMaxWidth: 1120,
  readingMaxWidth: 720,
  wideBreakpoint: 1024,
  touchTarget: 44,
  primaryButtonHeight: 56,
  glyphSize: 48,
} as const;

/** Motion durations in milliseconds. Reduced motion bypasses all of them. */
export const motion = {
  press: 160,
  reveal: 260,
  dial: 480,
  shutter: 340,
  stamp: 320,
  shimmer: 1400,
} as const;
