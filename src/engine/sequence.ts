import { beatTimes } from './beats';
import { isDrillPreset, type Preset } from './presets';
import { DRILL_COUNTDOWN_COUNTS, cycleSeconds, drillCountSeconds } from './repeat';
import { weightShiftTime, type WeightShiftSettings } from './weightShift';

/**
 * 'countdown': Practice Drills only (V2-07). The 4, 3, 2, 1 that leads into the next
 * takeaway. It is not a beat of the swing and never moves one.
 */
export type EventType = 'beat1' | 'weightShift' | 'beat2' | 'beat3' | 'countdown';

/** One sound or marker in a swing. Time is in seconds from the start of the swing. */
export type SequenceEvent = {
  type: EventType;
  time: number;
  /** Countdown only: 4, 3, 2 or 1. */
  count?: number;
};

export type SequenceOptions = {
  preset: Preset;
  settings: WeightShiftSettings;
  /** Set to false for the three-beat baseline (no weight shift beat). Default true. */
  includeWeightShift?: boolean;
};

/**
 * The countdown 4, 3, 2, 1 for a drill, with times relative to the takeaway it leads into:
 * one count apart, "1" one count before the takeaway. Empty for every other preset.
 */
function countdownBefore(preset: Preset, takeaway: number): SequenceEvent[] {
  if (!isDrillPreset(preset)) return [];
  const count = drillCountSeconds(preset);
  const events: SequenceEvent[] = [];
  for (let n = DRILL_COUNTDOWN_COUNTS; n >= 1; n--) {
    events.push({ type: 'countdown', time: takeaway - n * count, count: n });
  }
  return events;
}

/**
 * The events of one swing, in time order. Audio and visuals both read this list.
 * On Practice Drills it ends with the countdown that leads into the next swing's takeaway
 * (the next bar starts at `cycleSeconds(preset)`).
 */
export function buildSequence({
  preset,
  settings,
  includeWeightShift = true,
}: SequenceOptions): SequenceEvent[] {
  const t = beatTimes(preset);
  const events: SequenceEvent[] = [
    { type: 'beat1', time: t.beat1 },
    { type: 'beat2', time: t.beat2 },
    { type: 'beat3', time: t.beat3 },
    ...countdownBefore(preset, cycleSeconds(preset)),
  ];

  if (includeWeightShift) {
    events.push({
      type: 'weightShift',
      time: weightShiftTime(preset, settings[preset.category]),
    });
  }

  return events.sort((a, b) => a.time - b.time);
}

/**
 * The countdown played before the first swing when playback starts on a drill, with times
 * relative to that first takeaway (so all negative). Empty for every other preset.
 * Decided by the developer (V2-07): Play, and a restart after a change, start with a
 * countdown, because that is when the golfer is least ready.
 */
export function leadInEvents(preset: Preset): SequenceEvent[] {
  return countdownBefore(preset, 0);
}
