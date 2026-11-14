import { beat2Time, beatTimes } from './beats';
import type { Category, Preset } from './presets';

/**
 * The silent gap between beat 3 and the next beat 1, as a multiple of the
 * beat 1 to beat 2 gap. It scales with tempo, so slow presets get a longer pause.
 * Starting values read from the reference clips (Long Game fits closely, Short Game
 * is a little looser). Tune by ear.
 * One factor per category at every tempo, so with the beats also exactly proportional
 * (no fixed impact delay) every preset is the same swing, only faster or slower.
 * Exception: slow Long Game (see SLOW_LONG_PAUSE_FACTOR).
 */
export const REPEAT_PAUSE_FACTOR: Readonly<Record<Category, number>> = {
  long: 1.5,
  // 1.5 makes the Short Game bar exactly 3 x the time to TOP (with the true 2:1), so the
  // even 12-step loop puts TOP on the step 4 kick and IMPACT on the step 6 snare at every
  // tempo. It was 1.9, read from the reference clips. November 2026.
  short: 1.5,
};

/**
 * Long Game presets with beat 1 to beat 2 longer than this (42/14 and slower) are slow
 * practice presets. They use SLOW_LONG_PAUSE_FACTOR and their own loop pattern (a kick on
 * beat 1 and a steady hi-hat, see usesSparsePattern in loop.ts).
 */
export const SLOW_LONG_MIN_BEAT2_SECONDS = 1.0;
/**
 * 4/3 makes the rest exactly 4 downswings, so the whole bar is 8 downswings and the steady
 * hi-hat counts as whole measures of 8: 2 measures at 42/14, 60/20, 84/28 and 4 at 120/40,
 * 168/56, with IMPACT on the first count of a measure. With 1.5 the bar counted
 * 4 x 8 + 2 at 168/56 (heard, November 2026). A longer pause (5/3) was tried earlier and
 * rejected by ear.
 */
export const SLOW_LONG_PAUSE_FACTOR = 4 / 3;

/** True for the slow practice presets in Long Game (42/14 and slower). */
export function isSlowLongPreset(preset: Preset): boolean {
  return preset.category === 'long' && beat2Time(preset) > SLOW_LONG_MIN_BEAT2_SECONDS;
}

/** Seconds of silence between beat 3 and the next beat 1. */
export function repeatPauseSeconds(preset: Preset): number {
  const factor = isSlowLongPreset(preset) ? SLOW_LONG_PAUSE_FACTOR : REPEAT_PAUSE_FACTOR[preset.category];
  return factor * beat2Time(preset);
}

/** Seconds from one beat 1 to the next when a swing repeats. */
export function cycleSeconds(preset: Preset): number {
  return beatTimes(preset).beat3 + repeatPauseSeconds(preset);
}
