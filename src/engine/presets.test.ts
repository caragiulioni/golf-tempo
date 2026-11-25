import { describe, expect, it } from 'vitest';
import {
  LONG_GAME_PRESETS,
  PRESETS,
  SHORT_GAME_PRESETS,
  matchesRatio,
  presetLabel,
  presetsInGroup,
} from './presets';

describe('preset lists', () => {
  it('lists the 8 Long Game presets in order', () => {
    expect(LONG_GAME_PRESETS.map(presetLabel)).toEqual([
      '18/6', '21/7', '24/8', '27/9', '30/10',
      '42/14', '60/20', '84/28',
    ]);
  });

  it('no longer has 120/40 or 168/56 (removed in V2-04)', () => {
    const labels = [...PRESETS.long, ...PRESETS.short].map(presetLabel);
    expect(labels).not.toContain('120/40');
    expect(labels).not.toContain('168/56');
  });

  it('lists the 6 Short Game presets in order', () => {
    expect(SHORT_GAME_PRESETS.map(presetLabel)).toEqual([
      '14/7', '16/8', '18/9', '20/10', '22/11', '24/12',
    ]);
  });

  it('tags every preset with the category it is listed under', () => {
    for (const category of ['long', 'short'] as const) {
      for (const preset of PRESETS[category]) {
        expect(preset.category).toBe(category);
      }
    }
  });
});

describe('preset groups', () => {
  it('Gameplay has the 5 real swing tempos, in order', () => {
    expect(presetsInGroup('long', 'gameplay').map(presetLabel)).toEqual([
      '18/6', '21/7', '24/8', '27/9', '30/10',
    ]);
  });

  it('Practice Drills has the 3 slow tempos, in order', () => {
    expect(presetsInGroup('long', 'drills').map(presetLabel)).toEqual(['42/14', '60/20', '84/28']);
  });

  it('every Long Game preset is in exactly one group, Gameplay first', () => {
    for (const preset of LONG_GAME_PRESETS) {
      expect(['gameplay', 'drills'], presetLabel(preset)).toContain(preset.group);
    }
    expect([...presetsInGroup('long', 'gameplay'), ...presetsInGroup('long', 'drills')]).toEqual(LONG_GAME_PRESETS);
  });

  it('Short Game has no groups', () => {
    for (const preset of SHORT_GAME_PRESETS) expect(preset.group, presetLabel(preset)).toBeUndefined();
    expect(presetsInGroup('short', 'gameplay')).toEqual([]);
    expect(presetsInGroup('short', 'drills')).toEqual([]);
  });

  it('returns the same preset objects as PRESETS, so the UI can compare them directly', () => {
    for (const preset of presetsInGroup('long', 'drills')) expect(PRESETS.long).toContain(preset);
    expect(presetsInGroup('long', 'gameplay')[2]).toBe(PRESETS.long[2]);
  });
});

describe('category ratios', () => {
  it('every Long Game preset is 3:1', () => {
    for (const preset of LONG_GAME_PRESETS) {
      expect(matchesRatio(preset), presetLabel(preset)).toBe(true);
    }
  });

  it('every Short Game preset is 2:1', () => {
    for (const preset of SHORT_GAME_PRESETS) {
      expect(matchesRatio(preset), presetLabel(preset)).toBe(true);
    }
  });

  it('catches a typo such as 21/8 in Long Game', () => {
    expect(matchesRatio({ category: 'long', backFrames: 21, downFrames: 8 })).toBe(false);
  });

  it('catches a 3:1 preset filed under Short Game', () => {
    expect(matchesRatio({ category: 'short', backFrames: 30, downFrames: 10 })).toBe(false);
  });
});

describe('preset names and descriptions (V2-10)', () => {
  const all = [...LONG_GAME_PRESETS, ...SHORT_GAME_PRESETS];
  it('every preset has an archetype and a "Good for" sentence', () => {
    for (const preset of all) {
      expect(preset.archetype?.trim(), presetLabel(preset)).toBeTruthy();
      expect(preset.goodFor?.trim(), presetLabel(preset)).toBeTruthy();
    }
  });
  it('archetypes are unique inside a game, so two tempos never share a name', () => {
    for (const list of [LONG_GAME_PRESETS, SHORT_GAME_PRESETS]) {
      const names = list.map((p) => p.archetype);
      expect(new Set(names).size).toBe(names.length);
    }
  });
  it('no archetype names "Tour" (the app is modeled on Tour Tempo)', () => {
    for (const preset of all) expect(preset.archetype).not.toMatch(/\btour\b/i);
  });
});
