import type { Preset } from './presets';

/** Preset numbers are frame counts at this rate. */
export const FPS = 30;

/**
 * Extra time added to beat 3 (impact) beyond the printed numbers. 0: impact lands exactly
 * on the frame count, so the ratio you hear is the true one (TOP at 3/4 of the swing in
 * Long Game, 2/3 in Short Game).
 * History: it was 0.2 s, copied from the reference software, which plays beat 3 about
 * 0.2 s late on all 11 of its presets (_references/tempo-measurements.md). That squashed
 * the heard ratio (Short 18/9 sounded 1.2:1, Long 30/10 1.9:1), so it was removed
 * (November 2026, developer decision).
 */
export const BEAT3_DELAY_SECONDS = 0;

export type BeatTimes = {
  /** Always 0: the start of the swing. */
  beat1: number;
  beat2: number;
  beat3: number;
};

/** Seconds from the start of the swing to beat 2. */
export function beat2Time(preset: Preset): number {
  return preset.backFrames / FPS;
}

/** Seconds from the start of the swing to beat 3. */
function beat3Time(preset: Preset): number {
  return beat2Time(preset) + preset.downFrames / FPS + BEAT3_DELAY_SECONDS;
}

/** Times of the three original beats, in seconds from the start of the swing. */
export function beatTimes(preset: Preset): BeatTimes {
  return {
    beat1: 0,
    beat2: beat2Time(preset),
    beat3: beat3Time(preset),
  };
}
