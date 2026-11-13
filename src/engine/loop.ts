import { beatTimes } from './beats';
import type { Preset } from './presets';
import { cycleSeconds } from './repeat';

export type LoopVoice = 'kick' | 'snare' | 'hat';

export type LoopEvent = {
  voice: LoopVoice;
  /** Seconds from beat 1 (the start of the bar). */
  time: number;
  /** Hat only: true on the louder hat ticks (see HAT_ACCENT_STEPS). */
  accent?: boolean;
};

/**
 * The pattern copies Tour Tempo's loop, measured from its clips (see
 * _references/tempo-measurements.md and docs/development-decisions.md): one bar is one
 * swing cycle, split into 12 steps. Beat 2 sits on step 4 and beat 3 on step 6.
 * All of this is data: change a table or a constant to change the groove.
 */
export const STEPS_PER_BAR = 12;
export const BEAT2_STEP = 4;
export const BEAT3_STEP = 6;

export const KICK_STEPS: readonly number[] = [0, 4, 8];
export const SNARE_STEPS: readonly number[] = [2, 6, 10];
/** Steps whose hat tick is louder. The hat plays on every step. */
export const HAT_ACCENT_STEPS: readonly number[] = [0, 2, 6, 10];
/** Quiet extra kicks, heard only at the fastest tempo in Tour Tempo (18/6). */
export const GHOST_KICK_STEPS: readonly number[] = [1, 5, 9];
/**
 * Ghost kicks play only when one step (cycle / 12) is this short or shorter, which is
 * 18/6 and the Short Game presets 14/7 and 16/8. Set to 0 to remove them.
 */
export const GHOST_KICK_MAX_STEP_SECONDS = 0.17;

/** Largest allowed gap between hat ticks, in seconds. Longer steps get extra soft ticks. Tune by ear. */
export const HAT_MAX_GAP_SECONDS = 0.5;

export type LoopOptions = {
  hatMaxGapSeconds?: number;
  /** Force ghost kicks on or off. Default: on only when a step is short (see above). */
  ghostKicks?: boolean;
};

/**
 * Presets whose beat 1 to beat 2 time is at most this many seconds (18/6 to 30/10, the ones
 * Tour Tempo has) use an even grid, exactly like Tour Tempo. Slower presets use the
 * beat-anchored grid. 0 means always anchored. Infinity means always even.
 */
export const ANCHOR_MIN_BEAT2_SECONDS = 1.0;

/**
 * Seconds from beat 1 to the start of each of the 12 steps (plus the bar end at index 12).
 *
 * Even grid (fast presets): every step is cycle / 12, as in Tour Tempo. Beat 2 then lands
 * near step 4 and beat 3 near step 6 (beat 3 up to about a third of a step late, because
 * of its fixed 0.2 s delay), and the loop never changes speed inside the bar.
 *
 * Anchored grid (slow presets): steps are even inside three sections, so beat 2 is exactly
 * on step 4 and beat 3 exactly on step 6. The middle section's steps are then a little
 * shorter or longer than the others. Without this, the fixed 0.2 s delay made beat 3 land
 * up to 0.37 s off the loop at 168/56.
 */
export function stepTimes(preset: Preset): number[] {
  const { beat2, beat3 } = beatTimes(preset);
  const cycle = cycleSeconds(preset);
  const times: number[] = [];
  if (beat2 <= ANCHOR_MIN_BEAT2_SECONDS) {
    for (let i = 0; i <= STEPS_PER_BAR; i++) times.push((cycle * i) / STEPS_PER_BAR);
    return times;
  }
  for (let i = 0; i <= STEPS_PER_BAR; i++) {
    if (i <= BEAT2_STEP) times.push((beat2 * i) / BEAT2_STEP);
    else if (i <= BEAT3_STEP) {
      times.push(beat2 + ((beat3 - beat2) * (i - BEAT2_STEP)) / (BEAT3_STEP - BEAT2_STEP));
    } else {
      times.push(beat3 + ((cycle - beat3) * (i - BEAT3_STEP)) / (STEPS_PER_BAR - BEAT3_STEP));
    }
  }
  return times;
}

/**
 * The background loop for one bar. Events are sorted by time (kick, snare, hat in that
 * order on ties).
 */
export function loopEvents(preset: Preset, options: LoopOptions = {}): LoopEvent[] {
  const hatMaxGap = options.hatMaxGapSeconds ?? HAT_MAX_GAP_SECONDS;
  const times = stepTimes(preset);
  const ghosts =
    options.ghostKicks ?? cycleSeconds(preset) / STEPS_PER_BAR <= GHOST_KICK_MAX_STEP_SECONDS;

  const events: LoopEvent[] = [];
  for (let step = 0; step < STEPS_PER_BAR; step++) {
    const start = times[step];
    if (KICK_STEPS.includes(step) || (ghosts && GHOST_KICK_STEPS.includes(step))) {
      events.push({ voice: 'kick', time: start });
    }
    if (SNARE_STEPS.includes(step)) events.push({ voice: 'snare', time: start });

    // One hat per step. A long step gets extra soft ticks so the pulse stays steady.
    const length = times[step + 1] - start;
    const ticks = Math.max(1, Math.ceil(length / hatMaxGap));
    for (let i = 0; i < ticks; i++) {
      const event: LoopEvent = { voice: 'hat', time: start + (i * length) / ticks };
      if (i === 0 && HAT_ACCENT_STEPS.includes(step)) event.accent = true;
      events.push(event);
    }
  }
  return events;
}
