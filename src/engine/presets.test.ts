import { describe, expect, it } from 'vitest';
import {
  LONG_GAME_PRESETS,
  PRESETS,
  SHORT_GAME_PRESETS,
  matchesRatio,
  presetLabel,
} from './presets';

describe('preset lists', () => {
  it('lists the 10 Long Game presets in order', () => {
    expect(LONG_GAME_PRESETS.map(presetLabel)).toEqual([
      '18/6', '21/7', '24/8', '27/9', '30/10',
      '42/14', '60/20', '84/28', '120/40', '168/56',
    ]);
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
