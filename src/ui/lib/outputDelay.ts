// Output delay: how long after a beep's audio-clock time the sound actually
// reaches the listener. The timeline adds this to beep times so lights land
// with the sound. Pure TypeScript: no React, no DOM, no audio imports.

export type OutputDelaySource = 'reported' | 'fallback';
export type OutputDelay = { seconds: number; source: OutputDelaySource };
export type LatencyInfo = {
  outputLatencySeconds?: number | null;
  baseLatencySeconds?: number | null;
} | null;
export type PlatformKey = 'ios' | 'android' | 'desktop';

// Placeholders until measured (R6.8). Android is from the Pixel 6 report;
// iOS is a guess until the iPad measurement.
export const FALLBACK_DELAY_SECONDS: Record<PlatformKey, number> = {
  ios: 0.1,
  android: 0.28,
  desktop: 0.05,
};

function isUsable(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function resolveOutputDelay(info: LatencyInfo, platform: PlatformKey): OutputDelay {
  if (info) {
    if (isUsable(info.outputLatencySeconds)) {
      return { seconds: info.outputLatencySeconds, source: 'reported' };
    }
    if (isUsable(info.baseLatencySeconds)) {
      return { seconds: info.baseLatencySeconds, source: 'fallback' };
    }
  }
  return { seconds: FALLBACK_DELAY_SECONDS[platform], source: 'fallback' };
}
