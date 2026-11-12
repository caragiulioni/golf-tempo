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
- Hidden page: the same helper calls `player.pause('hidden')` when the page is hidden (lock or app switch). Coming back does not restart by itself; the user taps Play. (An earlier version kept playing in the background by scheduling 5 s ahead. Device tests showed a locked Pixel 6 degrading after about 4 minutes, so it was replaced.)
- System takes audio away (iOS on lock): the adapter reports `onSuspended` (any AudioContext state other than running, including Safari's 'interrupted'). The player stops, silences, and goes to the `paused` state. Resuming needs a tap and starts from beat 1.
- Timer starved (page frozen): if the next swing's start is already in the past, the player does not catch up. It starts a fresh run from beat 1 and reports `onResync`.
- Stall guard: at every timer tick the player compares how far the audio clock has moved with how far the device clock has moved since the run began. If the audio clock is more than `STALL_THRESHOLD_SECONDS` (0.15 s) behind, the phone is stalling the audio, so the player pauses (`onPaused('stalled')`) instead of playing late, crunchy beeps. Reason: on a Pixel 6 locked for several minutes, the audio degraded and stopped while the page kept running. Normal readings stay within about 60 ms. Checked with a throwaway fake-clock test (keeps playing when in step, pauses on a stall, schedules nothing after, can start again).
- Device results go in `docs/porting-guide.md`. Plain-language background for the user: `docs/development-decisions.md`, entry 1.

## Audio buffer and output delay

- The web adapter asks for a bigger audio buffer (`latencyHint: 'playback'`) by default. Reason: on a Pixel 6 the small buffer crackled while the phone was locked (5 crunches in three locks), the bigger one did not (none in three locks). We schedule ahead, so we do not need the low delay.
- Cost: about 280 ms between scheduling a beep and hearing it (Pixel 6, reported by `AudioContext.outputLatency`; 16 ms with the small buffer). Beep spacing is not affected. Anything visual must be shifted by this amount: the UI spec has to read `info().outputLatencySeconds` and delay the animation by it. If a browser does not report it, assume it is unknown and say so in the porting guide.

## Checking

- Engine additions: automated tests.
- Player: automated tests with a fake adapter are allowed where cheap (`src/audio` is not covered by the test runner config today; widen `vitest.config.mts` only if we add them). The main checks are manual and reported: logged audio times against the engine, and listening on devices.
