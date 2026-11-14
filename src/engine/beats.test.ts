import { describe, expect, it } from 'vitest';
import { BEAT3_DELAY_SECONDS, beatTimes } from './beats';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, presetLabel, type Preset } from './presets';

const long = (backFrames: number, downFrames: number): Preset => ({
  category: 'long',
  backFrames,
  downFrames,
});
const short = (backFrames: number, downFrames: number): Preset => ({
  category: 'short',
  backFrames,
  downFrames,
});

describe('beatTimes', () => {
  it('30/10 gives beats at 0, 1.0 and 1.333 s', () => {
    const t = beatTimes(long(30, 10));
    expect(t.beat1).toBe(0);
    expect(t.beat2).toBeCloseTo(1.0, 6);
    expect(t.beat3).toBeCloseTo(4 / 3, 6);
  });

  it('adds no extra delay to impact', () => {
    expect(BEAT3_DELAY_SECONDS).toBe(0);
  });

  it('TOP is at exactly 3/4 of the swing in Long Game and 2/3 in Short Game, at every tempo', () => {
    for (const p of LONG_GAME_PRESETS) {
      const t = beatTimes(p);
      expect(t.beat2 / t.beat3, presetLabel(p)).toBeCloseTo(3 / 4, 9);
    }
    for (const p of SHORT_GAME_PRESETS) {
      const t = beatTimes(p);
      expect(t.beat2 / t.beat3, presetLabel(p)).toBeCloseTo(2 / 3, 9);
    }
  });
});

// Measured gaps from screen recordings of the reference software (_references/tempo-measurements.md).
// [preset, beat 1 to 2 seconds, beat 2 to 3 seconds]
// Beat 1 to 2 matches the frame count, and so do we. Beat 2 to 3 in the reference is about
// 0.2 s longer than the frame count; we no longer copy that (BEAT3_DELAY_SECONDS is 0).
const MEASURED: ReadonlyArray<[Preset, number, number]> = [
  [long(18, 6), 0.598, 0.412],
  [long(21, 7), 0.702, 0.428],
  [long(24, 8), 0.798, 0.467],
  [long(27, 9), 0.901, 0.499],
  [long(30, 10), 0.99, 0.511],
  [short(14, 7), 0.463, 0.438],
  [short(16, 8), 0.532, 0.466],
  [short(18, 9), 0.599, 0.5],
  [short(20, 10), 0.666, 0.533],
  [short(22, 11), 0.728, 0.571],
  [short(24, 12), 0.795, 0.601],
];
const TOLERANCE_SECONDS = 0.025;

describe('beatTimes against reference measurements', () => {
  it.each(MEASURED)('%o: beat 1 to 2 within 25 ms; beat 2 to 3 is the frame count', (preset, gap12, gap23) => {
    const t = beatTimes(preset);
    expect(Math.abs(t.beat2 - t.beat1 - gap12), `${presetLabel(preset)} beat 1 to 2`).toBeLessThanOrEqual(
      TOLERANCE_SECONDS,
    );
    expect(t.beat3 - t.beat2, `${presetLabel(preset)} beat 2 to 3`).toBeCloseTo(preset.downFrames / 30, 9);
    // Documents the difference: the reference plays impact about 0.2 s later than we do.
    expect(Math.abs(gap23 - (t.beat3 - t.beat2) - 0.2), `${presetLabel(preset)} reference extra`).toBeLessThanOrEqual(
      TOLERANCE_SECONDS,
    );
  });

  it('covers all 11 measured presets', () => {
    const measured = [...LONG_GAME_PRESETS.slice(0, 5), ...SHORT_GAME_PRESETS];
    expect(MEASURED.map(([p]) => presetLabel(p))).toEqual(measured.map(presetLabel));
  });
});

describe('beatTimes ordering', () => {
  it('beats are in increasing order for every preset', () => {
    for (const preset of [...LONG_GAME_PRESETS, ...SHORT_GAME_PRESETS]) {
      const t = beatTimes(preset);
      expect(t.beat1).toBeLessThan(t.beat2);
      expect(t.beat2).toBeLessThan(t.beat3);
    }
  });
});
