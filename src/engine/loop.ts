import { beatTimes } from './beats';
import { isDrillPreset, presetLabel, type Category, type Preset } from './presets';
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
 * The drum steps the beats sit on or near. Long Game (3:1, fast presets): beat 2 near the
 * step 4 kick (step 4.24), beat 3 near the step 6 snare (5.65). Short Game (2:1, pause
 * factor 1.5): beat 2 exactly on the step 4 kick, beat 3 exactly on the step 6 snare, at
 * every tempo. Also used by stepTimes if a grid is ever anchored again.
 */
export const ANCHOR_STEPS: Readonly<Record<Category, { beat2: number; beat3: number }>> = {
  long: { beat2: 4, beat3: 6 },
  short: { beat2: 4, beat3: 6 },
};

export const KICK_STEPS: readonly number[] = [0, 4, 8];
export const SNARE_STEPS: readonly number[] = [2, 6, 10];
/** Steps whose hat tick is louder. The hat plays on every step. */
export const HAT_ACCENT_STEPS: readonly number[] = [0, 2, 6, 10];
/** Quiet extra kicks right after each main kick, heard only at the fastest tempo in Tour Tempo (18/6). Currently off (see GHOST_KICK_PRESETS). */
export const GHOST_KICK_STEPS: readonly number[] = [1, 5, 9];
/**
 * Presets that get ghost kicks, listed by name. Empty: removed by the developer (November
 * 2026). The kick, kick, snare they made at Long 18/6 and Short 14/7, 16/8 was judged too
 * busy for most users, so those presets play the same kick, snare pattern as the rest.
 * To bring them back, list the presets again (Tour Tempo has them at 18/6), for example
 * long: ['18/6'], short: ['14/7', '16/8'].
 */
export const GHOST_KICK_PRESETS: Readonly<Record<Category, readonly string[]>> = {
  long: [],
  short: [],
};

/**
 * Largest allowed gap between hat ticks, in seconds. Longer steps get extra soft ticks. Tune
 * by ear. (A separate 0.7 s limit for the sparse pattern existed only for 120/40, removed in
 * V2-04; with the remaining drills the hats tick every half downswing, at most 0.47 s.)
 */
export const HAT_MAX_GAP_SECONDS = 0.5;

/** Rounding slack, so a step of exactly the hat gap (60/20) is not split in two. */
const TICK_EPSILON = 1e-9;
/** How close a hat tick must be to an accent step to be accented (rounding only). */
const ACCENT_MATCH_SECONDS = 1e-6;

export type LoopOptions = {
  hatMaxGapSeconds?: number;
  /** Force ghost kicks on or off. Default: on for the presets in GHOST_KICK_PRESETS. */
  ghostKicks?: boolean;
};

/**
 * Which presets use the beat-anchored grid instead of the even grid, by the beat 1 to
 * beat 2 time. Both categories now always use the even grid (Infinity): the same drum
 * pattern at every tempo. Anchored grids were tried and rejected by ear (November 2026):
 * pinning drums to TOP and IMPACT squeezed the bar between them (Short Game: loop sped up;
 * slow Long Game with the true 3:1: the snare on IMPACT came too soon after the kick on
 * TOP). With the beats and the pause both proportional to tempo, the even grid puts TOP
 * and IMPACT in the same relative spot at every tempo (Long: steps 4.24 and 5.65; Short:
 * steps 3.53 and 5.29); at slow tempos the same relative gap simply lasts longer.
 * 0 means always anchored. Infinity means always even.
 */
export const ANCHOR_MIN_BEAT2_SECONDS: Readonly<Record<Category, number>> = {
  long: Infinity,
  short: Infinity,
};

/** True when the preset's grid is anchored to its beats (see stepTimes). */
export function usesAnchoredGrid(preset: Preset): boolean {
  return beatTimes(preset).beat2 > ANCHOR_MIN_BEAT2_SECONDS[preset.category];
}

/**
 * True when the preset uses the sparse pattern: one kick on beat 1 and a steady hi-hat, no
 * snare (see loopEvents). That is the Practice Drills (42/14, 60/20, 84/28). Chosen by ear
 * (November 2026): at slow tempos every kick-and-snare layout either squeezed the bar
 * between TOP and IMPACT or put the snare far from IMPACT, so the hi-hat carries the pulse.
 */
export function usesSparsePattern(preset: Preset): boolean {
  return isDrillPreset(preset);
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
 * Normal pattern: kicks, snares and accents on the step tables, one hat per step, and a
 * step longer than HAT_MAX_GAP_SECONDS gets extra soft ticks so the pulse stays steady.
 *
 * Sparse pattern (Practice Drills, see usesSparsePattern): one kick on beat 1, no snare, and
 * a single steady hi-hat for the whole bar that you can count. The tick is the downswing
 * (beat 2 to beat 3, one drill count) split into an even number of parts, the fewest that
 * keeps the gap at most HAT_MAX_GAP_SECONDS: two per count for every drill. The drill bar is
 * 12 counts (DRILL_BAR_COUNTS in repeat.ts), so 24 ticks, 3 measures of 8 (swing, recovery,
 * countdown), with ticks exactly on beat 1, TOP, IMPACT, every countdown count and the bar
 * end. The hats on beat 1, TOP and IMPACT are accented.
 */
export function loopEvents(preset: Preset, options: LoopOptions = {}): LoopEvent[] {
  const hatMaxGap = options.hatMaxGapSeconds ?? HAT_MAX_GAP_SECONDS;
  const times = stepTimes(preset);
  const cycle = times[STEPS_PER_BAR];
  const events: LoopEvent[] = [];

  if (usesSparsePattern(preset)) {
    const { beat2, beat3 } = beatTimes(preset);
    const downswing = beat3 - beat2;
    let parts = 2;
    while (downswing / parts > hatMaxGap + TICK_EPSILON) parts += 2;
    const gap = downswing / parts;
    const accentTimes = [0, beat2, beat3];
    events.push({ voice: 'kick', time: 0 });
    for (let i = 0; i * gap < cycle - TICK_EPSILON; i++) {
      const time = i * gap;
      const event: LoopEvent = { voice: 'hat', time };
      if (accentTimes.some((t) => Math.abs(t - time) < ACCENT_MATCH_SECONDS)) event.accent = true;
      events.push(event);
    }
    return events.sort((a, b) => a.time - b.time || VOICE_ORDER[a.voice] - VOICE_ORDER[b.voice]);
  }

  const ghosts = options.ghostKicks ?? GHOST_KICK_PRESETS[preset.category].includes(presetLabel(preset));
  for (let step = 0; step < STEPS_PER_BAR; step++) {
    const start = times[step];
    if (KICK_STEPS.includes(step) || (ghosts && GHOST_KICK_STEPS.includes(step))) {
      events.push({ voice: 'kick', time: start });
    }
    if (SNARE_STEPS.includes(step)) events.push({ voice: 'snare', time: start });
    const length = times[step + 1] - start;
    const ticks = ticksFor(length, hatMaxGap);
    for (let i = 0; i < ticks; i++) {
      const event: LoopEvent = { voice: 'hat', time: start + (i * length) / ticks };
      if (i === 0 && HAT_ACCENT_STEPS.includes(step)) event.accent = true;
      events.push(event);
    }
  }

  return events.sort((a, b) => a.time - b.time || VOICE_ORDER[a.voice] - VOICE_ORDER[b.voice]);
}
