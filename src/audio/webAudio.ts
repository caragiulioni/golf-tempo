import { TONES } from './tones';
import type { AudioAdapter, Voice } from './types';
import { createKeepAlive } from './webKeepAlive';

/** Peak volume of one beep (0 to 1). Leaves room so overlapping beeps do not clip. */
const PEAK_GAIN = 0.4;

/** How long to wait for the audio clock to start moving after a tap, in ms. */
const CLOCK_WARMUP_TIMEOUT_MS = 1500;
const CLOCK_WARMUP_POLL_MS = 10;

/**
 * Right after a tap, some phones report 'running' while the audio clock is still at
 * zero, then jump ahead once the speaker has really opened (slower with a bigger buffer).
 * Scheduling during that jump makes the first swing late. This waits until the clock has
 * actually moved. It only runs once per start and has nothing to do with beat timing.
 */
async function waitForClockToRun(ctx: AudioContext): Promise<void> {
  const first = ctx.currentTime;
  const deadline = Date.now() + CLOCK_WARMUP_TIMEOUT_MS;
  while (ctx.state === 'running' && ctx.currentTime <= first && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, CLOCK_WARMUP_POLL_MS));
  }
}

/**
 * A bigger audio buffer. Beeps are scheduled ahead on the audio clock, so a small buffer
 * buys nothing here, and on a Pixel 6 the small one crackled while the phone was locked
 * (the bigger one did not). The cost is more delay between scheduling and hearing a beep
 * (about 280 ms on that phone). The UI must shift anything visual by the amount the
 * browser reports (AudioContext.outputLatency, see info()).
 */
const DEFAULT_LATENCY_HINT: AudioContextLatencyCategory = 'playback';

export type WebAudioOptions = {
  /** Audio buffer size hint. Default 'playback'. Use 'interactive' to compare the small buffer. */
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
      context = new AudioContext({ latencyHint: options.latencyHint ?? DEFAULT_LATENCY_HINT });
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
      await waitForClockToRun(ctx);
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
        latencyHint: options.latencyHint ?? DEFAULT_LATENCY_HINT,
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
