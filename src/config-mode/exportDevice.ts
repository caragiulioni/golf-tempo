// Web-only bits of EXPORT, guarded so the screen also runs on native.
import { Platform } from 'react-native';

/** The browser's user agent text on web. Undefined elsewhere, so the export leaves `device` out. */
export function deviceUserAgent(): string | undefined {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return undefined;
  return navigator.userAgent || undefined;
}

/**
 * Copies to the clipboard. Returns false when that is not possible (native, insecure page,
 * blocked permission, rejected write), so the caller can ask the user to copy by hand.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
