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
};

/**
 * 'distinct': the weight shift has its own tone.
 * 'same': it reuses the beat 2 tone, so you can compare by ear.
 */
export type WeightShiftToneStyle = 'distinct' | 'same';
export const DEFAULT_WEIGHT_SHIFT_TONE_STYLE: WeightShiftToneStyle = 'distinct';

/** Which voice an engine event uses. In Short Game, beat 3 sounds like beat 1. */
export function voiceFor(
  category: Category,
  type: EventType,
  style: WeightShiftToneStyle = DEFAULT_WEIGHT_SHIFT_TONE_STYLE,
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
  }
}
