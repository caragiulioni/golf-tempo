import { beat2Time, beatTimes } from './beats';
import type { Category, Preset } from './presets';

/**
 * The silent gap between beat 3 and the next beat 1, as a multiple of the
 * beat 1 to beat 2 gap. It scales with tempo, so slow presets get a longer pause.
 * Starting values read from the reference clips (Long Game fits closely, Short Game
 * is a little looser). Tune by ear.
 */
export const REPEAT_PAUSE_FACTOR: Readonly<Record<Category, number>> = {
  long: 1.5,
  short: 1.9,
};

/** Seconds of silence between beat 3 and the next beat 1. */
export function repeatPauseSeconds(preset: Preset): number {
  return REPEAT_PAUSE_FACTOR[preset.category] * beat2Time(preset);
}

/** Seconds from one beat 1 to the next when a swing repeats. */
export function cycleSeconds(preset: Preset): number {
  return beatTimes(preset).beat3 + repeatPauseSeconds(preset);
}
