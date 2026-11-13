import type { Preset } from './presets';
import { cycleSeconds } from './repeat';

export type LoopVoice = 'kick' | 'snare' | 'hat';

export type LoopEvent = {
  voice: LoopVoice;
  /** Seconds from beat 1 (the start of the bar). */
  time: number;
  /** Hat only: true on the first tick of each quarter. */
  accent?: boolean;
};

/** One bar is split into this many equal quarters. */
export const QUARTERS_PER_BAR = 4;

/** Largest allowed gap between hat ticks, in seconds. Tune by ear. */
export const HAT_MAX_GAP_SECONDS = 0.5;

/** Quarters longer than this use the thinned pattern. Tune by ear. */
export const SLOW_QUARTER_SECONDS = 2.5;

/** Quarter numbers (1 to 4) that get a kick and a snare. */
export type PatternTable = {
  readonly kick: readonly number[];
  readonly snare: readonly number[];
};

export const NORMAL_PATTERN: PatternTable = { kick: [1, 3], snare: [2, 4] };
export const SLOW_PATTERN: PatternTable = { kick: [1], snare: [3] };

export type LoopOptions = {
  hatMaxGapSeconds?: number;
  slowQuarterSeconds?: number;
};

/**
 * The background loop for one bar. One bar is one swing cycle, so beat 1 lands on
 * the bar start. Events are sorted by time (kick, snare, hat in that order on ties).
 */
export function loopEvents(preset: Preset, options: LoopOptions = {}): LoopEvent[] {
  const hatMaxGap = options.hatMaxGapSeconds ?? HAT_MAX_GAP_SECONDS;
  const slowQuarter = options.slowQuarterSeconds ?? SLOW_QUARTER_SECONDS;

  const quarter = cycleSeconds(preset) / QUARTERS_PER_BAR;
  const table = quarter > slowQuarter ? SLOW_PATTERN : NORMAL_PATTERN;
  const hatsPerQuarter = Math.max(1, Math.ceil(quarter / hatMaxGap));
  const hatStep = quarter / hatsPerQuarter;

  const events: LoopEvent[] = [];
  for (let q = 0; q < QUARTERS_PER_BAR; q++) {
    const start = q * quarter;
    if (table.kick.includes(q + 1)) events.push({ voice: 'kick', time: start });
    if (table.snare.includes(q + 1)) events.push({ voice: 'snare', time: start });
    for (let i = 0; i < hatsPerQuarter; i++) {
      const event: LoopEvent = { voice: 'hat', time: start + i * hatStep };
      if (i === 0) event.accent = true;
      events.push(event);
    }
  }
  return events;
}
