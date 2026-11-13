import { describe, expect, it } from 'vitest';
import { beatTimes } from './beats';
import {
  ANCHOR_MIN_BEAT2_SECONDS,
  BEAT2_STEP,
  BEAT3_STEP,
  GHOST_KICK_STEPS,
  HAT_ACCENT_STEPS,
  HAT_MAX_GAP_SECONDS,
  KICK_STEPS,
  SNARE_STEPS,
  STEPS_PER_BAR,
  loopEvents,
  stepTimes,
} from './loop';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, type Preset } from './presets';
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

      it('has 12 steps that start at 0, end at the cycle and only go forward', () => {
        expect(times).toHaveLength(STEPS_PER_BAR + 1);
        expect(times[0]).toBe(0);
        expect(times[STEPS_PER_BAR]).toBeCloseTo(cycle, 9);
        for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThan(times[i - 1]);
      });

      if (beat2 <= ANCHOR_MIN_BEAT2_SECONDS) {
        it('fast preset: uses an even grid like Tour Tempo, beat 3 within half a step of step 6', () => {
          const step = cycle / STEPS_PER_BAR;
          times.forEach((t, i) => expect(t).toBeCloseTo(i * step, 9));
          expect(Math.abs(times[BEAT3_STEP] - beat3)).toBeLessThan(step / 2);
          // Long Game beat 2 sits near step 4. Short Game (2:1) beat 2 sits near step 3.
          const beat2Step = p.category === 'long' ? BEAT2_STEP : 3;
          expect(Math.abs(times[beat2Step] - beat2)).toBeLessThan(step / 2);
        });
      } else {
        it('slow preset: puts beat 2 exactly on step 4 and beat 3 exactly on step 6', () => {
          expect(times[BEAT2_STEP]).toBeCloseTo(beat2, 9);
          expect(times[BEAT3_STEP]).toBeCloseTo(beat3, 9);
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

      it('plays a hat on every step, accented on the accent steps only', () => {
        for (let step = 0; step < STEPS_PER_BAR; step++) {
          const hat = at(events, 'hat', times[step]);
          expect(hat, `step ${step}`).toBeDefined();
          expect(hat?.accent === true).toBe(HAT_ACCENT_STEPS.includes(step));
        }
      });

      it('keeps hat gaps at most 0.5 s, including the wrap to the next bar', () => {
        const hats = events.filter((e) => e.voice === 'hat').map((e) => e.time);
        for (let i = 1; i < hats.length; i++) {
          expect(hats[i] - hats[i - 1]).toBeLessThanOrEqual(HAT_MAX_GAP_SECONDS + EPS);
        }
        expect(cycle - hats[hats.length - 1]).toBeLessThanOrEqual(HAT_MAX_GAP_SECONDS + EPS);
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
    expect(stepTimes(p)[BEAT3_STEP]).toBeCloseTo(7.667, 3);
    expect(at(events, 'snare', stepTimes(p)[BEAT3_STEP])).toBeDefined();
    expect(events.filter((e) => e.voice === 'hat').length).toBeGreaterThan(STEPS_PER_BAR);
    expect(events.filter((e) => e.voice === 'hat' && e.accent)).toHaveLength(HAT_ACCENT_STEPS.length);
  });

  it('the hat gap option overrides the constant', () => {
    const hats = loopEvents(find(168, 56), { hatMaxGapSeconds: 100 }).filter((e) => e.voice === 'hat');
    expect(hats).toHaveLength(STEPS_PER_BAR);
  });
});
