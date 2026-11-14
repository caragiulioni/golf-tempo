import { describe, expect, it } from 'vitest';
import { beatTimes } from './beats';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, type Preset } from './presets';
import { REPEAT_PAUSE_FACTOR, cycleSeconds, repeatPauseSeconds } from './repeat';

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

describe('repeat pause', () => {
  it('uses 1.5 for Long Game and Short Game', () => {
    expect(REPEAT_PAUSE_FACTOR).toEqual({ long: 1.5, short: 1.5 });
  });

  it('30/10 pauses 1.5 s', () => {
    expect(repeatPauseSeconds(long(30, 10))).toBeCloseTo(1.5, 6);
  });

  it('scales with tempo: slower presets pause longer', () => {
    for (const presets of [LONG_GAME_PRESETS, SHORT_GAME_PRESETS]) {
      for (let i = 1; i < presets.length; i++) {
        expect(repeatPauseSeconds(presets[i])).toBeGreaterThan(repeatPauseSeconds(presets[i - 1]));
      }
    }
  });
});

describe('cycleSeconds', () => {
  it('slow Long Game (42/14 and up): rest is 4 downswings, so the bar is exactly 8 downswings', () => {
    for (const p of LONG_GAME_PRESETS.slice(5)) {
      const t = beatTimes(p);
      const downswing = t.beat3 - t.beat2;
      expect(repeatPauseSeconds(p)).toBeCloseTo(4 * downswing, 9);
      expect(cycleSeconds(p)).toBeCloseTo(8 * downswing, 9);
    }
  });

  it('is beat 3 plus the pause', () => {
    const preset = long(30, 10);
    expect(cycleSeconds(preset)).toBeCloseTo(beatTimes(preset).beat3 + repeatPauseSeconds(preset), 6);
  });

  // Beat 1 to the next beat 1, measured from the reference clips (_references/tempo-measurements.md).
  const LONG_CLIPS: ReadonlyArray<[Preset, number]> = [
    [long(18, 6), 1.915],
    [long(21, 7), 2.23],
    [long(24, 8), 2.5],
    [long(27, 9), 2.78],
    [long(30, 10), 3.0],
  ];
  const SHORT_CLIPS: ReadonlyArray<[Preset, number]> = [
    [short(14, 7), 1.845],
    [short(16, 8), 2.045],
    [short(18, 9), 2.286],
    [short(20, 10), 2.45],
    [short(22, 11), 2.6],
    [short(24, 12), 2.8],
  ];

  // The reference plays impact about 0.2 s late (see beats.ts); we do not, and the pause is
  // unchanged, so our Long Game cycle is the clip's minus about 0.2 s. Accepted by ear.
  it.each(LONG_CLIPS)('Long Game %o is the clip minus 0.2 s, within 60 ms', (preset, measured) => {
    expect(Math.abs(cycleSeconds(preset) - (measured - 0.2))).toBeLessThanOrEqual(0.06);
  });

  // Short Game rests less than the reference: the bar is exactly 3 x the time to TOP so the
  // loop's kick and snare land on TOP and IMPACT. Chosen by ear, November 2026.
  it.each(SHORT_CLIPS)('Short Game %o is exactly 3 x TOP, shorter than the clip', (preset, measured) => {
    expect(cycleSeconds(preset)).toBeCloseTo(3 * beatTimes(preset).beat2, 9);
    expect(cycleSeconds(preset)).toBeLessThan(measured);
  });
});
