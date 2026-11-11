# Design: audio-playback

## Files

In `src/audio/`:
- `types.ts`: the adapter interface and the tone voice names. No web code.
- `tones.ts`: the pitch and length of each voice, the weight shift tone setting, and which voice an event uses (`voiceFor(category, eventType)`).
- `webAudio.ts`: the web implementation of the adapter (the only file that touches `AudioContext`).
- `player.ts`: plays the engine's events through an adapter, repeats them, handles start, stop and restart. Takes the adapter as input, so it can be tested with a fake one.
- `index.ts`: exports.

In `src/engine/` (small addition to spec 1):
- `repeat.ts`: repeat pause factors, `repeatPauseSeconds(preset)` and `cycleSeconds(preset)`, with tests.

Temporary, deleted when spec 3 lands:
- `src/app/dev/AudioLab.tsx`: a screen with a few buttons for listening tests (preset buttons, play, stop, weight shift slider stand-in, tone switch). Not production UI.

## Adapter interface

```ts
type Voice = 'beat1' | 'weightShift' | 'beat2' | 'beat3'; // Short Game beat 3 uses the 'beat1' voice
interface AudioAdapter {
  unlock(): Promise<void>;          // must be called from a tap
  now(): number;                    // audio clock, seconds
  playTone(voice: Voice, time: number): void;
  stopAll(): void;                  // silences scheduled tones
}
```

## Player

- Look-ahead scheduling: a timer wakes up often (about every 25 ms) and schedules any swing that starts within the next 100 ms or so. The timer never decides when a beep sounds, it only fills the schedule. Beep times come from the audio clock plus the engine's event times.
- Each swing starts at the previous start plus `cycleSeconds(preset)`, so repeats do not drift.
- Constants (named): look-ahead window, timer interval, restart pause 0.5 s, debounce 300 ms.
- It records the start time of every swing and the events scheduled, and exposes them for the UI to read.
- `stop()` cancels the timer and calls `stopAll()`.
- `change(settings)` while playing: stop, wait the restart pause, start from beat 1. Calls within the debounce window collapse into the last one. If stopped, does nothing.

## Phone behavior

- Wake lock: requested on play, released on stop. Wrapped in a small web-only helper so native can swap it.
- Visibility: on `visibilitychange` to hidden, stop and report "paused". The UI shows a tap to resume.

## Checking

- Engine additions: automated tests.
- Player: automated tests with a fake adapter are allowed where cheap (`src/audio` is not covered by the test runner config today; widen `vitest.config.mts` only if we add them). The main checks are manual and reported: logged audio times against the engine, and listening on devices.
