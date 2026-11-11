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
- Constants (named): look-ahead window 0.25 s, timer interval 25 ms, restart pause 0.5 s.
- It records the start time of every swing and the events scheduled, and exposes them for the UI to read.
- `stop()` cancels the timer and calls `stopAll()`.
- `change(options)` while playing: silence at once, wait the restart pause, start from beat 1. Every new change restarts the wait, so rapid changes collapse into the last one (this is the debounce; no separate timer). If stopped, does nothing.

## Phone behavior

- Wake lock: `attachWebSession` in `webSession.ts` (web-only) asks for it when the player starts playing and lets go on stop or pause. The browser drops it when the page is hidden, so it asks again when the page is visible. Needs https or localhost.
- Background: the same helper tells the player when the page is hidden. The player then schedules 5 s ahead instead of 0.25 s, so slowed timers do not leave gaps. Playback keeps going.
- System takes audio away (iOS on lock): the adapter reports `onSuspended` (any AudioContext state other than running, including Safari's 'interrupted'). The player stops, silences, and goes to the `paused` state. Resuming needs a tap and starts from beat 1.
- Timer starved (page frozen): if the next swing's start is already in the past, the player does not catch up. It starts a fresh run from beat 1 and reports `onResync`.
- Whether each device keeps playing on lock is decided by the device tests (Wave 2.3, task 5). Results go in `docs/porting-guide.md`.

## Checking

- Engine additions: automated tests.
- Player: automated tests with a fake adapter are allowed where cheap (`src/audio` is not covered by the test runner config today; widen `vitest.config.mts` only if we add them). The main checks are manual and reported: logged audio times against the engine, and listening on devices.
