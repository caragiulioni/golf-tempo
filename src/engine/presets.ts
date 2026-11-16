export type Category = 'long' | 'short';

/**
 * Long Game presets come in two groups. 'gameplay': real swing tempos (18/6 to 30/10).
 * 'drills': slow practice swings for feeling each part of the move (42/14, 60/20, 84/28).
 * Short Game presets have no group. The group lives here so the UI never decides which
 * presets are drills.
 */
export type PresetGroup = 'gameplay' | 'drills';

/** Frame counts at 30 fps: back = beat 1 to beat 2, down = beat 2 to beat 3 (label). */
export type Preset = {
  category: Category;
  backFrames: number;
  downFrames: number;
  /** Long Game only. Short Game presets leave it out. */
  group?: PresetGroup;
};

/** Backswing is this many times the downswing. */
export const CATEGORY_RATIO: Record<Category, number> = {
  long: 3,
  short: 2,
};

const longGame = (backFrames: number, downFrames: number, group: PresetGroup): Preset => ({
  category: 'long',
  backFrames,
  downFrames,
  group,
});

const shortGame = (backFrames: number, downFrames: number): Preset => ({
  category: 'short',
  backFrames,
  downFrames,
});

/**
 * 120/40 and 168/56 were removed in V2 (V2-04, `docs/changes/V2.md`): too slow to be useful,
 * and the drill timing (idea 2 in `docs/ideas.md`) works cleanly only without them.
 */
export const LONG_GAME_PRESETS: readonly Preset[] = [
  longGame(18, 6, 'gameplay'),
  longGame(21, 7, 'gameplay'),
  longGame(24, 8, 'gameplay'),
  longGame(27, 9, 'gameplay'),
  longGame(30, 10, 'gameplay'),
  // Slow practice presets (not in the reference software).
  longGame(42, 14, 'drills'),
  longGame(60, 20, 'drills'),
  longGame(84, 28, 'drills'),
];

export const SHORT_GAME_PRESETS: readonly Preset[] = [
  shortGame(14, 7),
  shortGame(16, 8),
  shortGame(18, 9),
  shortGame(20, 10),
  shortGame(22, 11),
  shortGame(24, 12),
];

export const PRESETS: Record<Category, readonly Preset[]> = {
  long: LONG_GAME_PRESETS,
  short: SHORT_GAME_PRESETS,
};

/** The presets of one group, in order. Empty for Short Game, which has no groups. */
export function presetsInGroup(category: Category, group: PresetGroup): readonly Preset[] {
  return PRESETS[category].filter((p) => p.group === group);
}

/** True when the preset's two numbers follow its category's ratio. */
export function matchesRatio(preset: Preset): boolean {
  return preset.backFrames === preset.downFrames * CATEGORY_RATIO[preset.category];
}

/** Label such as "30/10". */
export function presetLabel(preset: Preset): string {
  return `${preset.backFrames}/${preset.downFrames}`;
}
