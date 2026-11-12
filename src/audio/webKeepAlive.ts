/**
 * WEB ONLY, EXPERIMENT. A silent looping <audio> element, plus Safari's audio session
 * setting. Some iPhones and iPads keep playing when the screen locks if the page looks
 * like a media player. Not guaranteed. Turned on with ?keepalive=1 in the audio lab.
 */

const SAMPLE_RATE = 8000;
const SECONDS = 1;

/** One second of silence as a WAV file, built in code so no file is needed. */
function silentWavUrl(): string {
  const samples = SAMPLE_RATE * SECONDS;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeText(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true); // size of this block
  view.setUint16(20, 1, true); // plain PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // bytes per second
  view.setUint16(32, 2, true); // bytes per sample
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, 'data');
  view.setUint32(40, samples * 2, true);
  // The sample data is already all zeros, which is silence.
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

export type KeepAlive = {
  /** Call from inside the user's tap, before any await. */
  start(): void;
  stop(): void;
};

export function createKeepAlive(): KeepAlive {
  let audio: HTMLAudioElement | null = null;
  let url: string | null = null;

  return {
    start() {
      if (typeof document === 'undefined') return;
      try {
        // Tells Safari this page is playing audio for its own sake (Safari 16.4 and later).
        const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
        if (session) session.type = 'playback';
      } catch {
        // Not supported.
      }
      if (audio) {
        void audio.play().catch(() => {});
        return;
      }
      url = silentWavUrl();
      audio = new Audio(url);
      audio.loop = true;
      audio.setAttribute('playsinline', '');
      void audio.play().catch(() => {});
    },

    stop() {
      if (audio) audio.pause();
    },
  };
}
