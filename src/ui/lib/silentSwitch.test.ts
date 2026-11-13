import { describe, expect, it } from 'vitest';
import { isIosWebDevice, shouldShowSilentSwitchHint } from './silentSwitch';

const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/16.6 Safari/605.1.15';

describe('isIosWebDevice', () => {
  it('detects iPhone', () => {
    expect(
      isIosWebDevice({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', platform: 'iPhone', maxTouchPoints: 5 }),
    ).toBe(true);
  });
  it('detects iPad with the old user agent', () => {
    expect(
      isIosWebDevice({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X)', platform: 'iPad', maxTouchPoints: 5 }),
    ).toBe(true);
  });
  it('detects iPadOS reporting Macintosh with touch points', () => {
    expect(isIosWebDevice({ userAgent: MAC_UA, platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
  });
  it('rejects a real Mac with no touch points', () => {
    expect(isIosWebDevice({ userAgent: MAC_UA, platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false);
  });
  it('rejects Android', () => {
    expect(
      isIosWebDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 6) Chrome/120 Mobile', platform: 'Linux armv8l', maxTouchPoints: 5 }),
    ).toBe(false);
  });
  it('rejects desktop Windows', () => {
    expect(
      isIosWebDevice({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', platform: 'Win32', maxTouchPoints: 0 }),
    ).toBe(false);
  });
});

describe('shouldShowSilentSwitchHint', () => {
  const desktop = { userAgent: 'Windows', platform: 'Win32', maxTouchPoints: 0 };
  it('is true on native iOS', () => {
    expect(shouldShowSilentSwitchHint('ios', desktop)).toBe(true);
  });
  it('is false on native Android', () => {
    expect(shouldShowSilentSwitchHint('android', desktop)).toBe(false);
  });
  it('follows detection on web', () => {
    expect(shouldShowSilentSwitchHint('web', desktop)).toBe(false);
    expect(shouldShowSilentSwitchHint('web', { userAgent: MAC_UA, platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
  });
});
