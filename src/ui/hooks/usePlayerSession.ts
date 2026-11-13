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
  type AudioAdapter,
  type Player,
  type PlayerState,
  type ScheduledSwing,
  type SwingOptions,
} from '../../audio';
import { defaultWeightShiftSettings, type Preset } from '../../engine';

/** What the screen shows under the play button. */
export type SessionMessage = 'paused' | 'startFailed' | null;

export type SessionSelection = { preset: Preset };

export const START_FAILED_TEXT = 'Audio could not start. Tap play to try again.';
export const PAUSED_TEXT = 'Playback paused. Tap play to resume.';

type SwingListener = (swing: ScheduledSwing) => void;

let player: Player | null = null;
let sharedAdapter: AudioAdapter | null = null;
const swingListeners = new Set<SwingListener>();

/** The shared player, created on first use. Null where there is no audio adapter (not web). */
export function getSharedPlayer(): Player | null {
  if (player) return player;
  if (Platform.OS !== 'web') return null;
  const adapter = createWebAudioAdapter();
  sharedAdapter = adapter;
  const created = createPlayer(adapter, {
    onSwing: (swing) => swingListeners.forEach((listener) => listener(swing)),
  });
  attachWebSession(created); // lives as long as the page
  player = created;
  return created;
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

/** The shared audio clock in seconds, or null before the first press / where there is no audio. */
export function audioNow(): number | null {
  return sharedAdapter ? sharedAdapter.now() : null;
}

export function swingOptionsFor({ preset }: SessionSelection): SwingOptions {
  return { preset, settings: defaultWeightShiftSettings(), includeWeightShift: true };
}

export function usePlayerSession(selection: SessionSelection) {
  // Peek only; the player is created on the first press, inside the tap.
  const [playerState, setPlayerState] = useState<PlayerState>(() => player?.getState() ?? 'stopped');
  const [message, setMessage] = useState<SessionMessage>(null);
  const swingOptions = useMemo(() => swingOptionsFor(selection), [selection.preset]); // eslint-disable-line react-hooks/exhaustive-deps
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
  // The ref holds the last preset seen, so the first render, a strict-mode re-run and a
  // re-render with the same preset all compare equal and do nothing. Only call this hook
  // from MainScreen: it stays mounted under other screens, and a second instance would
  // call change() twice.
  const lastPresetRef = useRef<Preset | null>(null);
  useEffect(() => {
    const previous = lastPresetRef.current;
    lastPresetRef.current = selection.preset;
    if (previous === null || previous === selection.preset) return;
    if (!player) return;
    const state = player.getState();
    if (state !== 'playing' && state !== 'restarting') return;
    player.change(optionsRef.current);
  }, [selection.preset]);

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

  return { playerState, playing, message, toggle, onSwing };
}
