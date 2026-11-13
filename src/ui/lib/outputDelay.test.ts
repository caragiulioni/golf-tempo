import { describe, expect, it } from 'vitest';
import {
  FALLBACK_DELAY_SECONDS,
  resolveOutputDelay,
  resolveOutputDelayForSwing,
} from './outputDelay';

describe('resolveOutputDelay', () => {
  it('uses the reported output latency', () => {
    expect(resolveOutputDelay({ outputLatencySeconds: 0.12, baseLatencySeconds: 0.01 }, 'ios')).toEqual({
      seconds: 0.12,
      source: 'reported',
    });
  });

  it('treats zero as not reported', () => {
    expect(resolveOutputDelay({ outputLatencySeconds: 0, baseLatencySeconds: 0.023 }, 'android')).toEqual({
      seconds: FALLBACK_DELAY_SECONDS.android,
      source: 'fallback',
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

describe('resolveOutputDelayForSwing', () => {
  const pixel = { outputLatencySeconds: 0.024 };

  it('uses the platform constant for the first swing of a run, even if a value is reported', () => {
    expect(resolveOutputDelayForSwing(pixel, 'android', 0)).toEqual({
      seconds: FALLBACK_DELAY_SECONDS.android,
      source: 'fallback',
    });
  });

  it('resolves normally from the second swing on', () => {
    expect(resolveOutputDelayForSwing({ outputLatencySeconds: 0.272 }, 'android', 1)).toEqual({
      seconds: 0.272,
      source: 'reported',
    });
    expect(resolveOutputDelayForSwing({ outputLatencySeconds: 0 }, 'android', 2).source).toBe('fallback');
  });
});
