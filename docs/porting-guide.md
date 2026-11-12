# Porting Guide: Web to iOS and Android

This is a running log, written as the project is built. After the last spec it gets rewritten into a single step-by-step guide for someone with little development experience.

Status: nothing in this guide has been tested on a real iOS or Android device unless an entry says so.

## Entry format

One entry per spec, added when the spec is finished.

```
### <spec name>
- What was built: plain-language summary.
- Carries over unchanged: what works the same on native.
- Web-only, must be replaced on native: what, where (file paths), and what to use instead.
- Needs testing on a real device: what to check.
- Decisions and reasons: anything a future reader would wonder about.
```

## Audio testing requirement

Audio must be tested on both Android and iOS. A pass on one platform does not count for the other. Record each result with the device model and OS or browser version, and what was checked: beats sound at the right times, the weight shift beat is audibly distinct, the loop stays locked to the beats, and there is no drift over a long session.

### Web (current build)

Test in desktop browsers plus iOS Safari and Android Chrome on real phones. Also check: audio starts after the first tap, the iPhone silent switch, and behavior when the tab is hidden or the screen locks.

| Device | OS / browser version | Result | Notes |
|---|---|---|---|
| Mac laptop (Apple silicon) | desktop browser (version not recorded) | Pass | Repeat, stop, restart, background tab and 2 minute drift check all fine. |
| Pixel 6 | Chrome (version not recorded) | Pass with bigger audio buffer | Wake lock kept the screen on. Locking the phone: with the small default buffer, crunches in the middle of a lock (5 across three locks of 15 to 26 s); with the bigger buffer (`latencyHint: 'playback'`) none across three locks. Cost: output delay 280 ms vs 16 ms, so visuals must be shifted. Sound kept playing through every lock. Long lock (about 6 minutes, bigger buffer): clean for roughly the first 3.5 minutes, then crunches that grew more frequent and larger, steady degradation after 5 minutes, and silence at about 6 minutes. Sound came back normally on unlock. Audio clock ended 1.09 s behind the device clock (it stays within about 50 ms in short runs); the player logged no late swings, so the page kept running and the phone slowed or stalled the audio output. Same test with `?keepalive=1` (silent audio element): first pop at about 4:15 after pressing Play, large crunches from about 4:40, audio stopped by itself at about 5:06, missing beats and crunchy again just before unlock at 5:36; works fully after unlock; audio clock 0.66 s behind. No better than without it, so the silent-audio trick does not help on this phone. Both runs fail at a similar point (3.5 to 4 minutes in). One run each, one phone. With the stall guard: run locked from the start, crunches from 4:25 after Play, sound gone at 5:16, guard paused at 5:28. Run with the screen on first (locked at 3:06 after Play, plus a short lock at 0:38 to 1:31): crunches from 4:31 after Play (only 1:25 after the lock), sound gone at about 5:40, guard paused at 5:46. So the trouble lines up with time since Play, not time since locking. The guard fires after the sound has died, not at the first crunch. |
| iPad (model not recorded) | iPadOS Safari and Chrome (versions not recorded) | Works, stops on lock | Clock drift 0.3 to 4.2 ms. Closest swing 97 ms ahead. Pressing lock stops the sound completely. Experiment pending. |
| Brother's Android | | Pending | Tested later through the Audio lab menu item (spec 3). Not yet tested. |

Model and version details still need to be recorded for each device above.

### Native (after the port)

At least one Android device and at least one iOS device (phone or tablet).

| Device | OS version | Result | Notes |
|---|---|---|---|
| (none tested yet) | | | |

## Entries

## Final guide checklist (written after the last spec)

- [ ] Plain-language overview: what the app is and what porting involves.
- [ ] Prerequisites and tools to install.
- [ ] Step-by-step: run on a simulator, run on a real device, build for the stores.
- [ ] List of web-only parts and their native replacements.
- [ ] Known risks and untested areas.
- [ ] How to open the hidden Audio lab (Diagnostics page) and use it as the first test on a phone: play, lock the phone, tap Copy log, send the log.

### timing-engine
- What was built: the timing brain of the app, in `src/engine/`. It holds the 16 tempo presets (10 Long Game, 6 Short Game) and works out when each beep happens in one swing: beat 1, the weight shift beat, beat 2 and beat 3. It returns a plain list of "this beep at this many seconds". It makes no sound and shows nothing on screen.
- Carries over unchanged: everything in `src/engine/` (files `presets.ts`, `beats.ts`, `weightShift.ts`, `sequence.ts`, `index.ts`). It is plain TypeScript with no web, React or audio code, so it is expected to work the same on iOS and Android. Not run on a phone yet. The tests (`*.test.ts`) run on a computer only and are not part of the app.
- Web-only, must be replaced on native: nothing. A search of `src/engine/` found no browser, React or audio references.
- Needs testing on a real device: nothing on its own. When the audio spec is built, check on both an Android device and an iOS device that the beeps really land at the times this list gives (beat 1 at 0 s, beat 2 at the first number divided by 30, and so on).
- Decisions and reasons:
  - Beat 3 comes 0.20 s later than the printed preset numbers imply. This was measured on all 11 Tour Tempo presets (`_references/tempo-measurements.md`), so it is copied on purpose. Do not "fix" it. The value is `BEAT3_DELAY_SECONDS` in `src/engine/beats.ts`.
  - The weight shift position is a fraction between beat 1 and beat 2 (0.05 to 0.95), so it sits in the same relative place at every tempo.
  - Run the engine tests with `npm test` from the project root.
