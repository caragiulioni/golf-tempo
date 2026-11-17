// Connects the UI to the audio Player. One shared adapter and player for the whole app
// (module-level singleton), so the audio lab can share it later.
//
// Web only for now: the web adapter uses Web Audio, which does not exist in Expo Go.
// On other platforms no adapter is created and toggle() reports 'startFailed' without
// throwing. Native audio is a later spec.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  attachWebSession,
  createPlayer,
  createWebAudioAdapter,
  type Player,
  type PlayerState,
  type ScheduledLeadIn,
  type ScheduledSwing,
  type SwingOptions,
  type WebAudioAdapter,
} from '../../audio';
import type { Preset, WeightShiftSettings } from '../../engine';
import { resolveOutputDelay, resolveOutputDelayForSwing, type OutputDelay } from '../lib/outputDelay';
import { currentPlatformKey } from '../lib/platformKey';
import { addLog } from './sessionLog';

/** What the screen shows under the play button. */
export type SessionMessage = 'paused' | 'startFailed' | null;

/** `settings` are the weight shift positions to play with (plain data, so this file knows nothing about CONFIG). */
export type SessionSelection = {
  preset: Preset;
  loop: boolean;
  settings: WeightShiftSettings;
  /** False plays the three Tour Tempo beats only. Default true. */
  includeWeightShift?: boolean;
  /** False leaves out the cue at the top of the backswing. Default true. */
  includeTop?: boolean;
};

export const START_FAILED_TEXT = 'Audio could not start. Tap play to try again.';
export const PAUSED_TEXT = 'Playback paused. Tap play to resume.';

type SwingListener = (swing: ScheduledSwing) => void;

let player: Player | null = null;
let sharedAdapter: WebAudioAdapter | null = null;
const swingListeners = new Set<SwingListener>();
type LeadInListener = (leadIn: ScheduledLeadIn) => void;
const leadInListeners = new Set<LeadInListener>();
// Output delay resolved at the latest swing. Null until the first swing.
let lastDelay: OutputDelay | null = null;
// The last delay the browser reported at the second swing or later of a run (V2-13). The first swing
// of the next run starts with it, so a restart does not time its lights with the platform guess.
let rememberedDelay: number | null = null;
// Swings scheduled since the player last became 'playing'. 0 means the next one is the first of the run.
let swingsInRun = 0;

/**
 * Seconds between a beep's audio-clock time and it being heard. The latest swing's value;
 * before the first swing, the platform fallback.
 */
export function outputDelay(): number {
  return (lastDelay ?? resolveOutputDelay(null, currentPlatformKey(Platform.OS))).seconds;
}

/** The shared player, created on first use. Null where there is no audio adapter (not web). */
export function getSharedPlayer(): Player | null {
  if (player) return player;
  if (Platform.OS !== 'web') return null;
  const adapter = createWebAudioAdapter();
  sharedAdapter = adapter;
  adapter.onStateChange((state) => addLog(`Audio context: ${state}`));
  const created = createPlayer(adapter, {
    onLeadIn: (leadIn) => {
      // The countdown comes before the run's first swing, so resolve the first-swing delay here
      // (the remembered value, or the platform constant on the first run), or listeners would read
      // the previous run's value.
      lastDelay = resolveOutputDelayForSwing(
        sharedAdapter?.info() ?? null,
        currentPlatformKey(Platform.OS),
        0,
        rememberedDelay,
      );
      leadInListeners.forEach((listener) => listener(leadIn));
    },
    onSwing: (swing) => {
      // Resolve first, so listeners read this swing's value (R6.5: applies from this swing on).
      lastDelay = resolveOutputDelayForSwing(
        sharedAdapter?.info() ?? null,
        currentPlatformKey(Platform.OS),
        swingsInRun,
        rememberedDelay,
      );
      if (swingsInRun > 0 && lastDelay.source === 'reported') rememberedDelay = lastDelay.seconds;
      const browserSaid = sharedAdapter?.info()?.outputLatencySeconds;
      addLog(
        `Output delay ${Math.round(lastDelay.seconds * 1000)} ms (${lastDelay.source})${
          swingsInRun === 0
            ? ` first swing${typeof browserSaid === 'number' ? `, browser said ${Math.round(browserSaid * 1000)} ms` : ''}`
            : ''
        }`,
      );
      swingListeners.forEach((listener) => listener(swing));
      swingsInRun += 1;
    },
    onState: (state) => {
      // The state event fires before the first swing of a run (start, restart, resume).
      if (state === 'playing') swingsInRun = 0;
      addLog(`Player: ${state}`);
    },
    onResync: () => addLog('Timer fell behind. Restarted from beat 1.'),
    onPaused: (reason, behind) =>
      addLog(
        reason === 'stalled'
          ? `Paused: audio stalled (audio clock ${((behind ?? 0) * 1000).toFixed(0)} ms behind)`
          : reason === 'hidden'
            ? 'Paused: page hidden or phone locked'
            : 'Paused: the system took the audio away',
      ),
  });
  // Lives as long as the page.
  attachWebSession(created, {
    onWakeLock: (status) => addLog(`Wake lock: ${status}`),
    onVisibility: (hidden) => addLog(hidden ? 'Page hidden or phone locked' : 'Page visible again'),
  });
  player = created;
  return created;
}

