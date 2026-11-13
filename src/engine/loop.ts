import { beatTimes } from './beats';
import { presetLabel, type Category, type Preset } from './presets';
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
 * swing cycle, split into 12 steps. All of this is data: change a table or a constant to
 * change the groove.
 */
export const STEPS_PER_BAR = 12;

/**
 * The step each beat sits on when the grid is anchored to the beats (see stepTimes).
 * Long Game (3:1): beat 2 on step 4 (with a kick), beat 3 on step 6 (with a snare).
 * Short Game (2:1): beat 2 falls near step 3 of an even bar (3.1 to 3.3 across the
 * presets), so it is anchored to step 3. Anchoring it to step 4 would stretch the middle of
 * the bar by up to 67%. Beat 3 stays on step 6 (with a snare).
 */
export const ANCHOR_STEPS: Readonly<Record<Category, { beat2: number; beat3: number }>> = {
  long: { beat2: 4, beat3: 6 },
  short: { beat2: 3, beat3: 6 },
};

export const KICK_STEPS: readonly number[] = [0, 4, 8];
export const SNARE_STEPS: readonly number[] = [2, 6, 10];
/** Steps whose hat tick is louder. The hat plays on every step. */
export const HAT_ACCENT_STEPS: readonly number[] = [0, 2, 6, 10];
/** Quiet extra kicks, heard only at the fastest tempo in Tour Tempo (18/6). */
export const GHOST_KICK_STEPS: readonly number[] = [1, 5, 9];
/**
 * Presets that get ghost kicks, listed by name. Tour Tempo has them at 18/6 only; the two
 * fastest Short Game presets get them too because their steps are as short. Listed
 * explicitly so tuning the repeat pause can never switch them on or off by accident.
 * Empty both lists to remove them.
 */
export const GHOST_KICK_PRESETS: Readonly<Record<Category, readonly string[]>> = {
  long: ['18/6'],
  short: ['14/7', '16/8'],
};

/** Largest allowed gap between hat ticks, in seconds. Longer steps get extra soft ticks. Tune by ear. */
export const HAT_MAX_GAP_SECONDS = 0.5;

/** Rounding slack, so a step of exactly the hat gap (60/20) is not split in two. */
const TICK_EPSILON = 1e-9;

export type LoopOptions = {
  hatMaxGapSeconds?: number;
  /** Force ghost kicks on or off. Default: on for the presets in GHOST_KICK_PRESETS. */
  ghostKicks?: boolean;
};

/**
 * Which presets use the beat-anchored grid instead of the even grid, by the beat 1 to
 * beat 2 time. Long Game: presets up to 1.0 s (18/6 to 30/10, the ones Tour Tempo has) use
 * the even grid, exactly like Tour Tempo; slower ones are anchored. Short Game: always
 * anchored (0), because on an even grid its beat 2 lands 0.13 to 0.17 s before the kick on
 * step 4. 0 means always anchored. Infinity means always even.
 */
export const ANCHOR_MIN_BEAT2_SECONDS: Readonly<Record<Category, number>> = {
  long: 1.0,
  short: 0,
};

/** True when the preset's grid is anchored to its beats (see stepTimes). */
export function usesAnchoredGrid(preset: Preset): boolean {
  return beatTimes(preset).beat2 > ANCHOR_MIN_BEAT2_SECONDS[preset.category];
}

/**
 * Seconds from beat 1 to the start of each of the 12 steps (plus the bar end at index 12).
 *
 * Even grid: every step is cycle / 12, as in Tour Tempo. Beat 2 then lands near its step
 * and beat 3 near step 6 (beat 3 up to about a third of a step late at 18/6, because of its
 * fixed 0.2 s delay), and the loop never changes speed inside the bar.
 *
 * Anchored grid: steps are even inside three sections (beat 1 to beat 2, beat 2 to beat 3,
 * beat 3 to the next beat 1), so beat 2 and beat 3 land exactly on their steps
 * (ANCHOR_STEPS). The middle section's steps are then a little shorter or longer than the
 * others. Because beat 3 has a fixed 0.2 s delay, no even grid can hold both beats at
 * every tempo, so anchoring trades a slightly uneven middle for beats that sit on the loop.
 */
