// Plain data shared by the main screen and the Config screen, so each is written once.
import type { Category, Preset } from '../../engine';

export const CATEGORY_OPTIONS: ReadonlyArray<{ value: Category; label: string }> = [
  { value: 'long', label: 'Long game' },
  { value: 'short', label: 'Short game' },
];
export const CATEGORY_NAME: Record<Category, string> = { long: 'Long game', short: 'Short game' };
/** Preset buttons per row. */
export const PRESET_COLUMNS: Record<Category, 3 | 5> = { long: 5, short: 3 };

export const presetKey = (p: Preset) => `${p.category}-${p.backFrames}-${p.downFrames}`;
