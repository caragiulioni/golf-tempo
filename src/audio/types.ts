/**
 * Which sound to play. Short Game beat 3 uses the 'beat1' voice (see tones.ts).
 */
export type Voice = 'beat1' | 'weightShift' | 'beat2' | 'beat3';

/** Background loop sounds (808 style). Separate from the beeps in `Voice`. */
export type LoopVoice = 'kick' | 'snare' | 'hat';

/**
 * Everything the app needs from an audio system. Web and native each provide
 * their own version. No DOM or React in this file.
 */
export interface AudioAdapter {
  /** Wake the audio system. Must be called from a user tap the first time. */
  unlock(): Promise<void>;
  /** The audio clock in seconds. All times below are on this clock. */
  now(): number;
  /** Play a tone starting at `time` (audio clock seconds). */
  playTone(voice: Voice, time: number): void;
  /**
   * Optional. Play a background loop sound starting at `time` (audio clock seconds).
   * `accent` makes a hat tick a little louder. Adapters without it play no loop.
   */
  playLoopVoice?(voice: LoopVoice, time: number, accent?: boolean): void;
  /** Silence everything, including tones already scheduled for later. */
  stopAll(): void;
  /**
   * Call `listener` when the system takes the audio away (for example iOS on lock).
   * Returns a function that removes the listener.
   */
  onSuspended(listener: () => void): () => void;
  /** Optional. Called when playback ends (stopped or paused), so the platform can let go of the audio session. */
  release?(): void;
}
