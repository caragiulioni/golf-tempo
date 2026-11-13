import { describe, expect, it } from 'vitest';
import { beatTimes } from './beats';
import {
  ANCHOR_STEPS,
  GHOST_KICK_PRESETS,
  GHOST_KICK_STEPS,
  HAT_ACCENT_STEPS,
  HAT_MAX_GAP_SECONDS,
  KICK_STEPS,
  SNARE_STEPS,
  STEPS_PER_BAR,
  loopEvents,
  stepTimes,
  usesAnchoredGrid,
} from './loop';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, presetLabel, type Preset } from './presets';
import { cycleSeconds } from './repeat';

const ALL: readonly Preset[] = [...LONG_GAME_PRESETS, ...SHORT_GAME_PRESETS];

const find = (back: number, down: number): Preset => {
  const p = ALL.find((x) => x.backFrames === back && x.downFrames === down);
  if (!p) throw new Error(`no preset ${back}/${down}`);
  return p;
};

const EPS = 1e-9;
const at = (events: ReturnType<typeof loopEvents>, voice: string, time: number) =>
  events.find((e) => e.voice === voice && Math.abs(e.time - time) < EPS);
const stepOf = (times: number[], time: number) => times.findIndex((t) => Math.abs(t - time) < EPS);
const hatTimes = (events: ReturnType<typeof loopEvents>) => events.filter((e) => e.voice === 'hat').map((e) => e.time);
/** Slow anchored presets tick beat 2 to beat 3 as one span (see loopEvents). */
const middleIsSpan = (p: Preset) => {
  const times = stepTimes(p);
  return usesAnchoredGrid(p) && times[1] - times[0] > HAT_MAX_GAP_SECONDS + EPS;
};

describe('loopEvents, all presets', () => {
  it('covers all 16 presets', () => {
    expect(ALL).toHaveLength(16);
  });

  for (const p of ALL) {
    describe(`${p.category} ${p.backFrames}/${p.downFrames}`, () => {
      const events = loopEvents(p, { ghostKicks: false });
      const times = stepTimes(p);
      const cycle = cycleSeconds(p);
      const { beat2, beat3 } = beatTimes(p);
      const anchor = ANCHOR_STEPS[p.category];

      it('has 12 steps that start at 0, end at the cycle and only go forward', () => {
        expect(times).toHaveLength(STEPS_PER_BAR + 1);
        expect(times[0]).toBe(0);
        expect(times[STEPS_PER_BAR]).toBeCloseTo(cycle, 9);
        for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThan(times[i - 1]);
      });

      if (!usesAnchoredGrid(p)) {
        it('even grid (fast Long Game, all Short Game): like Tour Tempo, beats within half a step of their steps', () => {
          const step = cycle / STEPS_PER_BAR;
          times.forEach((t, i) => expect(t).toBeCloseTo(i * step, 9));
          expect(Math.abs(times[anchor.beat2] - beat2)).toBeLessThan(step / 2);
          expect(Math.abs(times[anchor.beat3] - beat3)).toBeLessThan(step / 2);
        });
      } else {
        it(`anchored grid: beat 2 exactly on step ${anchor.beat2}, beat 3 exactly on step ${anchor.beat3}`, () => {
          expect(times[anchor.beat2]).toBeCloseTo(beat2, 9);
          expect(times[anchor.beat3]).toBeCloseTo(beat3, 9);
        });
      }

      if (usesAnchoredGrid(p)) {
        it('anchored grid: a hat exactly on beats 1, 2 and 3, and the snare on beat 3', () => {
          for (const t of [0, beat2, beat3]) expect(at(events, 'hat', t) ?? null, `hat at ${t}`).not.toBeNull();
          expect(at(events, 'snare', beat3)).toBeDefined();
        });
      }

      it('starts with a kick at time 0', () => {
        expect(events[0]).toMatchObject({ voice: 'kick', time: 0 });
      });

      it('keeps every event inside [0, cycle) and sorted', () => {
        for (const e of events) {
          expect(e.time).toBeGreaterThanOrEqual(0);
          expect(e.time).toBeLessThan(cycle);
        }
        for (let i = 1; i < events.length; i++) {
          expect(events[i].time).toBeGreaterThanOrEqual(events[i - 1].time);
        }
      });

      it('plays kicks on steps 0, 4, 8 and snares on steps 2, 6, 10', () => {
        const stepsFor = (voice: string) =>
          events.filter((e) => e.voice === voice).map((e) => stepOf(times, e.time));
        expect(stepsFor('kick')).toEqual([...KICK_STEPS]);
        expect(stepsFor('snare')).toEqual([...SNARE_STEPS]);
      });

      it('plays a hat on every step (outside a slow middle span), accented on the accent steps only', () => {
        for (let step = 0; step < STEPS_PER_BAR; step++) {
          if (middleIsSpan(p) && step > anchor.beat2 && step < anchor.beat3) continue;
          const hat = at(events, 'hat', times[step]);
          expect(hat, `step ${step}`).toBeDefined();
          expect(hat?.accent === true).toBe(HAT_ACCENT_STEPS.includes(step));
        }
      });

      it('keeps hat gaps at most 0.5 s (a slow middle span may run 5% over), including the wrap', () => {
        const hats = hatTimes(events);
        const limit = HAT_MAX_GAP_SECONDS * (middleIsSpan(p) ? 1.05 : 1) + EPS;
        for (let i = 1; i < hats.length; i++) expect(hats[i] - hats[i - 1]).toBeLessThanOrEqual(limit);
        expect(cycle - hats[hats.length - 1]).toBeLessThanOrEqual(HAT_MAX_GAP_SECONDS + EPS);
      });

      it('keeps the hat pulse steady: no gap more than 15% off the first gap (Long Game) or 25% (Short Game)', () => {
        const hats = hatTimes(events);
        const first = hats[1] - hats[0];
        const allowed = p.category === 'long' ? 0.15 : 0.25;
        for (let i = 1; i < hats.length; i++) {
          expect(Math.abs((hats[i] - hats[i - 1]) / first - 1)).toBeLessThanOrEqual(allowed + EPS);
        }
      });

      it('gives the same output for the same input', () => {
        expect(loopEvents(p, { ghostKicks: false })).toEqual(events);
        expect(loopEvents(p)).toEqual(loopEvents(p));
      });
    });
  }
});

