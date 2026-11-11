import {
  buildSequence,
  cycleSeconds,
  type Preset,
  type SequenceEvent,
  type WeightShiftSettings,
} from '../engine';
import { voiceFor, type WeightShiftToneStyle } from './tones';
import type { AudioAdapter, Voice } from './types';

export type ScheduledBeep = {
  type: SequenceEvent['type'];
  voice: Voice;
  /** Audio clock time in seconds. */
  time: number;
};

export type SwingOptions = {
  preset: Preset;
  settings: WeightShiftSettings;
  includeWeightShift?: boolean;
  toneStyle?: WeightShiftToneStyle;
};

/**
 * Schedule one swing so beat 1 sounds at `startTime` (audio clock seconds).
 * Returns what was scheduled so the UI and the checks can read it.
 */
export function scheduleSwing(
  adapter: AudioAdapter,
  startTime: number,
  { preset, settings, includeWeightShift = true, toneStyle }: SwingOptions,
): ScheduledBeep[] {
  const events = buildSequence({ preset, settings, includeWeightShift });
  return events.map((event) => {
    const voice = voiceFor(preset.category, event.type, toneStyle);
    const time = startTime + event.time;
    adapter.playTone(voice, time);
    return { type: event.type, voice, time };
  });
}

/** How far ahead of the audio clock the next swing is scheduled, in seconds. */
export const LOOKAHEAD_SECONDS = 0.25;
/**
 * Same, while the page is in the background or the phone is locked. Browsers slow
 * timers down there (often to about once a second), so schedule far enough ahead
 * that a slow timer never leaves a gap.
 */
export const BACKGROUND_LOOKAHEAD_SECONDS = 5;
/** How often the timer checks whether the next swing needs scheduling, in ms. */
export const TIMER_INTERVAL_MS = 25;
/** Silence after a change (or a start) before the new run begins, in seconds. */
export const RESTART_PAUSE_SECONDS = 0.5;
/** Gap between a run beginning and its first beat 1, in seconds. */
export const START_DELAY_SECONDS = 0.1;

/**
 * 'paused' means the phone or browser took the audio away (for example iOS on lock).
 * The user has to tap to resume. 'stopped' means the user stopped it.
 */
export type PlayerState = 'stopped' | 'playing' | 'restarting' | 'paused';

/** One swing that was scheduled, for the UI to follow. Times are on the audio clock. */
export type ScheduledSwing = {
  /** When beat 1 of this swing sounds. */
  startTime: number;
  beeps: ScheduledBeep[];
  /** Seconds between scheduling and beat 1. Should stay well above zero. */
  leadSeconds: number;
  /** Seconds from this beat 1 to the next. */
  cycleSeconds: number;
};

export type PlayerListeners = {
  onState?: (state: PlayerState) => void;
  onSwing?: (swing: ScheduledSwing) => void;
  /** The timer fell behind (for example the page was frozen), so the run restarted from beat 1. */
  onResync?: () => void;
};

export interface Player {
  getState(): PlayerState;
  /** Add more listeners. Returns a function that removes them. */
  subscribe(listeners: PlayerListeners): () => void;
  /** Tell the player the page is in the background (true) or visible (false). */
  setBackground(background: boolean): void;
  /** Start from beat 1. Call from a user tap the first time. Works when stopped or paused. Does nothing if already playing. */
  start(options: SwingOptions): Promise<void>;
  /** Stop now and silence everything, including beeps already scheduled. */
  stop(): void;
  /**
   * Something changed. If playing, stop fully, wait the restart pause, then start a
   * new run from beat 1 with the latest options. Rapid changes restart the wait, so
   * only the last one starts a run. Does nothing if stopped or paused.
   */
  change(options: SwingOptions): void;
}

/**
 * Repeats swings forever. The timer only tops up the schedule a little ahead of time.
 * When each beep sounds comes from the audio clock and the engine, never from the timer.
 */
export function createPlayer(adapter: AudioAdapter, initialListeners: PlayerListeners = {}): Player {
  const listenerSet = new Set<PlayerListeners>([initialListeners]);
  const notify = <K extends keyof PlayerListeners>(key: K, ...args: Parameters<NonNullable<PlayerListeners[K]>>) => {
    for (const l of listenerSet) (l[key] as ((...a: unknown[]) => void) | undefined)?.(...args);
  };
  let background = false;
  let state: PlayerState = 'stopped';
  let options: SwingOptions | null = null;
  let nextStart = 0;
  let tick: ReturnType<typeof setInterval> | null = null;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;
  // Changes every stop, so a start that was waiting on unlock can tell it was cancelled.
  let run = 0;

  function setState(next: PlayerState) {
    if (state === next) return;
    state = next;
    notify('onState', next);
  }

  function clearTimers() {
    if (tick !== null) clearInterval(tick);
    if (restartTimer !== null) clearTimeout(restartTimer);
    tick = null;
    restartTimer = null;
  }

  function scheduleDueSwings() {
    if (state !== 'playing' || !options) return;
    // Fell behind (page frozen, timer starved): do not play missed swings all at once.
    // Start a fresh run from beat 1 instead.
    if (nextStart < adapter.now()) {
      nextStart = adapter.now() + START_DELAY_SECONDS;
      adapter.stopAll();
      notify('onResync');
    }
    const lookahead = background ? BACKGROUND_LOOKAHEAD_SECONDS : LOOKAHEAD_SECONDS;
    while (nextStart - adapter.now() < lookahead) {
      const swingStart = nextStart;
      const beeps = scheduleSwing(adapter, swingStart, options);
      const cycle = cycleSeconds(options.preset);
      notify('onSwing', {
        startTime: swingStart,
        beeps,
        leadSeconds: swingStart - adapter.now(),
        cycleSeconds: cycle,
      });
      nextStart = swingStart + cycle;
    }
  }

  function beginRun() {
    nextStart = adapter.now() + START_DELAY_SECONDS;
    setState('playing');
    scheduleDueSwings();
    tick = setInterval(scheduleDueSwings, TIMER_INTERVAL_MS);
  }

  // The phone or browser took the audio away (iOS does this on lock). Stop cleanly.
  adapter.onSuspended(() => {
    if (state !== 'playing' && state !== 'restarting') return;
    run++;
    clearTimers();
    adapter.stopAll();
    setState('paused');
  });

  return {
    getState: () => state,

    subscribe(listeners) {
      listenerSet.add(listeners);
      return () => {
        listenerSet.delete(listeners);
      };
    },

    setBackground(next) {
      background = next;
    },

    async start(next) {
      if (state !== 'stopped' && state !== 'paused') return;
      options = next;
      const thisRun = ++run;
      await adapter.unlock();
      if (run !== thisRun) return; // stopped while waiting for unlock
      beginRun();
    },

    stop() {
      run++;
      clearTimers();
      adapter.stopAll();
      options = null;
      setState('stopped');
    },

    change(next) {
      if (state === 'stopped' || state === 'paused') return;
      options = next;
      run++;
      clearTimers();
      adapter.stopAll();
      setState('restarting');
      const thisRun = run;
      restartTimer = setTimeout(() => {
        restartTimer = null;
        if (run === thisRun && options) beginRun();
      }, RESTART_PAUSE_SECONDS * 1000);
    },
  };
}
