import { describe, expect, it } from 'vitest';
import { detectPlatformKey } from './platformKey';

const none = { userAgent: '', platform: '', maxTouchPoints: 0 };

describe('detectPlatformKey', () => {
  it('trusts Platform.OS on native', () => {
    expect(detectPlatformKey({ os: 'ios', ...none })).toBe('ios');
    expect(detectPlatformKey({ os: 'android', ...none })).toBe('android');
  });

  it('detects iPhone and iPad on the web', () => {
    expect(detectPlatformKey({ os: 'web', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', platform: 'iPhone', maxTouchPoints: 5 })).toBe('ios');
  });

  it('detects iPadOS that reports a Mac but has touch', () => {
    expect(detectPlatformKey({ os: 'web', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform: 'MacIntel', maxTouchPoints: 5 })).toBe('ios');
  });

  it('treats a real Mac as desktop', () => {
    expect(detectPlatformKey({ os: 'web', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform: 'MacIntel', maxTouchPoints: 0 })).toBe('desktop');
  });

  it('detects Android Chrome on the web', () => {
    expect(detectPlatformKey({ os: 'web', userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 6)', platform: 'Linux armv81', maxTouchPoints: 5 })).toBe('android');
  });

  it('falls to desktop', () => {
    expect(detectPlatformKey({ os: 'web', userAgent: 'Mozilla/5.0 (Windows NT 10.0)', platform: 'Win32', maxTouchPoints: 0 })).toBe('desktop');
  });
});
