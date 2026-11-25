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
  usesSparsePattern,
} from './loop';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, presetLabel, type Preset } from './presets';
import { DRILL_BAR_COUNTS, cycleSeconds, drillCountSeconds } from './repeat';
import { buildSequence, leadInEvents } from './sequence';
import { defaultWeightShiftSettings } from './weightShift';

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

describe('loopEvents, all presets', () => {
  it('covers all 14 presets', () => {
    expect(ALL).toHaveLength(14);
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

      it('even grid: every step the same length, beats near their drum steps (normal pattern)', () => {
        const step = cycle / STEPS_PER_BAR;
        times.forEach((t, i) => expect(t).toBeCloseTo(i * step, 9));
        if (usesSparsePattern(p)) return; // no kick or snare steps to land near
        expect(Math.abs(times[anchor.beat2] - beat2)).toBeLessThan(step / 2);
        expect(Math.abs(times[anchor.beat3] - beat3)).toBeLessThan(step / 2);
      });

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

      if (usesSparsePattern(p)) {
        it('sparse pattern: one kick on beat 1, no snare', () => {
          expect(events.filter((e) => e.voice === 'kick').map((e) => e.time)).toEqual([0]);
          expect(events.filter((e) => e.voice === 'snare')).toHaveLength(0);
        });

        it('sparse pattern: one steady hat tick for the whole bar, ending exactly at the bar end', () => {
          const hats = hatTimes(events);
          const gap = hats[1] - hats[0];
          for (let i = 1; i < hats.length; i++) expect(hats[i] - hats[i - 1]).toBeCloseTo(gap, 9);
          expect(cycle - hats[hats.length - 1]).toBeCloseTo(gap, 9);
        });

        it('sparse pattern: accented hats exactly on beat 1, TOP and IMPACT, and nowhere else', () => {
          const accents = events.filter((e) => e.voice === 'hat' && e.accent).map((e) => e.time);
          expect(accents).toHaveLength(3);
          [0, beat2, beat3].forEach((t, i) => expect(accents[i]).toBeCloseTo(t, 9));
        });
      } else {
        it('plays kicks on steps 0, 4, 8 and snares on steps 2, 6, 10', () => {
          const stepsFor = (voice: string) =>
            events.filter((e) => e.voice === voice).map((e) => stepOf(times, e.time));
          expect(stepsFor('kick')).toEqual([...KICK_STEPS]);
          expect(stepsFor('snare')).toEqual([...SNARE_STEPS]);
        });

        it('plays a hat on every step, accented on accent steps only', () => {
          for (let step = 0; step < STEPS_PER_BAR; step++) {
            const hat = at(events, 'hat', times[step]);
            expect(hat, `step ${step}`).toBeDefined();
            expect(hat?.accent === true, `step ${step} accent`).toBe(HAT_ACCENT_STEPS.includes(step));
          }
        });
      }

      it('keeps hat gaps within the limit (0.5 s, or 0.7 s for the sparse pattern), including the wrap', () => {
        const hats = hatTimes(events);
        const limit = HAT_MAX_GAP_SECONDS + EPS;
        for (let i = 1; i < hats.length; i++) expect(hats[i] - hats[i - 1]).toBeLessThanOrEqual(limit);
        expect(cycle - hats[hats.length - 1]).toBeLessThanOrEqual(limit);
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

  it('are off by default: no preset is listed (removed November 2026)', () => {
    expect(GHOST_KICK_PRESETS).toEqual({ long: [], short: [] });
  });

  it('play exactly on the listed presets (none by default)', () => {
    for (const p of ALL.filter((x) => !usesSparsePattern(x))) {
      const listed = GHOST_KICK_PRESETS[p.category].includes(presetLabel(p));
      expect(ghostCount(p), `${p.category} ${presetLabel(p)}`).toBe(listed ? GHOST_KICK_STEPS.length : 0);
    }
  });

  it('18/6, 14/7 and 16/8 play plain kick, snare (kicks only on steps 0, 4, 8)', () => {
    for (const p of [find(18, 6), find(14, 7), find(16, 8)]) {
      const times = stepTimes(p);
      const kicks = loopEvents(p).filter((e) => e.voice === 'kick');
      expect(kicks.map((k) => stepOf(times, k.time)), presetLabel(p)).toEqual([...KICK_STEPS]);
    }
  });

  it('when forced on, land on steps 1, 5, 9 (the Tour Tempo 18/6 pattern)', () => {
    const times = stepTimes(find(18, 6));
    const kicks = loopEvents(find(18, 6), { ghostKicks: true }).filter((e) => e.voice === 'kick');
    expect(kicks.map((k) => stepOf(times, k.time))).toEqual([0, 1, 4, 5, 8, 9]);
  });

  it('can be forced on or off', () => {
    expect(ghostCount(find(30, 10), true)).toBe(GHOST_KICK_STEPS.length);
    expect(ghostCount(find(18, 6), true)).toBe(GHOST_KICK_STEPS.length);
    expect(ghostCount(find(18, 6), false)).toBe(0);
  });
});

describe('loopEvents, named examples', () => {
  it('30/10: even steps of about 0.24 s (cycle 2.833 s)', () => {
    const times = stepTimes(find(30, 10));
    expect(times[1]).toBeCloseTo(0.2361, 3);
    expect(times[4]).toBeCloseTo(0.944, 3);
    expect(times[6]).toBeCloseTo(1.417, 3);
  });

  it('18/6: every step is the same length, so the loop never changes speed inside the bar', () => {
    const times = stepTimes(find(18, 6));
    const first = times[1] - times[0];
    for (let i = 1; i < times.length; i++) expect(times[i] - times[i - 1]).toBeCloseTo(first, 9);
  });

  it('84/28 (slowest drill): kick on beat 1 only, hats every half downswing (about 0.47 s)', () => {
    const p = find(84, 28);
    const { beat2, beat3 } = beatTimes(p);
    const events = loopEvents(p);
    const hats = hatTimes(events);
    expect(events.filter((e) => e.voice === 'kick').map((e) => e.time)).toEqual([0]);
    expect(hats[1] - hats[0]).toBeCloseTo((beat3 - beat2) / 2, 9);
    expect(hats[1] - hats[0]).toBeCloseTo(0.467, 3);
  });

  it('the hat gap option overrides the constant', () => {
    const p = find(84, 28);
    const { beat2, beat3 } = beatTimes(p);
    const hats = hatTimes(loopEvents(p, { hatMaxGapSeconds: 0.3 }));
    expect(hats[1] - hats[0]).toBeCloseTo((beat3 - beat2) / 4, 9);
  });

  it('drills: the bar is exactly 24 hats, 3 measures of 8 (swing, recovery, countdown), IMPACT on hat 8', () => {
    for (const p of LONG_GAME_PRESETS.filter((x) => usesSparsePattern(x))) {
      const hats = hatTimes(loopEvents(p));
      expect(hats.length, presetLabel(p)).toBe(2 * DRILL_BAR_COUNTS);
      expect(hats.length % 8, presetLabel(p)).toBe(0);
      const impactTick = hats.findIndex((t) => Math.abs(t - beatTimes(p).beat3) < EPS);
      expect(impactTick, `${presetLabel(p)} IMPACT tick`).toBe(8);
    }
  });

  it('drills: every countdown and lead-in count lands exactly on a hi-hat, loop on or off', () => {
    // The countdown comes from the engine, not from the loop, so it is on the hi-hat grid
    // whether or not the loop plays. The grid is one hat every half count.
    for (const p of LONG_GAME_PRESETS.filter((x) => usesSparsePattern(x))) {
      const hats = hatTimes(loopEvents(p));
      const half = drillCountSeconds(p) / 2;
      const countdown = buildSequence({ preset: p, settings: defaultWeightShiftSettings() }).filter((e) => e.type === 'countdown');
      expect(countdown, presetLabel(p)).toHaveLength(4);
      for (const e of countdown) expect(hats.some((t) => Math.abs(t - e.time) < EPS), `${presetLabel(p)} count ${e.count}`).toBe(true);
      for (const e of leadInEvents(p)) {
        const steps = -e.time / half;
        expect(Math.abs(steps - Math.round(steps)), `${presetLabel(p)} lead-in ${e.count}`).toBeLessThan(1e-9);
      }
    }
  });

  it('Short Game: TOP exactly on the step 4 kick and IMPACT exactly on the step 6 snare, at every tempo', () => {
    for (const p of SHORT_GAME_PRESETS) {
      const times = stepTimes(p);
      const events = loopEvents(p);
      const { beat2, beat3 } = beatTimes(p);
      expect(times[4], presetLabel(p)).toBeCloseTo(beat2, 9);
      expect(times[6], presetLabel(p)).toBeCloseTo(beat3, 9);
      expect(at(events, 'kick', beat2), presetLabel(p)).toBeDefined();
      expect(at(events, 'snare', beat3), presetLabel(p)).toBeDefined();
    }
  });

  it('sparse pattern on Long 42/14 and slower only', () => {
    for (const p of LONG_GAME_PRESETS) expect(usesSparsePattern(p), presetLabel(p)).toBe(beatTimes(p).beat2 > 1);
    for (const p of SHORT_GAME_PRESETS) expect(usesSparsePattern(p), presetLabel(p)).toBe(false);
  });
});

describe('audit fixes', () => {
  it('60/20: hats evenly 0.333 s apart, no doubled tick (old rounding bug)', () => {
    const hats = hatTimes(loopEvents(find(60, 20)));
    for (let i = 1; i < hats.length; i++) expect(hats[i] - hats[i - 1]).toBeCloseTo(1 / 3, 9);
  });

  it('same groove slowed down within each group: TOP and IMPACT on the same relative step at every tempo', () => {
    const fastLong = LONG_GAME_PRESETS.filter((p) => !usesSparsePattern(p));
    const slowLong = LONG_GAME_PRESETS.filter((p) => usesSparsePattern(p));
    for (const presets of [fastLong, slowLong, SHORT_GAME_PRESETS]) {
      const stepAt = (p: Preset, t: number) => t / (cycleSeconds(p) / STEPS_PER_BAR);
      const first = beatTimes(presets[0]);
      for (const p of presets) {
        const t = beatTimes(p);
        expect(stepAt(p, t.beat2), presetLabel(p)).toBeCloseTo(stepAt(presets[0], first.beat2), 9);
        expect(stepAt(p, t.beat3), presetLabel(p)).toBeCloseTo(stepAt(presets[0], first.beat3), 9);
      }
    }
  });

  it('Long Game: drums and hats evenly spaced at every tempo (no squeeze between TOP and IMPACT, heard and rejected)', () => {
    for (const p of LONG_GAME_PRESETS) {
      const events = loopEvents(p, { ghostKicks: false });
      const drums = events.filter((e) => e.voice !== 'hat').map((e) => e.time);
      const hats = hatTimes(events);
      for (const list of [drums, hats]) {
        const gap = list[1] - list[0];
        for (let i = 1; i < list.length; i++) expect(list[i] - list[i - 1], presetLabel(p)).toBeCloseTo(gap, 9);
      }
    }
  });

  it('Short Game uses the even grid: every step the same length, no speed change inside the bar', () => {
    for (const p of SHORT_GAME_PRESETS) {
      expect(usesAnchoredGrid(p), presetLabel(p)).toBe(false);
      const times = stepTimes(p);
      const first = times[1] - times[0];
      for (let i = 1; i < times.length; i++) expect(times[i] - times[i - 1]).toBeCloseTo(first, 9);
    }
  });

  it('grid choice: every preset uses the even grid', () => {
    for (const p of ALL) expect(usesAnchoredGrid(p), presetLabel(p)).toBe(false);
  });
});
