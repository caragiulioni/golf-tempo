import { describe, expect, it } from 'vitest';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, defaultWeightShiftSettings } from '../engine';
import type { AudioAdapter, Voice } from './types';
import { scheduleSwing } from './player';
// An adapter that only records the tones it is asked to play.
function recorder() {
  const played: Array<{ voice: Voice; time: number }> = [];
  const adapter: AudioAdapter = {
    unlock: async () => {},
    now: () => 0,
    playTone: (voice, time) => {
      played.push({ voice, time });
    },
    stopAll: () => {},
    onSuspended: () => () => {},
  };
  return { adapter, played };
}
const settings = defaultWeightShiftSettings();
const swing = (preset: (typeof LONG_GAME_PRESETS)[number], extra: { includeTop?: boolean; includeWeightShift?: boolean } = {}) => {
  const { adapter, played } = recorder();
  const beeps = scheduleSwing(adapter, 10, { preset, settings, ...extra });
  return { beeps, played };
};
describe('scheduleSwing: the top cue (V2-22)', () => {
  it('plays all four cues by default', () => {
    const { beeps, played } = swing(LONG_GAME_PRESETS[2]);
    expect(beeps.map((b) => b.type)).toEqual(['beat1', 'weightShift', 'beat2', 'beat3']);
    expect(played).toHaveLength(4);
  });
  it('leaves out only the top cue when includeTop is false', () => {
    const { beeps, played } = swing(LONG_GAME_PRESETS[2], { includeTop: false });
    expect(beeps.map((b) => b.type)).toEqual(['beat1', 'weightShift', 'beat3']);
    expect(played).toHaveLength(3);
  });
  it('does not move the other cues', () => {
    const all = swing(LONG_GAME_PRESETS[2]).beeps;
    const noTop = swing(LONG_GAME_PRESETS[2], { includeTop: false }).beeps;
    for (const beep of noTop) {
      expect(all.find((b) => b.type === beep.type)?.time).toBe(beep.time);
    }
  });
  it('works with the weight shift off too, in Short Game and on a drill', () => {
    for (const preset of [SHORT_GAME_PRESETS[5], LONG_GAME_PRESETS[6]]) {
      const types = swing(preset, { includeTop: false, includeWeightShift: false }).beeps.map((b) => b.type);
      expect(types).not.toContain('beat2');
      expect(types).not.toContain('weightShift');
      expect(types).toContain('beat1');
      expect(types).toContain('beat3');
    }
  });
  it('keeps the countdown on a drill when the top cue is off', () => {
    const types = swing(LONG_GAME_PRESETS[6], { includeTop: false }).beeps.map((b) => b.type);
    expect(types.filter((t) => t === 'countdown')).toHaveLength(4);
  });
});
