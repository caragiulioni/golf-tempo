export type Category = 'long' | 'short';

/** Frame counts at 30 fps: back = beat 1 to beat 2, down = beat 2 to beat 3 (label). */
export type Preset = {
  category: Category;
  backFrames: number;
  downFrames: number;
};

/** Backswing is this many times the downswing. */
export const CATEGORY_RATIO: Record<Category, number> = {
  long: 3,
  short: 2,
};

const longGame = (backFrames: number, downFrames: number): Preset => ({
  category: 'long',
  backFrames,
  downFrames,
});

const shortGame = (backFrames: number, downFrames: number): Preset => ({
  category: 'short',
  backFrames,
  downFrames,
});

export const LONG_GAME_PRESETS: readonly Preset[] = [
  longGame(18, 6),
  longGame(21, 7),
  longGame(24, 8),
  longGame(27, 9),
  longGame(30, 10),
  // Slow practice presets (not in the reference software).
  longGame(42, 14),
  longGame(60, 20),
  longGame(84, 28),
  longGame(120, 40),
  longGame(168, 56),
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

/** True when the preset's two numbers follow its category's ratio. */
export function matchesRatio(preset: Preset): boolean {
  return preset.backFrames === preset.downFrames * CATEGORY_RATIO[preset.category];
}

/** Label such as "30/10". */
export function presetLabel(preset: Preset): string {
  return `${preset.backFrames}/${preset.downFrames}`;
}
