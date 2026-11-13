import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { saveThemeChoice } from '../storage';
import type { ThemeChoice } from '../storage';
import { colors } from './tokens';
import type { Colors, ThemeMode } from './tokens';

export type Theme = {
  mode: ThemeMode;
  colors: Colors;
  setMode: (mode: ThemeMode) => void;
  /** Switches to the other mode and saves the choice. */
  toggle: () => void;
  /** Menu label: names the mode the toggle will switch to. */
  toggleLabel: string;
};

const ThemeContext = createContext<Theme | null>(null);

type Props = {
  /** Saved choice, loaded by App before the provider renders. null = none saved. */
  initialChoice: ThemeChoice | null;
  children: React.ReactNode;
};

export function ThemeProvider({ initialChoice, children }: Props) {
  const [choice, setChoice] = useState<ThemeChoice | null>(initialChoice);
  const device = useColorScheme();
  // Device changes are followed only while no choice is saved.
  const mode: ThemeMode = choice ?? (device === 'light' ? 'light' : 'dark');

  const setMode = useCallback((next: ThemeMode) => {
    setChoice(next);
    // Not awaited. A write failure keeps the new mode for this session.
    saveThemeChoice(next).catch(() => {});
  }, []);

  // Web: paint the page itself in the theme background. Phone browsers grow the page by about
  // 40 px when the address bar slides away on scroll, and that strip showed the default white.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const bg = colors[mode].bg;
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
  }, [mode]);

  const value = useMemo<Theme>(() => {
    const other: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    return {
      mode,
      colors: colors[mode],
      setMode,
      toggle: () => setMode(other),
      toggleLabel: other === 'light' ? 'Light mode' : 'Dark mode',
    };
  }, [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}
