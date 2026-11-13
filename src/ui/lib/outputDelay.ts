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

// Fallback delays (R6.8). iOS measured on iPad Safari: 3 ms (every logged delay,
// 3 loops at 30/10). Android from Pixel 6: first swing reported 24 ms, then 272
// and 280 ms, so constant 0.28. Desktop 0.05 is a placeholder (Mac Chrome
// reported 56 ms).
export const FALLBACK_DELAY_SECONDS: Record<PlatformKey, number> = {
  ios: 0.003,
  android: 0.28,
  desktop: 0.05,
};

function isUsable(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function resolveOutputDelay(info: LatencyInfo, platform: PlatformKey): OutputDelay {
  if (info) {
    // Zero counts as not reported: browsers report 0 right after Play, before
    // the speaker opens. Base latency is far smaller than the real delay
    // (23 ms vs 280 ms on Pixel), so go straight to the platform constant.
    if (info.outputLatencySeconds === 0) {
      return { seconds: FALLBACK_DELAY_SECONDS[platform], source: 'fallback' };
    }
    if (isUsable(info.outputLatencySeconds)) {
      return { seconds: info.outputLatencySeconds, source: 'reported' };
    }
    if (isUsable(info.baseLatencySeconds)) {
      return { seconds: info.baseLatencySeconds, source: 'fallback' };
    }
  }
  return { seconds: FALLBACK_DELAY_SECONDS[platform], source: 'fallback' };
}

/**
 * The first swing of every run (start, restart, resume) uses the platform constant,
 * because browsers report a startup value that is too small (Pixel 6: 24 ms, then
 * 272 and 280 ms). Later swings resolve normally.
 */
export function resolveOutputDelayForSwing(
  info: LatencyInfo,
  platform: PlatformKey,
  swingIndexInRun: number,
): OutputDelay {
  if (swingIndexInRun === 0) {
    return { seconds: FALLBACK_DELAY_SECONDS[platform], source: 'fallback' };
  }
  return resolveOutputDelay(info, platform);
}