describe('ghost kicks', () => {
  const ghostCount = (p: Preset, ghostKicks?: boolean) => {
    const kicks = loopEvents(p, ghostKicks === undefined ? {} : { ghostKicks }).filter((e) => e.voice === 'kick');
    return kicks.length - KICK_STEPS.length;
  };

  it('play exactly on the listed presets (Long 18/6, Short 14/7 and 16/8)', () => {
    expect(GHOST_KICK_PRESETS).toEqual({ long: ['18/6'], short: ['14/7', '16/8'] });
    for (const p of ALL) {
      const listed = GHOST_KICK_PRESETS[p.category].includes(presetLabel(p));
      expect(ghostCount(p), `${p.category} ${presetLabel(p)}`).toBe(listed ? GHOST_KICK_STEPS.length : 0);
    }
  });

  it('play at 18/6, where Tour Tempo has them', () => {
    expect(ghostCount(find(18, 6))).toBe(GHOST_KICK_STEPS.length);
    const times = stepTimes(find(18, 6));
    const kicks = loopEvents(find(18, 6)).filter((e) => e.voice === 'kick');
    expect(kicks.map((k) => stepOf(times, k.time))).toEqual([0, 1, 4, 5, 8, 9]);
  });

  it('are absent from 21/7 up, as in Tour Tempo', () => {
    for (const p of [find(21, 7), find(30, 10), find(168, 56)]) expect(ghostCount(p)).toBe(0);
  });

  it('can be forced on or off', () => {
    expect(ghostCount(find(30, 10), true)).toBe(GHOST_KICK_STEPS.length);
    expect(ghostCount(find(18, 6), false)).toBe(0);
  });
});

describe('loopEvents, named examples', () => {
  it('30/10: even steps of about 0.25 s, like Tour Tempo', () => {
    const times = stepTimes(find(30, 10));
    expect(times[1]).toBeCloseTo(0.2528, 3);
    expect(times[4]).toBeCloseTo(1.011, 2);
    expect(times[6]).toBeCloseTo(1.517, 2);
  });

  it('18/6: every step is the same length, so the loop never changes speed inside the bar', () => {
    const times = stepTimes(find(18, 6));
    const first = times[1] - times[0];
    for (let i = 1; i < times.length; i++) expect(times[i] - times[i - 1]).toBeCloseTo(first, 9);
  });

  it('168/56: beat 3 is on step 6 (7.67 s) and long steps get extra soft hats', () => {
    const p = find(168, 56);
    const events = loopEvents(p);
    expect(stepTimes(p)[ANCHOR_STEPS.long.beat3]).toBeCloseTo(7.667, 3);
    expect(at(events, 'snare', stepTimes(p)[ANCHOR_STEPS.long.beat3])).toBeDefined();
    expect(events.filter((e) => e.voice === 'hat').length).toBeGreaterThan(STEPS_PER_BAR);
    expect(events.filter((e) => e.voice === 'hat' && e.accent)).toHaveLength(HAT_ACCENT_STEPS.length);
  });

  it('the hat gap option overrides the constant', () => {
    const hats = loopEvents(find(168, 56), { hatMaxGapSeconds: 100 }).filter((e) => e.voice === 'hat');
    expect(hats).toHaveLength(STEPS_PER_BAR);
  });
});

describe('audit fixes', () => {
  it('60/20: a step of exactly 0.5 s gets one hat, not two (rounding bug)', () => {
    const gaps = hatTimes(loopEvents(find(60, 20)));
    const steps = gaps.slice(1).map((t, i) => t - gaps[i]);
    for (const g of steps) expect(g).toBeGreaterThan(0.4);
  });

  it('168/56: beat 2 to beat 3 hats are about 0.52 s apart, close to the 0.47 s elsewhere', () => {
    const p = find(168, 56);
    const { beat2, beat3 } = beatTimes(p);
    const middle = hatTimes(loopEvents(p)).filter((t) => t >= beat2 - EPS && t < beat3 - EPS);
    expect(middle).toHaveLength(4);
    expect(middle[1] - middle[0]).toBeCloseTo((beat3 - beat2) / 4, 9);
  });

  it('Short Game uses the even grid: every step the same length, no speed change inside the bar', () => {
    for (const p of SHORT_GAME_PRESETS) {
      expect(usesAnchoredGrid(p), presetLabel(p)).toBe(false);
      const times = stepTimes(p);
      const first = times[1] - times[0];
      for (let i = 1; i < times.length; i++) expect(times[i] - times[i - 1]).toBeCloseTo(first, 9);
    }
  });

  it('grid choice: fast Long even, slow Long anchored, Short even', () => {
    for (const p of LONG_GAME_PRESETS.slice(0, 5)) expect(usesAnchoredGrid(p)).toBe(false);
    for (const p of LONG_GAME_PRESETS.slice(5)) expect(usesAnchoredGrid(p)).toBe(true);
    for (const p of SHORT_GAME_PRESETS) expect(usesAnchoredGrid(p)).toBe(false);
  });
});
