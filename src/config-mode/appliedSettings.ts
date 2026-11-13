// Pure logic for the saved (applied) weight shift values. No storage, no React.
// Temporary: deleted with the rest of src/config-mode/ in spec 6.
import {
  WEIGHT_SHIFT_RANGE,
  clampPosition,
  defaultWeightShiftSettings,
  type Category,
  type WeightShiftSettings,
} from '../engine';

/** Bump when the stored shape changes. Older or newer versions are ignored (defaults used). */
export const APPLIED_VERSION = 1;

/** Versioned key (tech.md). The value is the text made by `serializeApplied`. */
export const APPLIED_KEY = 'golf-tempo:weight-shift:v1';

/** What is saved on this device. `applied` is false for a category still on its default. */
export type AppliedState = {
  settings: WeightShiftSettings;
  applied: Record<Category, boolean>;
};

const CATEGORIES: readonly Category[] = ['long', 'short'];

function isValidPosition(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= WEIGHT_SHIFT_RANGE.min &&
    value <= WEIGHT_SHIFT_RANGE.max
  );
}

/** Nothing applied: both categories at their defaults. */
export function emptyApplied(): AppliedState {
  return { settings: defaultWeightShiftSettings(), applied: { long: false, short: false } };
}

/**
 * Reads the saved text. Never throws. Each category is checked on its own, so one bad
 * value does not affect the other. A missing, unreadable or wrong-version entry gives defaults.
 */
export function parseApplied(raw: string | null): AppliedState {
  const result = emptyApplied();
  if (raw === null) return result;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return result;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return result;
  const record = data as Record<string, unknown>;
  if (record.version !== APPLIED_VERSION) return result;

  const settings: Record<Category, number> = { ...result.settings };
  const applied: Record<Category, boolean> = { long: false, short: false };
  for (const category of CATEGORIES) {
    const value = record[category];
    if (isValidPosition(value)) {
      settings[category] = value;
      applied[category] = true;
    }
  }
  return { settings, applied };
}

/** Makes the text to save. Only applied categories are written. */
export function serializeApplied(state: AppliedState): string {
  const out: Record<string, number> = { version: APPLIED_VERSION };
  for (const category of CATEGORIES) {
    if (state.applied[category]) out[category] = clampPosition(state.settings[category]);
  }
  return JSON.stringify(out);
}

/** New state with one category applied. The other category is untouched. */
export function withApplied(state: AppliedState, category: Category, position: number): AppliedState {
  return {
    settings: { ...state.settings, [category]: clampPosition(position) },
    applied: { ...state.applied, [category]: true },
  };
}

/**
 * Text to save after applying one category: reads what is stored now, changes one category,
 * keeps the other as it was.
 */
export function mergeApplied(raw: string | null, category: Category, position: number): string {
  return serializeApplied(withApplied(parseApplied(raw), category, position));
}
