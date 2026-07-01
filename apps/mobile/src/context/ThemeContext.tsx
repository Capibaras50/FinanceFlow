import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getThemeColors, getSystemThemeMode, type ThemeMode, type ThemeColors } from '../theme/colors';

const THEME_STORAGE_KEY = 'finance_flow_theme';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setModeState(saved);
        return;
      }
    } catch (e) {
      console.warn('ThemeContext: error reading saved theme', e);
    }
    setModeState(getSystemThemeMode());
  };

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.warn('ThemeContext: error saving theme', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const colors = useMemo(() => getThemeColors(mode), [mode]);

  const value = useMemo(() => ({
    mode,
    colors,
    setMode,
    toggleTheme,
    isDark: mode === 'dark',
  }), [mode, colors, setMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
