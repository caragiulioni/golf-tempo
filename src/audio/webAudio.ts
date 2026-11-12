import { TONES } from './tones';
import type { AudioAdapter, Voice } from './types';

/** Peak volume of one beep (0 to 1). Leaves room so overlapping beeps do not clip. */
const PEAK_GAIN = 0.4;

/**
 * Stopping a beep that is sounding must fade it out, not cut it, or the cut makes a click.
 * The fade is an exponential approach to silence; after STOP_FADE_SECONDS it is inaudible
 * and the oscillators are stopped.
 */
const STOP_FADE_TIME_CONSTANT = 0.004;
const STOP_FADE_SECONDS = 0.06;

/** One beep that has been scheduled and has not finished yet. */
type ActiveTone = {
  /** Separate from the beep's own envelope, so fading it never disturbs that envelope. */
  fader: GainNode;
  oscillators: OscillatorNode[];
  startTime: number;
};

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
};

/** What the browser says about its audio, for the Copy log button. */
export type WebAudioInfo = {
  state: string;
  sampleRate: number;
  baseLatencySeconds: number | null;
  outputLatencySeconds: number | null;
  latencyHint: string;
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
  const stateListeners = new Set<(state: string) => void>();
  let context: AudioContext | null = null;
  const active = new Set<ActiveTone>();
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
      // Must happen inside a user tap, before the first await.
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
      // The fader stays at full volume until stopAll() fades it.
      const fader = ctx.createGain();
      gain.connect(fader);
      fader.connect(ctx.destination);
      const activeTone: ActiveTone = { fader, oscillators: [], startTime: time };
      active.add(activeTone);

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
        activeTone.oscillators.push(osc);
        osc.onended = () => active.delete(activeTone);
      }
    },

    info() {
      if (!context) return null;
      return {
        state: context.state,
        sampleRate: context.sampleRate,
        baseLatencySeconds: typeof context.baseLatency === 'number' ? context.baseLatency : null,
        outputLatencySeconds: typeof context.outputLatency === 'number' ? context.outputLatency : null,
        latencyHint: options.latencyHint ?? DEFAULT_LATENCY_HINT,
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
      if (!context) return;
      const now = context.currentTime;
      for (const tone of active) {
        // Fade to silence. A beep that has not started yet is silenced the same way,
        // so it makes no sound when its turn comes.
        tone.fader.gain.setTargetAtTime(0, now, STOP_FADE_TIME_CONSTANT);
        if (tone.startTime <= now) {
          for (const osc of tone.oscillators) {
            try {
              osc.stop(now + STOP_FADE_SECONDS);
            } catch {
              // Already stopped.
            }
          }
        }
      }
    },
  };
}
