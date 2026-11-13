import { getItem, setItem } from './storage';

export type ThemeChoice = 'light' | 'dark';

export const THEME_KEY = 'golf-tempo:theme:v1';

/** Returns the saved choice, or null if missing, invalid or unreadable. */
export async function loadThemeChoice(): Promise<ThemeChoice | null> {
  const value = await getItem(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

/** Saves the choice. Never throws. */
export async function saveThemeChoice(mode: ThemeChoice): Promise<void> {
  await setItem(THEME_KEY, mode);
}
