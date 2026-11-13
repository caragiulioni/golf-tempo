import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WEIGHT_SHIFT_POSITIONS,
  WEIGHT_SHIFT_RANGE,
  defaultWeightShiftSettings,
} from '../engine';
import {
  APPLIED_VERSION,
  mergeApplied,
  parseApplied,
  serializeApplied,
  withApplied,
} from './appliedSettings';

const defaults = defaultWeightShiftSettings();
const text = (value: unknown) => JSON.stringify(value);

describe('parseApplied: whole entry unusable gives defaults', () => {
  const bad: Array<[string, string | null]> = [
    ['missing', null],
    ['empty text', ''],
    ['not JSON', '{oops'],
    ['array', '[]'],
    ['null', 'null'],
    ['number', '5'],
    ['string', '"hi"'],
    ['no version', text({ long: 0.7 })],
    ['unknown version', text({ version: 99, long: 0.7 })],
    ['version as text', text({ version: '1', long: 0.7 })],
  ];
  it.each(bad)('%s', (_name, raw) => {
    const result = parseApplied(raw);
    expect(result.settings).toEqual(defaults);
    expect(result.applied).toEqual({ long: false, short: false });
  });
});

describe('parseApplied: each category on its own', () => {
  it('keeps good values and marks them applied', () => {
    const result = parseApplied(text({ version: APPLIED_VERSION, long: 0.53, short: 0.71 }));
    expect(result.settings).toEqual({ long: 0.53, short: 0.71 });
    expect(result.applied).toEqual({ long: true, short: true });
  });

  it('a category left out stays default and not applied', () => {
    const result = parseApplied(text({ version: APPLIED_VERSION, long: 0.8 }));
    expect(result.settings).toEqual({ long: 0.8, short: DEFAULT_WEIGHT_SHIFT_POSITIONS.short });
    expect(result.applied).toEqual({ long: true, short: false });
  });

  const badValues: Array<[string, unknown]> = [
    ['string', '0.7'],
    ['null', null],
    ['NaN written as null', null],
    ['below range', WEIGHT_SHIFT_RANGE.min - 0.01],
    ['above range', WEIGHT_SHIFT_RANGE.max + 0.01],
    ['zero', 0],
    ['one', 1],
    ['negative', -0.5],
    ['huge', 5],
    ['boolean', true],
    ['object', { x: 1 }],
  ];
  it.each(badValues)('bad long (%s) falls back, good short is kept', (_name, value) => {
    const result = parseApplied(text({ version: APPLIED_VERSION, long: value, short: 0.7 }));
    expect(result.settings.long).toBe(DEFAULT_WEIGHT_SHIFT_POSITIONS.long);
    expect(result.applied.long).toBe(false);
    expect(result.settings.short).toBe(0.7);
    expect(result.applied.short).toBe(true);
  });

  it('bad short falls back, good long is kept', () => {
    const result = parseApplied(text({ version: APPLIED_VERSION, long: 0.4, short: 9 }));
    expect(result.settings).toEqual({ long: 0.4, short: DEFAULT_WEIGHT_SHIFT_POSITIONS.short });
    expect(result.applied).toEqual({ long: true, short: false });
  });

  it('accepts the exact ends of the safe range', () => {
    const result = parseApplied(
      text({ version: APPLIED_VERSION, long: WEIGHT_SHIFT_RANGE.min, short: WEIGHT_SHIFT_RANGE.max }),
    );
    expect(result.settings).toEqual({ long: WEIGHT_SHIFT_RANGE.min, short: WEIGHT_SHIFT_RANGE.max });
  });

  it('ignores extra keys', () => {
    const result = parseApplied(text({ version: APPLIED_VERSION, long: 0.6, extra: 'x' }));
    expect(result.settings.long).toBe(0.6);
  });
});

describe('serializeApplied', () => {
  it('writes only applied categories', () => {
    const state = withApplied(parseApplied(null), 'long', 0.55);
    expect(JSON.parse(serializeApplied(state))).toEqual({ version: APPLIED_VERSION, long: 0.55 });
  });

  it('round trips', () => {
    let state = withApplied(parseApplied(null), 'long', 0.42);
    state = withApplied(state, 'short', 0.66);
    expect(parseApplied(serializeApplied(state))).toEqual(state);
  });

  it('writes nothing but the version when nothing is applied', () => {
    expect(JSON.parse(serializeApplied(parseApplied(null)))).toEqual({ version: APPLIED_VERSION });
  });

  it('keeps written values inside the safe range', () => {
    const state = {
      settings: { long: 7, short: -3 },
      applied: { long: true, short: true },
    };
    const back = parseApplied(serializeApplied(state));
    expect(back.settings.long).toBe(WEIGHT_SHIFT_RANGE.max);
    expect(back.settings.short).toBe(WEIGHT_SHIFT_RANGE.min);
  });
});

describe('mergeApplied', () => {
  it('applying one category keeps the other as stored', () => {
    const stored = text({ version: APPLIED_VERSION, long: 0.45, short: 0.7 });
    const next = parseApplied(mergeApplied(stored, 'long', 0.5));
    expect(next.settings).toEqual({ long: 0.5, short: 0.7 });
    expect(next.applied).toEqual({ long: true, short: true });
  });

  it('applying short leaves long as stored', () => {
    const stored = text({ version: APPLIED_VERSION, long: 0.45, short: 0.7 });
    const next = parseApplied(mergeApplied(stored, 'short', 0.9));
    expect(next.settings).toEqual({ long: 0.45, short: 0.9 });
  });

  it('works from nothing stored: the other category stays unapplied', () => {
    const next = parseApplied(mergeApplied(null, 'short', 0.65));
    expect(next.settings).toEqual({ long: DEFAULT_WEIGHT_SHIFT_POSITIONS.long, short: 0.65 });
    expect(next.applied).toEqual({ long: false, short: true });
  });

  it('works from corrupted storage', () => {
    const next = parseApplied(mergeApplied('{oops', 'long', 0.3));
    expect(next.settings.long).toBe(0.3);
    expect(next.applied).toEqual({ long: true, short: false });
  });

  it('drops a bad value in the other category instead of keeping it', () => {
    const stored = text({ version: APPLIED_VERSION, long: 9, short: 0.7 });
    const next = parseApplied(mergeApplied(stored, 'short', 0.8));
    expect(next.applied.long).toBe(false);
    expect(next.settings.long).toBe(DEFAULT_WEIGHT_SHIFT_POSITIONS.long);
  });

  it('clamps an out-of-range position being applied', () => {
    const next = parseApplied(mergeApplied(null, 'long', 3));
    expect(next.settings.long).toBe(WEIGHT_SHIFT_RANGE.max);
  });
});
