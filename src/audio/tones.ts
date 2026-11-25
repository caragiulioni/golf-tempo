import type { Category, EventType } from '../engine';
import type { Voice } from './types';

/** What one beep sounds like. Plain data, no audio code. */
export type ToneSpec = {
  /** Main pitch in Hz. */
  frequency: number;
  /** Length in seconds. */
  seconds: number;
  /** Volume of the second harmonic (2x pitch) relative to the main pitch, 0 to 1. */
  harmonic: number;
  /** Time to reach full volume. Short means a sharp start, which makes timing easy to hear. */
  attackSeconds: number;
  /** Volume relative to the beats, 0 to 1. Default 1. */
  level?: number;
};

/**
 * Starting pitches come from the reference software (about 525, 312 and 350 Hz).
 * Tune by ear.
 */
export const TONES: Readonly<Record<Voice, ToneSpec>> = {
  beat1: { frequency: 525, seconds: 0.14, harmonic: 0.5, attackSeconds: 0.003 },
  beat2: { frequency: 312, seconds: 0.14, harmonic: 0.5, attackSeconds: 0.003 },
  beat3: { frequency: 350, seconds: 0.14, harmonic: 0.5, attackSeconds: 0.003 },
  // Short and crisp, higher than the other three, as loud as the rest.
  weightShift: { frequency: 800, seconds: 0.07, harmonic: 0.3, attackSeconds: 0.002 },
  // Drill countdown candidates (V2-07), picked by ear in the Audio lab. Softer than the beats
  // and kept clear of their pitches (312 to 800 Hz) so they never sound like a beat.
  countTick: { frequency: 1200, seconds: 0.05, harmonic: 0.2, attackSeconds: 0.002, level: 0.6 },
  countLast: { frequency: 1600, seconds: 0.16, harmonic: 0.3, attackSeconds: 0.002, level: 0.8 },
  countFall4: { frequency: 1400, seconds: 0.08, harmonic: 0.2, attackSeconds: 0.002, level: 0.6 },
  countFall3: { frequency: 1250, seconds: 0.08, harmonic: 0.2, attackSeconds: 0.002, level: 0.6 },
  countFall2: { frequency: 1110, seconds: 0.08, harmonic: 0.2, attackSeconds: 0.002, level: 0.6 },
  countFall1: { frequency: 990, seconds: 0.12, harmonic: 0.2, attackSeconds: 0.002, level: 0.7 },
};

/**
 * How the drill countdown sounds (V2-07). Candidates, to be picked by ear:
 * 'tick': the same soft tick on 4, 3, 2 and 1.
 * 'falling': the pitch steps down from 4 to 1.
 * 'lastHigh': a soft tick on 4, 3, 2 and a higher, longer "1".
 */
export type CountdownToneStyle = 'tick' | 'falling' | 'lastHigh';
// Picked by ear by the developer (V2-07). The sound itself is to be redesigned later.
export const DEFAULT_COUNTDOWN_TONE_STYLE: CountdownToneStyle = 'falling';

const FALLING: Readonly<Record<number, Voice>> = { 4: 'countFall4', 3: 'countFall3', 2: 'countFall2', 1: 'countFall1' };

function countdownVoice(count: number, style: CountdownToneStyle): Voice {
  if (style === 'falling') return FALLING[count] ?? 'countFall1';
  if (style === 'lastHigh' && count === 1) return 'countLast';
  return 'countTick';
}

/**
 * 'distinct': the weight shift has its own tone.
 * 'same': it reuses the beat 2 tone, so you can compare by ear.
 */
export type WeightShiftToneStyle = 'distinct' | 'same';
export const DEFAULT_WEIGHT_SHIFT_TONE_STYLE: WeightShiftToneStyle = 'distinct';

/**
 * Which voice an engine event uses. In Short Game, beat 3 sounds like beat 1.
 * `countdown` gives the count (4 to 1) and the countdown style, for countdown events.
 */
export function voiceFor(
  category: Category,
  type: EventType,
  style: WeightShiftToneStyle = DEFAULT_WEIGHT_SHIFT_TONE_STYLE,
  countdown: { count?: number; style?: CountdownToneStyle } = {},
): Voice {
  switch (type) {
    case 'beat1':
      return 'beat1';
    case 'beat2':
      return 'beat2';
    case 'beat3':
      return category === 'short' ? 'beat1' : 'beat3';
    case 'weightShift':
      return style === 'same' ? 'beat2' : 'weightShift';
    case 'countdown':
      return countdownVoice(countdown.count ?? 1, countdown.style ?? DEFAULT_COUNTDOWN_TONE_STYLE);
  }
}
