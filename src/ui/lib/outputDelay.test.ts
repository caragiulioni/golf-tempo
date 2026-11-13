import { describe, expect, it } from 'vitest';
import { FALLBACK_DELAY_SECONDS, resolveOutputDelay } from './outputDelay';

describe('resolveOutputDelay', () => {
  it('uses the reported output latency', () => {
    expect(resolveOutputDelay({ outputLatencySeconds: 0.12, baseLatencySeconds: 0.01 }, 'ios')).toEqual({
      seconds: 0.12,
      source: 'reported',
    });
  });

  it('counts zero as reported', () => {
    expect(resolveOutputDelay({ outputLatencySeconds: 0 }, 'android')).toEqual({
      seconds: 0,
      source: 'reported',
    });
  });

  it.each([null, undefined, -0.1, NaN, Infinity, -Infinity])(
    'falls to base latency when output latency is %s',
    (bad) => {
      expect(resolveOutputDelay({ outputLatencySeconds: bad, baseLatencySeconds: 0.02 }, 'desktop')).toEqual({
        seconds: 0.02,
        source: 'fallback',
      });
    },
  );

  it.each([null, undefined, -1, NaN, Infinity])(
    'falls to the platform constant when both values are unusable (base %s)',
    (bad) => {
      expect(resolveOutputDelay({ outputLatencySeconds: NaN, baseLatencySeconds: bad }, 'android')).toEqual({
        seconds: FALLBACK_DELAY_SECONDS.android,
        source: 'fallback',
      });
    },
  );

  it('uses the platform constant when info is null', () => {
    expect(resolveOutputDelay(null, 'ios')).toEqual({ seconds: FALLBACK_DELAY_SECONDS.ios, source: 'fallback' });
    expect(resolveOutputDelay(null, 'desktop').seconds).toBe(FALLBACK_DELAY_SECONDS.desktop);
  });

  it('uses the platform constant when info is empty', () => {
    expect(resolveOutputDelay({}, 'android')).toEqual({
      seconds: FALLBACK_DELAY_SECONDS.android,
      source: 'fallback',
    });
  });
});
