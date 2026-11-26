import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { getThemeColors, getSystemThemeMode, type ThemeMode, type ThemeColors } from '../theme/colors';
import { getInitialThemeMode, isThemeHydratedSync, readThemeMode, writeThemeMode } from '../services/themeStorage';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  /** Native waits for the SecureStore read before hiding the splash. */
  isHydrated: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialThemeMode);
  const [isHydrated, setIsHydrated] = useState(isThemeHydratedSync);

  useEffect(() => {
    let active = true;
    readThemeMode().then((saved) => {
      if (!active) return;
      setModeState(saved ?? getSystemThemeMode());
      setIsHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    await writeThemeMode(newMode);
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
    isHydrated,
  }), [mode, colors, setMode, toggleTheme, isHydrated]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
