import { beatTimes } from './beats';
import type { Preset } from './presets';
import { weightShiftTime, type WeightShiftSettings } from './weightShift';

export type EventType = 'beat1' | 'weightShift' | 'beat2' | 'beat3';

/** One sound or marker in a swing. Time is in seconds from the start of the swing. */
export type SequenceEvent = {
  type: EventType;
  time: number;
};

export type SequenceOptions = {
  preset: Preset;
  settings: WeightShiftSettings;
  /** Set to false for the three-beat baseline (no weight shift beat). Default true. */
  includeWeightShift?: boolean;
};

/** The events of one swing, in time order. Audio and visuals both read this list. */
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
  ];

  if (includeWeightShift) {
    events.push({
      type: 'weightShift',
      time: weightShiftTime(preset, settings[preset.category]),
    });
  }

  return events.sort((a, b) => a.time - b.time);
}
