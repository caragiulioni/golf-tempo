import { TONES } from './tones';
import type { AudioAdapter, Voice } from './types';
import { createKeepAlive } from './webKeepAlive';

/** Peak volume of one beep (0 to 1). Leaves room so overlapping beeps do not clip. */
const PEAK_GAIN = 0.4;

export type WebAudioOptions = {
  /**
   * EXPERIMENT. 'playback' asks the browser for a bigger audio buffer, which is
   * harder to upset but adds a little output delay. Default: the browser's choice.
   */
  latencyHint?: AudioContextLatencyCategory;
  /** EXPERIMENT. Keep a silent audio element playing so iOS may keep audio on lock. */
  keepAlive?: boolean;
};

/** What the browser says about its audio, for the Copy log button. */
export type WebAudioInfo = {
  state: string;
  sampleRate: number;
  baseLatencySeconds: number | null;
  outputLatencySeconds: number | null;
  latencyHint: string;
  keepAlive: boolean;
};

export type WebAudioAdapter = AudioAdapter & {
  /** null until the first tap creates the audio context. */
  info(): WebAudioInfo | null;
  /** Every change of the audio context state, for example running, suspended, interrupted. */
  onStateChange(listener: (state: string) => void): () => void;
};

/**
 * Web Audio version of the adapter. The only file that touches AudioContext.
 * Beeps are scheduled on the audio clock (AudioContext.currentTime).
 */
export function createWebAudioAdapter(options: WebAudioOptions = {}): WebAudioAdapter {
  const keepAlive = options.keepAlive ? createKeepAlive() : null;
  const stateListeners = new Set<(state: string) => void>();
  let context: AudioContext | null = null;
  let active = new Set<OscillatorNode>();
  const suspendedListeners = new Set<() => void>();

  function getContext(): AudioContext {
    if (!context) {
      context = options.latencyHint
        ? new AudioContext({ latencyHint: options.latencyHint })
        : new AudioContext();
      // Safari reports 'interrupted' when the phone takes audio away (lock, call).
      context.onstatechange = () => {
        if (!context) return;
        for (const listener of stateListeners) listener(context.state);
        if (context.state !== 'running') {
          for (const listener of suspendedListeners) listener();
        }
      };
    }
    return context;
  }

  return {
    async unlock() {
      // Both of these must happen inside a user tap, before the first await.
      keepAlive?.start();
      const ctx = getContext();
      if (ctx.state !== 'running') await ctx.resume();
    },

    now() {
      return context ? context.currentTime : 0;
    },

    playTone(voice: Voice, time: number) {
      const ctx = getContext();
      const tone = TONES[voice];
      const end = time + tone.seconds;

      const gain = ctx.createGain();
      // Sharp start, then a smooth fade so there is no click at the end.
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(PEAK_GAIN, time + tone.attackSeconds);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      gain.connect(ctx.destination);

      const parts: Array<[number, number]> = [
        [tone.frequency, 1],
        [tone.frequency * 2, tone.harmonic],
      ];
      for (const [frequency, level] of parts) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, time);
        const partGain = ctx.createGain();
        partGain.gain.setValueAtTime(level / (1 + tone.harmonic), time);
        osc.connect(partGain);
        partGain.connect(gain);
        osc.start(time);
        osc.stop(end + 0.02);
        active.add(osc);
        osc.onended = () => active.delete(osc);
      }
    },

    release() {
      keepAlive?.stop();
    },

    info() {
      if (!context) return null;
      return {
        state: context.state,
        sampleRate: context.sampleRate,
        baseLatencySeconds: typeof context.baseLatency === 'number' ? context.baseLatency : null,
        outputLatencySeconds: typeof context.outputLatency === 'number' ? context.outputLatency : null,
        latencyHint: options.latencyHint ?? 'default',
        keepAlive: Boolean(keepAlive),
      };
    },

    onStateChange(listener) {
      stateListeners.add(listener);
      return () => {
        stateListeners.delete(listener);
      };
    },

    onSuspended(listener) {
      suspendedListeners.add(listener);
      return () => {
        suspendedListeners.delete(listener);
      };
    },

    stopAll() {
      for (const osc of active) {
        try {
          osc.stop();
        } catch {
          // Already stopped.
        }
      }
      active = new Set();
    },
  };
}
