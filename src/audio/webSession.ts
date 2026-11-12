import type { Player } from './player';

/**
 * WEB ONLY. Uses the browser's Screen Wake Lock and page visibility.
 * On native, replace this file with the platform's equivalents.
 */

/**
 * idle: not asked for (not playing). held: the screen should stay on.
 * unsupported: this browser has no wake lock. failed: the browser said no
 * (for example the page is not on https, or battery saver is on).
 */
export type WakeLockStatus = 'idle' | 'held' | 'unsupported' | 'failed';

export type WebSessionListeners = {
  onWakeLock?: (status: WakeLockStatus) => void;
  /** The page went to the background (true) or came back (false). */
  onVisibility?: (hidden: boolean) => void;
};

/**
 * Keeps the screen awake while the player plays, and pauses the player when the page
 * is hidden (phone locked or another app in front). A locked Pixel 6 played cleanly for
 * about 4 minutes, then crunched and stalled, so stopping straight away is the safer
 * choice: the beats are either right or silent. Returns a function that undoes everything.
 */
export function attachWebSession(player: Player, listeners: WebSessionListeners = {}): () => void {
  if (typeof document === 'undefined') return () => {};

  let sentinel: WakeLockSentinel | null = null;
  let status: WakeLockStatus = 'idle';

  function setStatus(next: WakeLockStatus) {
    if (status === next) return;
    status = next;
    listeners.onWakeLock?.(next);
  }

  async function acquire() {
    if (sentinel) return;
    if (!('wakeLock' in navigator)) {
      setStatus('unsupported');
      return;
    }
    try {
      const lock = await navigator.wakeLock.request('screen');
      // Stopped while we were waiting for the answer.
      if (player.getState() !== 'playing' && player.getState() !== 'restarting') {
        await lock.release();
        return;
      }
      sentinel = lock;
      // The browser releases it on its own when the page is hidden.
      lock.addEventListener('release', () => {
        if (sentinel === lock) sentinel = null;
        if (status === 'held') setStatus('idle');
      });
      setStatus('held');
    } catch {
      setStatus('failed');
    }
  }

  async function release() {
    const lock = sentinel;
    sentinel = null;
    if (lock) {
      try {
        await lock.release();
      } catch {
        // Already released.
      }
    }
    setStatus('idle');
  }

  const removePlayerListener = player.subscribe({
    onState: (state) => {
      if (state === 'playing') void acquire();
      else if (state === 'stopped' || state === 'paused') void release();
    },
  });

  function onVisibilityChange() {
    const hidden = document.visibilityState === 'hidden';
    listeners.onVisibility?.(hidden);
    if (hidden) {
      player.pause('hidden');
      return;
    }
    // The wake lock is dropped when the page is hidden. Ask again when it is back.
    const state = player.getState();
    if (!hidden && (state === 'playing' || state === 'restarting')) void acquire();
  }

  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    removePlayerListener();
    void release();
  };
}
