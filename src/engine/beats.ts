import type { Preset } from './presets';

/** Preset numbers are frame counts at this rate. */
export const FPS = 30;

/**
 * The reference software plays beat 3 this much later than the printed numbers imply.
 * Measured on all 11 of its presets: always about 0.20 s, at every tempo.
 * Used for every preset, including the slow ones. See _references/tempo-measurements.md.
 * To use measured values per preset later, change beat3Time below and nothing else.
 */
export const BEAT3_DELAY_SECONDS = 0.2;

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