/** Stops the shared player if there is one. Never creates it (creating belongs inside a tap). */
export function stopSharedPlayer(): void {
  player?.stop();
}

/** The shared web adapter, for the audio lab. Null before first use and where there is no web audio. */
export function getSharedAdapter(): WebAudioAdapter | null {
  return sharedAdapter;
}

/**
 * Register for every scheduled swing (for the timeline, later). Not React state, so
 * animation does not re-render the screen. Returns a function that removes it.
 */
export function onSwing(listener: SwingListener): () => void {
  swingListeners.add(listener);
  return () => {
    swingListeners.delete(listener);
  };
}

/**
 * Register for the countdown that starts every run on a drill (V2-08). Called once per run,
 * before the first swing. Returns a function that removes it.
 */
export function onLeadIn(listener: LeadInListener): () => void {
  leadInListeners.add(listener);
  return () => {
    leadInListeners.delete(listener);
  };
}
/** The shared audio clock in seconds, or null before the first press / where there is no audio. */
export function audioNow(): number | null {
  return sharedAdapter ? sharedAdapter.now() : null;
}

export function swingOptionsFor({ preset, loop, settings, includeWeightShift = true, includeTop = true }: SessionSelection): SwingOptions {
  return { preset, settings, includeWeightShift, includeTop, loop };
}

type SessionOptions = {
  /**
   * False while another screen owns playback (the main screen stays mounted under Config).
   * An inactive session never restarts the player on a change. Default true.
   */
  active?: boolean;
};

export function usePlayerSession(selection: SessionSelection, { active = true }: SessionOptions = {}) {
  // Peek only; the player is created on the first press, inside the tap.
  const [playerState, setPlayerState] = useState<PlayerState>(() => player?.getState() ?? 'stopped');
  const [message, setMessage] = useState<SessionMessage>(null);
  const swingOptions = useMemo(() => swingOptionsFor(selection), [selection.preset, selection.loop, selection.includeWeightShift, selection.includeTop, selection.settings.long, selection.settings.short]); // eslint-disable-line react-hooks/exhaustive-deps
  // Latest options for toggle() and for 6.3 (restart on change).
  const optionsRef = useRef(swingOptions);
  optionsRef.current = swingOptions;

  // Follow the shared player's state. Re-runs after the first press creates the player.
  const [ready, setReady] = useState(player !== null);
  useEffect(() => {
    if (!ready || !player) return;
    setPlayerState(player.getState());
    return player.subscribe({
      onState: (state) => {
        setPlayerState(state);
        if (state === 'playing') setMessage(null);
      },
      onPaused: () => setMessage('paused'),
    });
  }, [ready]);

  const playing = playerState === 'playing' || playerState === 'restarting';

  // Restart on selection change (R3.10). Category changes swap the preset object too.
  // The ref holds the last selection seen, so the first render, a strict-mode re-run and a
  // re-render with the same values all compare equal and do nothing. The loop switch and the
  // weight shift positions restart the same way. Only one active instance at a time: the main
  // screen stays mounted (hidden) under Config, so it passes active=false while Config is open,
  // and an inactive instance forgets the last selection so that becoming active again never
  // restarts anything.
  const lastSelectionRef = useRef<SessionSelection | null>(null);
  useEffect(() => {
    if (!active) {
      lastSelectionRef.current = null;
      return;
    }
    const previous = lastSelectionRef.current;
    lastSelectionRef.current = selection;
    if (
      previous === null ||
      (previous.preset === selection.preset &&
        previous.loop === selection.loop &&
        previous.includeWeightShift === selection.includeWeightShift &&
        previous.includeTop === selection.includeTop &&
        previous.settings.long === selection.settings.long &&
        previous.settings.short === selection.settings.short)
    ) {
      return;
    }
    if (!player) return;
    const state = player.getState();
    if (state !== 'playing' && state !== 'restarting') return;
    player.change(optionsRef.current);
  }, [active, selection.preset, selection.loop, selection.includeWeightShift, selection.includeTop, selection.settings.long, selection.settings.short]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async () => {
    const current = getSharedPlayer();
    if (current && !ready) setReady(true);
    if (current && (current.getState() === 'playing' || current.getState() === 'restarting')) {
      current.stop();
      return;
    }
    setMessage(null);
    try {
      if (!current) throw new Error('No audio on this platform yet');
      await current.start(optionsRef.current);
    } catch {
      setMessage('startFailed');
    }
  }, [ready]);

  return { playerState, playing, message, toggle, onSwing, onLeadIn };
}
