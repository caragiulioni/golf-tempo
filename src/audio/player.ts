import { buildSequence, type Preset, type SequenceEvent, type WeightShiftSettings } from '../engine';
import { voiceFor, type WeightShiftToneStyle } from './tones';
import type { AudioAdapter, Voice } from './types';

export type ScheduledBeep = {
  type: SequenceEvent['type'];
  voice: Voice;
  /** Audio clock time in seconds. */
  time: number;
};

export type SwingOptions = {
  preset: Preset;
  settings: WeightShiftSettings;
  includeWeightShift?: boolean;
  toneStyle?: WeightShiftToneStyle;
};

/**
 * Schedule one swing so beat 1 sounds at `startTime` (audio clock seconds).
 * Returns what was scheduled so the UI and the checks can read it.
 */
export function scheduleSwing(
  adapter: AudioAdapter,
  startTime: number,
  { preset, settings, includeWeightShift = true, toneStyle }: SwingOptions,
): ScheduledBeep[] {
  const events = buildSequence({ preset, settings, includeWeightShift });
  return events.map((event) => {
    const voice = voiceFor(preset.category, event.type, toneStyle);
    const time = startTime + event.time;
    adapter.playTone(voice, time);
    return { type: event.type, voice, time };
  });
}
