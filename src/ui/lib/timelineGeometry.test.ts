import { describe, expect, it } from 'vitest';
import {
  LONG_GAME_PRESETS,
  SHORT_GAME_PRESETS,
  beatTimes,
  defaultWeightShiftSettings,
  weightShiftTime,
  type Preset,
} from '../../engine';
import { labelsOverlap, timelineGeometry, weightShiftLabel } from './timelineGeometry';

const ALL = [...LONG_GAME_PRESETS, ...SHORT_GAME_PRESETS];
const defaults = defaultWeightShiftSettings();
const geo = (p: Preset) => timelineGeometry(p, defaults[p.category])!;

describe('timelineGeometry', () => {
  it('covers all 16 presets', () => {
    expect(ALL).toHaveLength(16);
  });

  it.each(ALL.map((p) => [`${p.category} ${p.backFrames}/${p.downFrames}`, p] as const))(
    '%s: ordered markers, beat 1 at 0, beat 3 at 1, split at beat 2',
    (_name, p) => {
      const g = geo(p);
      const xs = g.markers.map((m) => m.x);
      expect(g.markers.map((m) => m.type)).toEqual(['beat1', 'weightShift', 'beat2', 'beat3']);
      for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]);
      xs.forEach((x) => {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
      });
      expect(xs[0]).toBe(0);
      expect(xs[3]).toBe(1);
      expect(g.splitX).toBe(xs[2]);
      expect(g.splitX).toBeCloseTo(beatTimes(p).beat2 / beatTimes(p).beat3, 10);
    },
  );

  it('places the diamond at weightShiftTime', () => {
    const p = LONG_GAME_PRESETS[4];
    const g = timelineGeometry(p, 0.5)!;
    const shift = g.markers[1];
    expect(shift.t).toBeCloseTo(weightShiftTime(p, 0.5), 10);
    expect(shift.x).toBeCloseTo(weightShiftTime(p, 0.5) / g.total, 10);
    expect(timelineGeometry(p, 0.8)!.markers[1].x).toBeGreaterThan(shift.x);
  });

  it('labels use the preset frame counts', () => {
    const g = geo(LONG_GAME_PRESETS[4]);
    expect(g.backLabel).toBe('BACKSWING · 30');
    expect(g.downLabel).toBe('DOWN · 10');
    expect(geo(SHORT_GAME_PRESETS[0]).backLabel).toBe('BACKSWING · 14');
  });

  it('changes with the preset', () => {
    expect(geo(LONG_GAME_PRESETS[0])).not.toEqual(geo(LONG_GAME_PRESETS[1]));
    expect(geo(LONG_GAME_PRESETS[0]).total).not.toBe(geo(LONG_GAME_PRESETS[9]).total);
  });

  it('returns null when the engine gives no beat times', () => {
    expect(timelineGeometry({ category: 'long', backFrames: NaN, downFrames: 10 }, 0.67)).toBeNull();
    expect(timelineGeometry({ category: 'long', backFrames: 0, downFrames: 0 }, 0.67)).toBeNull();
  });
});

describe('labelsOverlap', () => {
  it('is false for spaced labels', () => {
    expect(labelsOverlap([40, 40], [20, 100])).toBe(false);
  });
  it('is true for overlapping labels', () => {
    expect(labelsOverlap([40, 40], [20, 50])).toBe(true);
  });
  it('treats touching labels as too close (gap 0 < default 4)', () => {
    expect(labelsOverlap([40, 40], [20, 60])).toBe(true);
    expect(labelsOverlap([40, 40], [20, 60], 0)).toBe(false);
  });
  it('respects the min gap boundary', () => {
    expect(labelsOverlap([40, 40], [20, 64])).toBe(false);
    expect(labelsOverlap([40, 40], [20, 63])).toBe(true);
  });
  it('is false for a single label or none', () => {
    expect(labelsOverlap([40], [20])).toBe(false);
    expect(labelsOverlap([], [])).toBe(false);
  });
  it('handles unsorted input', () => {
    expect(labelsOverlap([40, 40, 40], [200, 20, 110])).toBe(false);
    expect(labelsOverlap([40, 40, 40], [200, 20, 190])).toBe(true);
  });
});

describe('weightShiftLabel', () => {
  it('uses the full label when there is room and the short form otherwise', () => {
    expect(weightShiftLabel(false)).toBe('Weight shift');
    expect(weightShiftLabel(true)).toBe('Shift');
  });
});
