// Picks the platform key used for the output delay fallback. Takes plain values so it can be tested.
import type { PlatformKey } from './outputDelay';
import { isIosWebDevice, readDeviceInfo, type DeviceInfo } from './silentSwitch';

export type PlatformKeyInput = DeviceInfo & {
  /** React Native's Platform.OS. */
  os: string;
};

export function detectPlatformKey({ os, userAgent, platform, maxTouchPoints }: PlatformKeyInput): PlatformKey {
  if (os === 'ios') return 'ios';
  if (os === 'android') return 'android';
  if (isIosWebDevice({ userAgent, platform, maxTouchPoints })) return 'ios';
  if (/Android/.test(userAgent)) return 'android';
  return 'desktop';
}

/** Reads the current device. `os` is React Native's Platform.OS. */
export function currentPlatformKey(os: string): PlatformKey {
  return detectPlatformKey({ os, ...readDeviceInfo() });
}
