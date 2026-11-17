import { FPS, beat2Time, beatTimes } from './beats';
import { isDrillPreset, type Category, type Preset } from './presets';

/**
 * The silent gap between beat 3 and the next beat 1, as a multiple of the
 * beat 1 to beat 2 gap. It scales with tempo, so slow presets get a longer pause.
 * Starting values read from the reference clips (Long Game fits closely, Short Game
 * is a little looser). Tune by ear.
 * One factor per category at every tempo, so with the beats also exactly proportional
 * (no fixed impact delay) every preset is the same swing, only faster or slower.
 * Exception: Practice Drills use the drill bar instead (see DRILL_BAR_COUNTS).
 */
export const REPEAT_PAUSE_FACTOR: Readonly<Record<Category, number>> = {
  long: 1.5,
  // 1.5 makes the Short Game bar exactly 3 x the time to TOP (with the true 2:1), so the
  // even 12-step loop puts TOP on the step 4 kick and IMPACT on the step 6 snare at every
  // tempo. It was 1.9, read from the reference clips. November 2026.
  short: 1.5,
};

/**
 * The drill bar (Practice Drills, V2-07), counted in downswings. One count is one downswing
 * (downFrames / 30). With the true 3:1 a drill swing is exactly 4 counts (takeaway to TOP 3,
 * TOP to impact 1). After impact comes a recovery measure, then a countdown 4, 3, 2, 1 that
 * leads into the next takeaway, so the bar is 12 counts. The hi-hat ticks every half count,
 * so the bar is 24 hats, 3 measures of 8: swing, recovery, countdown (docs/ideas.md, idea 2).
 */
export const DRILL_SWING_COUNTS = 4;
export const DRILL_RECOVERY_COUNTS = 4;
export const DRILL_COUNTDOWN_COUNTS = 4;
export const DRILL_BAR_COUNTS = DRILL_SWING_COUNTS + DRILL_RECOVERY_COUNTS + DRILL_COUNTDOWN_COUNTS;

/** Seconds in one drill count: one downswing. */
export function drillCountSeconds(preset: Preset): number {
  return preset.downFrames / FPS;
}

/** Seconds of silence between beat 3 and the next beat 1. */
export function repeatPauseSeconds(preset: Preset): number {
  if (isDrillPreset(preset)) return (DRILL_RECOVERY_COUNTS + DRILL_COUNTDOWN_COUNTS) * drillCountSeconds(preset);
  return REPEAT_PAUSE_FACTOR[preset.category] * beat2Time(preset);
}

/** Seconds from one beat 1 to the next when a swing repeats. */
export function cycleSeconds(preset: Preset): number {
  return beatTimes(preset).beat3 + repeatPauseSeconds(preset);
}
