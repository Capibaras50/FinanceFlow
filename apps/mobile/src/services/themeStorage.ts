import * as SecureStore from 'expo-secure-store';
import type { ThemeMode } from '../theme/colors';

export const THEME_STORAGE_KEY = 'finance_flow_theme';

/** Native splash covers the async Keychain read, so keep the first render stable. */
export function getInitialThemeMode(): ThemeMode {
  return 'dark';
}

export const isThemeHydratedSync = false;

export async function readThemeMode(): Promise<ThemeMode | null> {
  try {
    const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

export async function writeThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
  } catch {
    // Persistence is best-effort; the in-memory theme still updates.
  }
}
