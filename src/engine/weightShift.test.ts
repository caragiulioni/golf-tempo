import { describe, expect, it } from 'vitest';
import { beatTimes } from './beats';
import type { Preset } from './presets';
import {
  WEIGHT_SHIFT_RANGE,
  clampPosition,
  defaultWeightShiftSettings,
  weightShiftTime,
  withPosition,
} from './weightShift';

const long = (backFrames: number, downFrames: number): Preset => ({
  category: 'long',
  backFrames,
  downFrames,
});

describe('weightShiftTime', () => {
  it('0.5 on 30/10 lands halfway between beat 1 and beat 2', () => {
    expect(weightShiftTime(long(30, 10), 0.5)).toBeCloseTo(0.5, 6);
  });

  it('keeps the same fraction of the beat 1 to 2 gap at every tempo', () => {
    for (const preset of [long(18, 6), long(30, 10), long(168, 56)]) {
      const t = beatTimes(preset);
      expect(weightShiftTime(preset, 0.67) / (t.beat2 - t.beat1)).toBeCloseTo(0.67, 6);
    }
  });

  it('always lands strictly between beat 1 and beat 2', () => {
    const t = beatTimes(long(18, 6));
    for (const position of [-5, 0, 0.5, 1, 5]) {
      const time = weightShiftTime(long(18, 6), position);
      expect(time).toBeGreaterThan(t.beat1);
      expect(time).toBeLessThan(t.beat2);
    }
  });
});

describe('clampPosition', () => {
  it('pulls out-of-range values to the safe range', () => {
    expect(clampPosition(-1)).toBe(WEIGHT_SHIFT_RANGE.min);
    expect(clampPosition(0)).toBe(WEIGHT_SHIFT_RANGE.min);
    expect(clampPosition(1)).toBe(WEIGHT_SHIFT_RANGE.max);
    expect(clampPosition(2)).toBe(WEIGHT_SHIFT_RANGE.max);
  });

  it('leaves in-range values alone', () => {
    expect(clampPosition(0.67)).toBe(0.67);
  });

  it('uses the minimum for NaN', () => {
    expect(clampPosition(Number.NaN)).toBe(WEIGHT_SHIFT_RANGE.min);
  });

  it('safe range is 0.05 to 0.95', () => {
    expect(WEIGHT_SHIFT_RANGE).toEqual({ min: 0.05, max: 0.95 });
  });
});

describe('per-category settings', () => {
  it('defaults are 0.67 for Long Game and 0.75 for Short Game', () => {
    expect(defaultWeightShiftSettings()).toEqual({ long: 0.67, short: 0.75 });
  });

  it('changing Long Game does not change Short Game', () => {
    const before = defaultWeightShiftSettings();
    const after = withPosition(before, 'long', 0.5);
    expect(after.long).toBe(0.5);
    expect(after.short).toBe(before.short);
  });

  it('changing Short Game does not change Long Game', () => {
    const before = defaultWeightShiftSettings();
    const after = withPosition(before, 'short', 0.6);
    expect(after.short).toBe(0.6);
    expect(after.long).toBe(before.long);
  });

  it('does not modify the settings it was given', () => {
    const before = defaultWeightShiftSettings();
    withPosition(before, 'long', 0.3);
    expect(before).toEqual({ long: 0.67, short: 0.75 });
  });

  it('clamps a saved value that is out of range', () => {
    expect(withPosition(defaultWeightShiftSettings(), 'long', 3).long).toBe(WEIGHT_SHIFT_RANGE.max);
  });
});
