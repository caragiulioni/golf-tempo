import { describe, expect, it } from 'vitest';
import { beatTimes } from './beats';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, type Preset } from './presets';
import { buildSequence } from './sequence';
import { defaultWeightShiftSettings, withPosition } from './weightShift';

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

const ALL_PRESETS = [...LONG_GAME_PRESETS, ...SHORT_GAME_PRESETS];
const POSITIONS = [0, 0.05, 0.3, 0.67, 0.95, 1];

describe('buildSequence', () => {
  it('30/10 Long with defaults gives four events in order, weight shift between beats 1 and 2', () => {
    const events = buildSequence({ preset: long(30, 10), settings: defaultWeightShiftSettings() });
    expect(events.map((e) => e.type)).toEqual(['beat1', 'weightShift', 'beat2', 'beat3']);
    expect(events[0].time).toBe(0);
    expect(events[1].time).toBeCloseTo(0.53, 6);
    expect(events[2].time).toBeCloseTo(1.0, 6);
    expect(events[3].time).toBeCloseTo(1.5333, 3);
  });

  it('uses the Short Game position for a Short Game preset', () => {
    const events = buildSequence({ preset: short(18, 9), settings: defaultWeightShiftSettings() });
    const shift = events.find((e) => e.type === 'weightShift');
    expect(shift?.time).toBeCloseTo(0.75 * 0.6, 6);
  });

  it('events are always in time order', () => {
    for (const preset of ALL_PRESETS) {
      for (const position of POSITIONS) {
        const settings = withPosition(defaultWeightShiftSettings(), preset.category, position);
        const times = buildSequence({ preset, settings }).map((e) => e.time);
        expect(times).toEqual([...times].sort((a, b) => a - b));
      }
    }
  });
});

describe('three-beat mode', () => {
  it('gives three events with the same beat times as the four-event version', () => {
    const settings = defaultWeightShiftSettings();
    const preset = long(30, 10);
    const three = buildSequence({ preset, settings, includeWeightShift: false });
    const four = buildSequence({ preset, settings }).filter((e) => e.type !== 'weightShift');
    expect(three.map((e) => e.type)).toEqual(['beat1', 'beat2', 'beat3']);
    expect(three).toEqual(four);
  });
});

describe('the three original beats never move', () => {
  it('beats 1, 2 and 3 are identical with and without the weight shift, at any position and tempo', () => {
    for (const preset of ALL_PRESETS) {
      const expected = beatTimes(preset);
      for (const position of POSITIONS) {
        const settings = withPosition(defaultWeightShiftSettings(), preset.category, position);
        for (const includeWeightShift of [true, false]) {
          const events = buildSequence({ preset, settings, includeWeightShift });
          const time = (type: string) => events.find((e) => e.type === type)?.time;
          expect(time('beat1')).toBe(expected.beat1);
          expect(time('beat2')).toBe(expected.beat2);
          expect(time('beat3')).toBe(expected.beat3);
        }
      }
    }
  });
});

describe('weight shift position', () => {
  it('stays at the same relative place at every tempo', () => {
    const settings = defaultWeightShiftSettings();
    for (const preset of LONG_GAME_PRESETS) {
      const events = buildSequence({ preset, settings });
      const beat2 = events.find((e) => e.type === 'beat2')!.time;
      const shift = events.find((e) => e.type === 'weightShift')!.time;
      expect(shift / beat2).toBeCloseTo(0.53, 6);
    }
  });

  it('positions stay independent per category', () => {
    const settings = withPosition(defaultWeightShiftSettings(), 'long', 0.4);
    const longShift = buildSequence({ preset: long(30, 10), settings }).find((e) => e.type === 'weightShift')!;
    const shortShift = buildSequence({ preset: short(18, 9), settings }).find((e) => e.type === 'weightShift')!;
    expect(longShift.time / 1.0).toBeCloseTo(0.4, 6);
    expect(shortShift.time / 0.6).toBeCloseTo(0.75, 6);
  });
});
