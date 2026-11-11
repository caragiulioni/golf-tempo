import { TONES } from './tones';
import type { AudioAdapter, Voice } from './types';

/** Peak volume of one beep (0 to 1). Leaves room so overlapping beeps do not clip. */
const PEAK_GAIN = 0.4;

/**
 * Web Audio version of the adapter. The only file that touches AudioContext.
 * Beeps are scheduled on the audio clock (AudioContext.currentTime).
 */
export function createWebAudioAdapter(): AudioAdapter {
  let context: AudioContext | null = null;
  let active = new Set<OscillatorNode>();

  function getContext(): AudioContext {
    if (!context) context = new AudioContext();
    return context;
  }

  return {
    async unlock() {
      // Creating and resuming the context must happen inside a user tap.
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
