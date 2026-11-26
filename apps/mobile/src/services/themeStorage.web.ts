import { getSystemThemeMode, type ThemeMode } from '../theme/colors';

export const THEME_STORAGE_KEY = 'finance_flow_theme';

export const isThemeHydratedSync = true;

/** Web: read synchronously during render — the export is CSR, so no hydration mismatch. */
export function getInitialThemeMode(): ThemeMode {
  try {
    const saved = typeof window === 'undefined' ? null : window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage can be disabled; fall back to the system scheme.
  }
  return getSystemThemeMode();
}

export async function readThemeMode(): Promise<ThemeMode | null> {
  return getInitialThemeMode();
}

export async function writeThemeMode(mode: ThemeMode): Promise<void> {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage can be disabled; the in-memory theme still updates.
  }
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = mode === 'dark' ? '#0B1326' : '#E9EFEC';
  }
}
