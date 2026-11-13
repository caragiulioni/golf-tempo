import {
  buildSequence,
  cycleSeconds,
  loopEvents,
  type LoopVoice,
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

export type ScheduledLoopEvent = {
  voice: LoopVoice;
  accent?: boolean;
  /** Audio clock time in seconds. */
  time: number;
};

export type SwingOptions = {
  preset: Preset;
  settings: WeightShiftSettings;
  includeWeightShift?: boolean;
  toneStyle?: WeightShiftToneStyle;
  /** Play the background loop. Default false. */
  loop?: boolean;
  /**
   * Sound the beeps. Default true. False plays the loop on its own (Audio lab, for
   * listening to the groove). The beeps are still scheduled and reported, silently, so
   * logs and visuals keep their times.
   */
  beeps?: boolean;
};

/** The loop events of one bar on the audio clock, or none when the loop is off. */
export function loopSchedule(startTime: number, { preset, loop = false }: SwingOptions): ScheduledLoopEvent[] {
  if (!loop) return [];
  return loopEvents(preset).map((event) => ({ ...event, time: startTime + event.time }));
}

/**
 * Schedule one swing so beat 1 sounds at `startTime` (audio clock seconds).
 * Returns what was scheduled so the UI and the checks can read it.
 */
export function scheduleSwing(
  adapter: AudioAdapter,
  startTime: number,
  options: SwingOptions,
): ScheduledBeep[] {
  const { preset, settings, includeWeightShift = true, toneStyle, beeps: soundBeeps = true } = options;
  const events = buildSequence({ preset, settings, includeWeightShift });
  // Beeps first. Loop events only add sound and never change beep timing.
  const beeps = events.map((event) => {
    const voice = voiceFor(preset.category, event.type, toneStyle);
    const time = startTime + event.time;
    if (soundBeeps) adapter.playTone(voice, time);
    return { type: event.type, voice, time };
  });
  // An adapter without playLoopVoice plays no loop.
  if (adapter.playLoopVoice) {
    for (const event of loopSchedule(startTime, options)) {
      adapter.playLoopVoice(event.voice, event.time, event.accent);
    }
  }
  return beeps;
}

/** How far ahead of the audio clock the next swing is scheduled, in seconds. */
export const LOOKAHEAD_SECONDS = 0.25;
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
/**
 * If the audio clock falls this far behind the device clock within one check window, the
 * phone is stalling the audio (seen on a Pixel 6 after a few minutes locked). Beeps would
 * come out late and broken, so the player pauses instead. Normal wobble is a few milliseconds.
 */
export const STALL_THRESHOLD_SECONDS = 0.15;
/**
 * The two clocks are compared over a rolling window, not since Play. The audio clock and
 * the device clock come from different chips and drift apart slowly (about 20 parts per
 * million on a Pixel 6, about 35 ms in 30 minutes). Over a long session that normal drift
 * would add up and trip the guard on a phone whose audio clock runs slow. Over 10 s it is
 * well under 1 ms, while a real stall (audio clock stopped) still trips within 0.15 s.
 */
export const STALL_WINDOW_SECONDS = 10;

/**
 * Why playback paused. 'hidden': the phone locked or another app came to the front.
 * 'system': the phone took the audio away. 'stalled': the audio output fell behind.
 */
export type PauseReason = 'hidden' | 'system' | 'stalled';

export type PlayerState = 'stopped' | 'playing' | 'restarting' | 'paused';

/** One swing that was scheduled, for the UI to follow. Times are on the audio clock. */
export type ScheduledSwing = {
  /** When beat 1 of this swing sounds. */
  startTime: number;
  beeps: ScheduledBeep[];
  /** Loop events scheduled with this swing. Empty when the loop is off. */
  loop: ScheduledLoopEvent[];
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
  /** Playback paused. For 'stalled', `behindSeconds` is how far the audio clock had fallen behind. */
  onPaused?: (reason: PauseReason, behindSeconds?: number) => void;
};

export type PlayerConfig = {
  /** Device clock in milliseconds, used only to notice stalls. Default: performance.now(). */
  wallClockMs?: () => number;
};

export interface Player {
  getState(): PlayerState;
  /** Add more listeners. Returns a function that removes them. */
  subscribe(listeners: PlayerListeners): () => void;
  /**
   * Pause now and silence everything. The user taps Play to start again from beat 1.
   * Does nothing unless playing or restarting.
   */
  pause(reason: PauseReason): void;
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
export function createPlayer(
  adapter: AudioAdapter,
  initialListeners: PlayerListeners = {},
  config: PlayerConfig = {},
): Player {
  const wallClockMs =
    config.wallClockMs ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  // Where the audio clock and the device clock were at the start of the current check window.
  let windowAudio = 0;
  let windowWallMs = 0;
  const listenerSet = new Set<PlayerListeners>([initialListeners]);
  const notify = <K extends keyof PlayerListeners>(key: K, ...args: Parameters<NonNullable<PlayerListeners[K]>>) => {
    for (const l of listenerSet) (l[key] as ((...a: unknown[]) => void) | undefined)?.(...args);
  };
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

  function pauseNow(reason: PauseReason, behindSeconds?: number) {
    run++;
    clearTimers();
    adapter.stopAll();
    adapter.release?.();
    setState('paused');
    notify('onPaused', reason, behindSeconds);
  }

  function scheduleDueSwings() {
    if (state !== 'playing' || !options) return;
    // Stall guard: within each window the audio clock should keep pace with the device clock.
    const wallNowMs = wallClockMs();
    const audioNow = adapter.now();
    const wallElapsed = (wallNowMs - windowWallMs) / 1000;
    const behind = wallElapsed - (audioNow - windowAudio);
    if (behind > STALL_THRESHOLD_SECONDS) {
      pauseNow('stalled', behind);
      return;
    }
    if (wallElapsed >= STALL_WINDOW_SECONDS) {
      windowAudio = audioNow;
      windowWallMs = wallNowMs;
    }
    // Fell behind (page frozen, timer starved): do not play missed swings all at once.
    // Start a fresh run from beat 1 instead.
    if (nextStart < adapter.now()) {
      nextStart = adapter.now() + START_DELAY_SECONDS;
      adapter.stopAll();
      notify('onResync');
    }
    while (nextStart - adapter.now() < LOOKAHEAD_SECONDS) {
      const swingStart = nextStart;
      const beeps = scheduleSwing(adapter, swingStart, options);
      const cycle = cycleSeconds(options.preset);
      notify('onSwing', {
        startTime: swingStart,
        beeps,
        loop: loopSchedule(swingStart, options),
        leadSeconds: swingStart - adapter.now(),
        cycleSeconds: cycle,
      });
      nextStart = swingStart + cycle;
    }
  }

  function beginRun() {
    windowAudio = adapter.now();
    windowWallMs = wallClockMs();
    nextStart = windowAudio + START_DELAY_SECONDS;
    setState('playing');
    scheduleDueSwings();
    tick = setInterval(scheduleDueSwings, TIMER_INTERVAL_MS);
  }

  // The phone or browser took the audio away (iOS does this on lock). Stop cleanly.
  adapter.onSuspended(() => {
    if (state !== 'playing' && state !== 'restarting') return;
    pauseNow('system');
  });

  return {
    getState: () => state,

    subscribe(listeners) {
      listenerSet.add(listeners);
      return () => {
        listenerSet.delete(listeners);
      };
    },

    pause(reason) {
      if (state !== 'playing' && state !== 'restarting') return;
      pauseNow(reason);
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
      adapter.release?.();
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
