import { Appearance } from 'react-native';

/**
 * Finance Flow — two deliberately distinct themes for Android, iOS and web.
 *
 * Dark is derived from `assets/icon.png`: navy `#0B1326`, logo purple
 * `#8B3BE1` for solid actions and borders, cyan `#06B6D4` as secondary.
 * Light keeps the original Caja Fuerte palette: sage canvas `#E9EFEC` with
 * signal orange `#B8430A` / `#C2410C` for the same roles, blue secondary and
 * mint/coral ledger signals. The user chose this split explicitly.
 *
 * Every historical `ThemeColors` key is retained, including `actionBorder`
 * (logo purple in dark, signal orange in light). Text roles use accessible
 * tints so both themes stay at WCAG 2.2 AA. Screens must read colours through
 * `useTheme()`, never through literals.
 */
const darkPalette = {
  background: '#0B1326',
  surface: '#111D36',
  surfaceDim: '#080E1C',
  surfaceBright: '#182747',
  surfaceContainer: '#111D36',
  surfaceContainerHigh: '#182747',
  surfaceContainerHighest: '#223259',
  surfaceContainerLow: '#0E1830',
  surfaceContainerLowest: '#070C18',

  // Former signal orange → logo purple.
  primary: '#B98CFF',
  primaryContainer: '#2E1A52',
  onPrimary: '#0B1326',
  onPrimaryContainer: '#D6C2FF',
  primarySolid: '#8B3BE1',
  onPrimarySolid: '#FFFFFF',
  inversePrimary: '#943DDB',
  actionBorder: '#8B3BE1',

  // Former blue → logo cyan.
  secondary: '#06B6D4',
  secondaryContainer: '#083344',
  onSecondary: '#0B1326',
  onSecondaryContainer: '#A5F3FC',

  tertiary: '#F0A6D8',
  tertiaryContainer: '#4A1538',
  onTertiary: '#0B1326',
  onTertiaryContainer: '#FBCFE8',

  error: '#FDA4AF',
  errorContainer: '#46152D',
  onError: '#2A0A18',
  onErrorContainer: '#FFD6E5',

  success: '#5EEAD4',
  successContainer: '#083A36',
  onSuccessContainer: '#B7F7E9',
  warning: '#8B3BE1',

  info: '#06B6D4',
  infoContainer: '#083344',
  onInfo: '#0B1326',

  onBackground: '#F2F6FF',
  onSurface: '#F2F6FF',
  onSurfaceVariant: '#AFC0D8',

  outline: '#5A7096',
  outlineVariant: '#34476B',
  stroke: '#5A7096',
  strokeStrong: '#9FB4D6',

  skeletonBase: '#182747',
  skeletonShine: '#223259',

  scrim: 'rgba(5, 9, 20, 0.78)',

  // Retained for API compatibility. Values are flat; no data surface is a gradient.
  gradient: {
    primary: ['#8B3BE1', '#8B3BE1'] as const,
    secondary: ['#06B6D4', '#06B6D4'] as const,
    accent: ['#182747', '#182747'] as const,
  },
} as const;

const lightPalette = {
  // Original Caja Fuerte light theme, restored at the user's request.
  background: '#E9EFEC',
  surface: '#FFFFFF',
  surfaceDim: '#DCE6E1',
  surfaceBright: '#FFFFFF',
  surfaceContainer: '#F4F8F5',
  surfaceContainerHigh: '#F4F8F5',
  surfaceContainerHighest: '#E9EFEC',
  surfaceContainerLow: '#F7FAF8',
  surfaceContainerLowest: '#FFFFFF',

  // Signal orange: text, borders, containers and solid actions.
  primary: '#B8430A',
  primaryContainer: '#FFE3D2',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#7A2C05',
  primarySolid: '#C2410C',
  onPrimarySolid: '#FFFFFF',
  inversePrimary: '#FF8A4C',
  // The original light-theme button/FAB border colour.
  actionBorder: '#B8430A',

  secondary: '#3155B5',
  secondaryContainer: '#E1E8FF',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1B2F6B',

  tertiary: '#4F615C',
  tertiaryContainer: '#DCE8E3',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#263A35',

  error: '#B02E2E',
  errorContainer: '#FFE1DE',
  onError: '#FFFFFF',
  onErrorContainer: '#57191A',

  success: '#0B6E56',
  successContainer: '#DCF5EA',
  onSuccessContainer: '#0B4F3E',
  warning: '#B8430A',

  info: '#3155B5',
  infoContainer: '#E1E8FF',
  onInfo: '#FFFFFF',

  onBackground: '#101716',
  onSurface: '#101716',
  onSurfaceVariant: '#4F615C',

  outline: '#B7C6C1',
  outlineVariant: '#D3DEDA',
  stroke: '#B7C6C1',
  strokeStrong: '#6E837D',

  skeletonBase: '#E1E9E5',
  skeletonShine: '#F3F7F5',

  scrim: 'rgba(16, 23, 22, 0.42)',

  gradient: {
    primary: ['#B8430A', '#B8430A'] as const,
    secondary: ['#3155B5', '#3155B5'] as const,
    accent: ['#F4F8F5', '#F4F8F5'] as const,
  },
} as const;

export type ThemeColors = typeof darkPalette;
export type ColorKey = keyof ThemeColors;

export const palettes = {
  dark: darkPalette,
  light: lightPalette,
} as const;

export type ThemeMode = 'light' | 'dark';

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return palettes[mode] as ThemeColors;
}

export function getSystemThemeMode(): ThemeMode {
  const scheme = Appearance.getColorScheme();
  return scheme === 'light' ? 'light' : 'dark';
}
