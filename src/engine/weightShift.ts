import { beat2Time } from './beats';
import type { Category, Preset } from './presets';

/** Safe range for the position, so the weight shift never lands on beat 1 or beat 2. */
export const WEIGHT_SHIFT_RANGE = { min: 0.05, max: 0.95 } as const;

/**
 * Starting positions (tentative, tuned by ear in CONFIG mode).
 * Both are the midpoint of the whole swing: 2/3 for 3:1, 3/4 for 2:1.
 */
export const DEFAULT_WEIGHT_SHIFT_POSITIONS: Readonly<Record<Category, number>> = {
  long: 0.67,
  short: 0.75,
};

/** One position per category, 0 to 1 between beat 1 and beat 2. */
export type WeightShiftSettings = Readonly<Record<Category, number>>;

export function defaultWeightShiftSettings(): WeightShiftSettings {
  return { ...DEFAULT_WEIGHT_SHIFT_POSITIONS };
}

/** Keep a position inside the safe range. Anything that is not a number falls back to the minimum. */
export function clampPosition(position: number): number {
  if (Number.isNaN(position)) return WEIGHT_SHIFT_RANGE.min;
  return Math.min(WEIGHT_SHIFT_RANGE.max, Math.max(WEIGHT_SHIFT_RANGE.min, position));
}

/** Returns new settings with one category changed. The other category is untouched. */
export function withPosition(
  settings: WeightShiftSettings,
  category: Category,
  position: number,
): WeightShiftSettings {
  return { ...settings, [category]: clampPosition(position) };
}

/**
 * Seconds from the start of the swing to the weight shift beat.
 * The position is a fraction of the beat 1 to beat 2 gap, so it keeps the same
 * relative place at every tempo.
 */
export function weightShiftTime(preset: Preset, position: number): number {
  return clampPosition(position) * beat2Time(preset);
}
