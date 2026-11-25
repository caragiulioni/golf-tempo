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
  /** A plain name for the tempo, for example "The Balanced Benchmark Swing" (V2-10, `docs/ideas.md`, idea 1). */
  archetype?: string;
  /** One sentence on what the tempo suits. Shown under the swing scale. */
  goodFor?: string;
};

/** Backswing is this many times the downswing. */
export const CATEGORY_RATIO: Record<Category, number> = {
  long: 3,
  short: 2,
};

const longGame = (
  backFrames: number,
  downFrames: number,
  group: PresetGroup,
  archetype: string,
  goodFor: string,
): Preset => ({
  category: 'long',
  backFrames,
  downFrames,
  group,
  archetype,
  goodFor,
});

const shortGame = (backFrames: number, downFrames: number, archetype: string, goodFor: string): Preset => ({
  category: 'short',
  backFrames,
  downFrames,
  archetype,
  goodFor,
});

/**
 * 120/40 and 168/56 were removed in V2 (V2-04, `docs/changes/V2.md`): too slow to be useful,
 * and the drill timing (idea 2 in `docs/ideas.md`) works cleanly only without them.
 */
export const LONG_GAME_PRESETS: readonly Preset[] = [
  longGame(18, 6, 'gameplay', 'The Ultra-Compact Swing', 'Short, explosive backswings with rapid transitions and powerful rotational speed.'),
  longGame(21, 7, 'gameplay', 'The Modern Athletic Swing', 'Dynamic, athletic swings with quick transitions and assertive acceleration.'),
  // "Tour" left out of the name (idea 1: the app is modeled on Tour Tempo).
  longGame(24, 8, 'gameplay', 'The Balanced Benchmark Swing', 'Well-sequenced swings with a full backswing, smooth transition, and balanced power.'),
  longGame(27, 9, 'gameplay', 'The Rhythmic Classic Swing', 'Flowing, full-bodied swings with relaxed takeaways and effortless acceleration.'),
  longGame(30, 10, 'gameplay', 'The Measured Swing', 'Patient backswings, controlled transitions, and gradual acceleration through impact.'),
  // Slow practice presets (not in the reference software).
  longGame(42, 14, 'drills', 'The Composed Swing', 'Exceptionally composed swings with extended backswings and measured, fluid transitions.'),
  longGame(60, 20, 'drills', 'The Sequence Drill', 'Feeling each move happen in order: takeaway, weight shift, top, impact.'),
  longGame(84, 28, 'drills', 'The Component Drill', 'Freezing your position at the top and checking each part of the swing.'),
];

export const SHORT_GAME_PRESETS: readonly Preset[] = [
  shortGame(14, 7, 'The Short Game Standard', 'Crisp, decisive contact for chips, pitches and bunker shots.'),
  shortGame(16, 8, 'The Speed-Control Putt', 'A steady, balanced stroke for consistent putting and pace.'),
  shortGame(18, 9, 'The Rhythmic Stroke', 'A soft, flowing motion for longer putts and fine distance control.'),
  shortGame(20, 10, 'The Heavy Putter Pace', 'For heavier putters and anyone who likes a slow, deliberate stroke. Also good for chipping practice.'),
  // 22/11 and 24/12 are draft suggestions, for Mike to check (idea 1).
  shortGame(22, 11, 'The Patient Stroke', 'Slower and softer, for long lag putts and delicate chips where feel matters more than speed.'),
  shortGame(24, 12, 'The Slow Pendulum', 'The slowest tempo: unhurried and relaxed, to feel the pendulum and build soft touch around the green.'),
];

export const PRESETS: Record<Category, readonly Preset[]> = {
  long: LONG_GAME_PRESETS,
  short: SHORT_GAME_PRESETS,
};

/** True for the Practice Drills presets (42/14, 60/20, 84/28). They get the drill bar (V2-07). */
export function isDrillPreset(preset: Preset): boolean {
  return preset.group === 'drills';
}

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