export function stepTimes(preset: Preset): number[] {
  const { beat2, beat3 } = beatTimes(preset);
  const cycle = cycleSeconds(preset);
  const times: number[] = [];
  if (!usesAnchoredGrid(preset)) {
    for (let i = 0; i <= STEPS_PER_BAR; i++) times.push((cycle * i) / STEPS_PER_BAR);
    return times;
  }
  const { beat2: s2, beat3: s3 } = ANCHOR_STEPS[preset.category];
  for (let i = 0; i <= STEPS_PER_BAR; i++) {
    if (i <= s2) times.push((beat2 * i) / s2);
    else if (i <= s3) times.push(beat2 + ((beat3 - beat2) * (i - s2)) / (s3 - s2));
    else times.push(beat3 + ((cycle - beat3) * (i - s3)) / (STEPS_PER_BAR - s3));
  }
  return times;
}

/** How many hat ticks a span gets so no gap is longer than `maxGap`. */
function ticksFor(length: number, maxGap: number): number {
  return Math.max(1, Math.ceil(length / maxGap - TICK_EPSILON));
}

const VOICE_ORDER: Readonly<Record<LoopVoice, number>> = { kick: 0, snare: 1, hat: 2 };

/**
 * The background loop for one bar. Events are sorted by time (kick, snare, hat in that
 * order on ties).
 *
 * Hats: one per step, and a long step gets extra soft ticks so the pulse stays steady.
 * On an anchored grid where the steps are long enough to need extra ticks (slow Long Game),
 * the middle section (beat 2 to beat 3) is ticked as one span, with the tick count that
 * makes its gap closest to the gap in the rest of the bar. Ticking it step by step made the
 * pulse speed up by as much as 26% between beat 2 and beat 3 at 168/56; this keeps it
 * within about 13%. The middle gap can then run slightly over HAT_MAX_GAP_SECONDS (up to
 * about 0.52 s at 168/56), which keeps the pulse even instead.
 */
export function loopEvents(preset: Preset, options: LoopOptions = {}): LoopEvent[] {
  const hatMaxGap = options.hatMaxGapSeconds ?? HAT_MAX_GAP_SECONDS;
  const times = stepTimes(preset);
  const ghosts = options.ghostKicks ?? GHOST_KICK_PRESETS[preset.category].includes(presetLabel(preset));

  // The middle section is ticked as one span only on an anchored grid with subdivided steps.
  const anchor = ANCHOR_STEPS[preset.category];
  const firstStep = times[1] - times[0];
  const outerTicks = ticksFor(firstStep, hatMaxGap);
  const middleAsSpan = usesAnchoredGrid(preset) && outerTicks > 1;

  const events: LoopEvent[] = [];
  const addHats = (start: number, end: number, ticks: number, accentFirst: boolean) => {
    const length = end - start;
    for (let i = 0; i < ticks; i++) {
      const event: LoopEvent = { voice: 'hat', time: start + (i * length) / ticks };
      if (i === 0 && accentFirst) event.accent = true;
      events.push(event);
    }
  };

  for (let step = 0; step < STEPS_PER_BAR; step++) {
    const start = times[step];
    if (KICK_STEPS.includes(step) || (ghosts && GHOST_KICK_STEPS.includes(step))) {
      events.push({ voice: 'kick', time: start });
    }
    if (SNARE_STEPS.includes(step)) events.push({ voice: 'snare', time: start });

    const inMiddle = step >= anchor.beat2 && step < anchor.beat3;
    if (middleAsSpan && inMiddle) {
      if (step === anchor.beat2) {
        const end = times[anchor.beat3];
        const outerGap = firstStep / outerTicks;
        const ticks = Math.max(1, Math.round((end - start) / outerGap));
        addHats(start, end, ticks, HAT_ACCENT_STEPS.includes(step));
      }
      continue;
    }
    addHats(start, times[step + 1], ticksFor(times[step + 1] - start, hatMaxGap), HAT_ACCENT_STEPS.includes(step));
  }

  return events.sort((a, b) => a.time - b.time || VOICE_ORDER[a.voice] - VOICE_ORDER[b.voice]);
}
