import { describe, expect, it } from 'vitest';
import {
  HAT_MAX_GAP_SECONDS,
  NORMAL_PATTERN,
  QUARTERS_PER_BAR,
  SLOW_PATTERN,
  SLOW_QUARTER_SECONDS,
  loopEvents,
} from './loop';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, type Preset } from './presets';

const ALL: readonly Preset[] = [...LONG_GAME_PRESETS, ...SHORT_GAME_PRESETS];
import { cycleSeconds } from './repeat';

const find = (back: number, down: number): Preset => {
  const p = ALL.find((x) => x.backFrames === back && x.downFrames === down);
  if (!p) throw new Error(`no preset ${back}/${down}`);
  return p;
};

const quarterOf = (p: Preset) => cycleSeconds(p) / QUARTERS_PER_BAR;
const isSlow = (p: Preset) => quarterOf(p) > SLOW_QUARTER_SECONDS;

describe('loopEvents, all presets', () => {
  it('covers all 16 presets', () => {
    expect(ALL).toHaveLength(16);
  });

  for (const p of ALL) {
    const name = `${p.category} ${p.backFrames}/${p.downFrames}`;

    describe(name, () => {
      const events = loopEvents(p);
      const cycle = cycleSeconds(p);
      const quarter = quarterOf(p);

      it('starts with a kick at time 0', () => {
        expect(events[0]).toMatchObject({ voice: 'kick', time: 0 });
      });

      it('keeps every event inside [0, cycle)', () => {
        for (const e of events) {
          expect(e.time).toBeGreaterThanOrEqual(0);
          expect(e.time).toBeLessThan(cycle);
        }
      });

      it('is sorted by time', () => {
        for (let i = 1; i < events.length; i++) {
          expect(events[i].time).toBeGreaterThanOrEqual(events[i - 1].time);
        }
      });

      it('keeps hat gaps at most 0.5 s, including the wrap to the next bar', () => {
        const hats = events.filter((e) => e.voice === 'hat').map((e) => e.time);
        for (let i = 1; i < hats.length; i++) {
          expect(hats[i] - hats[i - 1]).toBeLessThanOrEqual(HAT_MAX_GAP_SECONDS + 1e-9);
        }
        expect(cycle - hats[hats.length - 1]).toBeLessThanOrEqual(HAT_MAX_GAP_SECONDS + 1e-9);
      });

      it('spaces hat ticks evenly with one on each quarter start', () => {
        const hats = events.filter((e) => e.voice === 'hat').map((e) => e.time);
        const perQuarter = hats.length / QUARTERS_PER_BAR;
        expect(Number.isInteger(perQuarter)).toBe(true);
        const step = quarter / perQuarter;
        hats.forEach((t, i) => expect(t).toBeCloseTo(i * step, 9));
        for (let q = 0; q < QUARTERS_PER_BAR; q++) {
          expect(hats.some((t) => Math.abs(t - q * quarter) < 1e-9)).toBe(true);
        }
      });

      it('puts kick and snare on the quarters of the right table', () => {
        const table = isSlow(p) ? SLOW_PATTERN : NORMAL_PATTERN;
        const at = (voice: 'kick' | 'snare') =>
          events.filter((e) => e.voice === voice).map((e) => Math.round(e.time / quarter) + 1);
        expect(at('kick')).toEqual([...table.kick]);
        expect(at('snare')).toEqual([...table.snare]);
        for (const e of events.filter((x) => x.voice !== 'hat')) {
          const q = e.time / quarter;
          expect(q).toBeCloseTo(Math.round(q), 9);
        }
      });

      it('gives the same output for the same input', () => {
        expect(loopEvents(p)).toEqual(events);
      });
    });
  }
});

describe('loopEvents, named examples', () => {
  it('30/10 has 2 hat ticks per quarter and the normal table', () => {
    const p = find(30, 10);
    const events = loopEvents(p);
    expect(events.filter((e) => e.voice === 'hat')).toHaveLength(2 * QUARTERS_PER_BAR);
    expect(isSlow(p)).toBe(false);
    expect(events.filter((e) => e.voice === 'kick')).toHaveLength(2);
    expect(events[2].voice).toBe('hat');
    expect(events[2].time).toBeCloseTo(quarterOf(p) / 2, 9);
  });

  it('168/56 has 9 hat ticks per quarter and the slow table', () => {
    const p = find(168, 56);
    const events = loopEvents(p);
    expect(events.filter((e) => e.voice === 'hat')).toHaveLength(9 * QUARTERS_PER_BAR);
    expect(isSlow(p)).toBe(true);
    expect(events.filter((e) => e.voice === 'kick')).toHaveLength(1);
    expect(events.filter((e) => e.voice === 'snare')).toHaveLength(1);
  });

  it('84/28 stays on the normal table', () => {
    expect(isSlow(find(84, 28))).toBe(false);
  });

  it('marks only the first hat tick of each quarter as accent', () => {
    const hats = loopEvents(find(30, 10)).filter((e) => e.voice === 'hat');
    expect(hats.map((h) => h.accent === true)).toEqual([true, false, true, false, true, false, true, false]);
  });

  it('options override the constants', () => {
    const p = find(30, 10);
    const hats = loopEvents(p, { hatMaxGapSeconds: 10 }).filter((e) => e.voice === 'hat');
    expect(hats).toHaveLength(QUARTERS_PER_BAR);
    const slow = loopEvents(p, { slowQuarterSeconds: 0.1 });
    expect(slow.filter((e) => e.voice === 'kick')).toHaveLength(1);
  });
});
