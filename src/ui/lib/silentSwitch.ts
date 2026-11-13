// Decides whether to show the "check your silent switch" hint: only on iPhone and iPad,
// where the ringer switch can mute Web Audio. Takes plain values so it can be tested.
export type DeviceInfo = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
};

export function isIosWebDevice({ userAgent, platform, maxTouchPoints }: DeviceInfo): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  // iPadOS 13+ Safari reports a Mac, but has a touch screen. A real Mac has no touch points.
  return maxTouchPoints > 1 && (/Mac/.test(platform) || /Macintosh/.test(userAgent));
}

/** Reads the browser's values. Safe to call where `navigator` does not exist. */
export function readDeviceInfo(): DeviceInfo {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  return {
    userAgent: nav?.userAgent ?? '',
    platform: nav?.platform ?? '',
    maxTouchPoints: nav?.maxTouchPoints ?? 0,
  };
}

/** True when the hint should show. `os` is React Native's Platform.OS. */
export function shouldShowSilentSwitchHint(os: string, info: DeviceInfo): boolean {
  if (os === 'ios') return true;
  return os === 'web' && isIosWebDevice(info);
}
