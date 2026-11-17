import { describe, expect, it } from 'vitest';
import { beatTimes } from './beats';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, isDrillPreset, presetLabel, presetsInGroup, type Preset } from './presets';
import {
  DRILL_BAR_COUNTS,
  DRILL_COUNTDOWN_COUNTS,
  DRILL_RECOVERY_COUNTS,
  DRILL_SWING_COUNTS,
  REPEAT_PAUSE_FACTOR,
  cycleSeconds,
  drillCountSeconds,
  repeatPauseSeconds,
} from './repeat';

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
  it('drill bar is 12 counts: swing 4, recovery 4, countdown 4 (one count = one downswing)', () => {
    expect([DRILL_SWING_COUNTS, DRILL_RECOVERY_COUNTS, DRILL_COUNTDOWN_COUNTS, DRILL_BAR_COUNTS]).toEqual([4, 4, 4, 12]);
    const drills = presetsInGroup('long', 'drills');
    expect(drills.map(presetLabel)).toEqual(['42/14', '60/20', '84/28']);
    for (const p of drills) {
      const t = beatTimes(p);
      const count = drillCountSeconds(p);
      expect(count, presetLabel(p)).toBeCloseTo(t.beat3 - t.beat2, 9);
      expect(t.beat3, presetLabel(p)).toBeCloseTo(DRILL_SWING_COUNTS * count, 9);
      expect(repeatPauseSeconds(p), presetLabel(p)).toBeCloseTo((DRILL_RECOVERY_COUNTS + DRILL_COUNTDOWN_COUNTS) * count, 9);
      expect(cycleSeconds(p), presetLabel(p)).toBeCloseTo(DRILL_BAR_COUNTS * count, 9);
    }
  });

  it('drill bar lengths: 42/14 5.6 s, 60/20 8.0 s, 84/28 11.2 s', () => {
    const [a, b, c] = presetsInGroup('long', 'drills');
    expect([cycleSeconds(a), cycleSeconds(b), cycleSeconds(c)].map((x) => Number(x.toFixed(3)))).toEqual([5.6, 8, 11.2]);
  });

  it('Gameplay and Short Game keep the 1.5 pause (unchanged by the drill bar)', () => {
    for (const p of [...LONG_GAME_PRESETS, ...SHORT_GAME_PRESETS].filter((x) => !isDrillPreset(x))) {
      expect(repeatPauseSeconds(p), presetLabel(p)).toBeCloseTo(1.5 * beatTimes(p).beat2, 9);
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
