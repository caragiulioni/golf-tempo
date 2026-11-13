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
| Mac laptop (Apple silicon) | Chrome 156 | Pass | Repeat, stop, restart, background tab and 2 minute drift check all fine. Stop fades out (no click; a very minor blip when hammering Stop, accepted). Stall guard test button pauses as expected, no false pause in a 2 minute run. Stop when hidden: switching tabs pauses at once, Play resumes from beat 1. Output delay 56 ms with the bigger buffer. |
| Pixel 6 | Chrome 157 (Android version hidden by Chrome's reduced user agent) | Pass with bigger audio buffer | Wake lock kept the screen on. Locking the phone: with the small default buffer, crunches in the middle of a lock (5 across three locks of 15 to 26 s); with the bigger buffer (`latencyHint: 'playback'`) none across three locks. Cost: output delay 280 ms vs 16 ms, so visuals must be shifted. Sound kept playing through every lock. Long lock (about 6 minutes, bigger buffer): clean for roughly the first 3.5 minutes, then crunches that grew more frequent and larger, steady degradation after 5 minutes, and silence at about 6 minutes. Sound came back normally on unlock. Audio clock ended 1.09 s behind the device clock (it stays within about 50 ms in short runs); the player logged no late swings, so the page kept running and the phone slowed or stalled the audio output. Same test with `?keepalive=1` (silent audio element): first pop at about 4:15 after pressing Play, large crunches from about 4:40, audio stopped by itself at about 5:06, missing beats and crunchy again just before unlock at 5:36; works fully after unlock; audio clock 0.66 s behind. No better than without it, so the silent-audio trick does not help on this phone. Both runs fail at a similar point (3.5 to 4 minutes in). One run each, one phone. With the stall guard: run locked from the start, crunches from 4:25 after Play, sound gone at 5:16, guard paused at 5:28. Run with the screen on first (locked at 3:06 after Play, plus a short lock at 0:38 to 1:31): crunches from 4:31 after Play (only 1:25 after the lock), sound gone at about 5:40, guard paused at 5:46. So the trouble lines up with time since Play, not time since locking. The guard fires after the sound has died, not at the first crunch. Screen on, never locked, 7 min 27 s: no crunches or blips, wake lock held throughout, audio clock 12 ms off at the end (this run reused an audio context that was already 10 minutes old, so the age of the audio context is not the trigger). Conclusion for the web build on this phone: steady with the screen on; a locked phone degrades about 4.5 minutes after Play and the stall guard then pauses. Stop when hidden (current behavior): locking pauses at once, about a quarter second of already-queued sound trails (output delay about 256 ms), unlock shows paused, Play resumes from beat 1. Pass. Screen on, 30 minutes 11 seconds (opened in the Chrome app, plugged in): 598 swings, no pauses, wake lock held throughout, nothing odd heard. The audio clock gained about 35 ms on the device clock over the 30 minutes (normal drift between two chips, about 20 parts per million); this does not affect beat spacing, but it led to the stall guard comparing clocks over a rolling 10 s window instead of since Play. |
| iPad (model not recorded) | Safari 16.6 (iPadOS 16.6; reports itself as a Mac, which is normal for iPad Safari). Chrome also tried earlier, version not recorded | Pass (stops on lock) | Clock drift 0.3 to 4.2 ms in an earlier run, closest swing 97 ms ahead. Wake lock works (held while playing). On lock, Safari reports the audio as 'interrupted' first, so the player pauses with reason 'system'; Play afterwards resumes the audio and starts from beat 1 (checked twice). Safari does not report output delay (`outputLatency`), so the visuals need a fallback. |
| Brother's Android | | Pending | Tests the real UI after spec 3. If he reports a problem, he opens the Audio lab from the menu and sends a Copy log. Not yet tested. |

Caveat: some Pixel and iPad runs may have been opened from the Gmail app, which loads the page inside Gmail (an in-app browser tab) instead of the Chrome or Safari app. The logs cannot tell the two apart. This only matters for the locked-phone results; screen-on results are not affected, and the app now stops on lock either way. Later runs are opened in the browser app itself. One check in an in-app tab is still worth doing, since real users will open links from email and texts.

Versions come from the browser's user agent in the audio lab log. Device models still need to be recorded for the iPad.

### Native (after the port)

At least one Android device and at least one iOS device (phone or tablet).

| Device | OS version | Result | Notes |
|---|---|---|---|
| (none tested yet) | | | |

## Phone check (one-time, app-shell-ui)

Date: 2026-11-13. This is the one-time check that the app opens on a phone. Both devices were real devices (not simulators), started with `npm start` and opened in the Expo Go app.

Native status: opens on both; everything else untested on native.

| Device | OS version | How it was opened | Result |
|---|---|---|---|
| Pixel 6 (Android) | Android version not recorded | Scanned the QR code from `npm start` with Expo Go. No sign-in needed. | Opens. First screen renders, no crash, no red error screen. One problem: the header sat hard against the top of the screen, under the status bar. |
| iPad (written down as "iPad 11", so the exact model is unclear) | iPadOS version not recorded | Expo Go, after signing in (see below). | Opens. No issues reported. |

### The Android header problem

- What happened: the header was pushed up under the status bar (the strip with the clock and battery).
- Cause: React Native's built-in `SafeAreaView` does nothing on Android.
- Fix applied: added `react-native-safe-area-context` 5.11.1. `SafeAreaProvider` is in `src/app/App.tsx`, and `SafeAreaView` is used in `src/app/MainScreen.tsx` and `src/app/ConfigPlaceholder.tsx`.
- Status: expected fixed, not yet re-checked on the Pixel after reloading the app.

### Getting Expo Go to open the app on iOS (the hard part)

The latest Expo Go on iOS needs you to be signed in to the same Expo account in two places. Without that, it will not open the app.

1. In the terminal, run `npx expo login`. Check it worked with `npx expo whoami`.
2. In the Expo Go app, sign in on the Home tab (the avatar icon).
3. Restart the dev server (`npm start`) after logging in on the terminal. A server started before logging in does not pick up the login.

Things that tripped us up:
- An Expo account created with "Sign in with Google" has no password. Set one first with the forgot-password flow on expo.dev, then use it for `npx expo login`.
- Expo Go also offers an organization / SSO login. That is not the normal login. Use the regular email and password one.
- Android did not ask for sign-in at the time of this check. That may change in newer Expo Go versions.

### Not tested

- Audio in Expo Go. Web Audio does not run natively; the native audio adapter is a later spec. The planned library `react-native-audio-api` needs a development build, so Expo Go cannot test it.
- Menu behaviour beyond opening it.
- Switching light and dark mode on the device. No issues were reported, but no list of what was looked at was recorded, so treat this as untested.

## Entries

### timing-engine
- What was built: the timing brain of the app, in `src/engine/`. It holds the 16 tempo presets (10 Long Game, 6 Short Game) and works out when each beep happens in one swing: beat 1, the weight shift beat, beat 2 and beat 3. It returns a plain list of "this beep at this many seconds". It makes no sound and shows nothing on screen.
- Carries over unchanged: everything in `src/engine/` (files `presets.ts`, `beats.ts`, `weightShift.ts`, `sequence.ts`, `repeat.ts`, `index.ts`; `repeat.ts`, the pause between swings, was added during the audio spec). It is plain TypeScript with no web, React or audio code, so it is expected to work the same on iOS and Android. Not run on a phone yet. The tests (`*.test.ts`) run on a computer only and are not part of the app.
- Web-only, must be replaced on native: nothing. A search of `src/engine/` found no browser, React or audio references.
- Needs testing on a real device: nothing on its own. When the audio spec is built, check on both an Android device and an iOS device that the beeps really land at the times this list gives (beat 1 at 0 s, beat 2 at the first number divided by 30, and so on).
- Decisions and reasons:
  - Beat 3 comes 0.20 s later than the printed preset numbers imply. This was measured on all 11 Tour Tempo presets (`_references/tempo-measurements.md`), so it is copied on purpose. Do not "fix" it. The value is `BEAT3_DELAY_SECONDS` in `src/engine/beats.ts`.
  - The weight shift position is a fraction between beat 1 and beat 2 (0.05 to 0.95), so it sits in the same relative place at every tempo.
  - Run the engine tests with `npm test` from the project root.

### audio-playback
- What was built: the part that turns the engine's beep list into sound. It makes four beeps in code (no sound files): beat 1, the weight shift beat (shorter and higher, so it stands out), beat 2 and beat 3. It plays them on the audio system's own clock, repeats the swing with a pause that grows at slower tempos, starts and stops cleanly, and restarts from beat 1 when a setting changes. It keeps the screen awake while playing and stops when the phone locks. A temporary test screen, the Audio lab (`src/app/dev/AudioLab.tsx`), was built to listen and to copy a log.
- Carries over unchanged (expected, not yet run on a phone):
  - `src/audio/types.ts`: the list of what any audio system must do (start up after a tap, tell the time, play a beep at a time, stop everything, report when the phone takes the sound away, and an optional "release" step). The phone version follows this same list.
  - `src/audio/tones.ts`: what each beep sounds like (pitch, length). Plain data.
  - `src/audio/player.ts`: repeating, start, stop, restart on change, pause, and the stall guard. Plain TypeScript using ordinary timers only to top up the schedule, never to decide when a beep sounds. React Native has these timers.
  - `src/engine/repeat.ts`: the pause between swings.
- Web-only, must be replaced on native:
  - `src/audio/webAudio.ts`: makes the sound with the browser's Web Audio. Replace with a phone audio library behind the same list in `types.ts`. Candidate: `react-native-audio-api`, which copies the Web Audio design, so this file should port with modest changes (untested). `expo-audio` plays sound files and is not built for scheduling beeps made in code. `react-native-audio-api` needs an Expo development build; the Expo Go app is not enough.
  - `src/audio/webSession.ts`: keeps the screen on (browser wake lock) and stops the beats when the page is hidden. Replace with `expo-keep-awake` and the app's own "went to background" event (React Native `AppState`).
  - The Audio lab's Copy log button uses the browser clipboard and the page address. Needs a small change (for example `expo-clipboard`) so the lab can run on a phone. The lab is meant to stay as a hidden Diagnostics page for exactly this, see `.kiro/specs/_index.md`, spec 6.
  - The optional `release()` step in `types.ts` is not used on the web. On native it is the place to switch off the audio session when playback stops.
- Needs testing on a real device (both an Android device and an iOS device; a pass on one does not count for the other):
  - Beeps start after the first tap, sound at the right times, and the weight shift beep is clearly audible.
  - A 30 minute session with the screen on: no crunches, no pauses.
  - Locking the phone. On the web the beats stop on lock (see below). A phone app can keep playing when locked, but only with extra setup: on iOS, turn on background audio for the app and set the audio session to "playback" (this also makes it ignore the silent switch); on Android, run a foreground service (the notification music apps show). Decide whether to do this when porting, then test it on both.
  - Calls and other apps taking the sound: the player has a pause for this ("system"); the native adapter must report it.
  - Delay between scheduling and hearing a beep, on each device (see below).
- Decisions and reasons:
  - Beeps are scheduled ahead on the audio clock (about 0.25 s), topped up by a 25 ms timer. Each swing starts exactly one cycle after the last, so there is no drift. Values: `LOOKAHEAD_SECONDS`, `TIMER_INTERVAL_MS` in `src/audio/player.ts`.
  - Bigger audio buffer by default (`latencyHint: 'playback'` in `src/audio/webAudio.ts`). On a Pixel 6 the small buffer crackled while locked; the bigger one did not. Cost: more delay before a beep is heard (about 250 to 280 ms on the Pixel, 56 ms on a Mac). Beep spacing is not affected.
  - That delay matters for anything visual (spec 3): the picture must be shifted by it. The browser reports it as `outputLatency`; Safari 16.6 on iPad does not, so a fallback is needed. On native, measure it per device.
  - Stops when the phone locks or another app comes to the front. A locked Pixel 6 played cleanly for about 4 minutes, then crunched and stopped; the iPad stops on lock by itself. Stopping straight away means the beats are either right or silent. Plain-language version for the user: `docs/development-decisions.md`, entry 1.
  - Stall guard: if the audio clock falls more than 0.15 s behind the device clock within a rolling 10 s window, the player pauses instead of playing late beats (`STALL_THRESHOLD_SECONDS`, `STALL_WINDOW_SECONDS`). The window matters: the two clocks drift apart slowly on every device, and comparing since Play would eventually pause a healthy long session on a phone whose audio clock runs slow. It catches a full stall, not small crunches.
  - After the first tap, the player waits until the audio clock is really moving before scheduling. Some phones report "ready" while the clock is still at zero.
  - Stopping fades a beep out over a few milliseconds instead of cutting it, which clicked.
  - Tried and removed: playing silent audio in the background to keep the phone treating the page like a music player. It did not help on the Pixel.
  - Some lock tests may have been opened from Gmail's in-app browser, not the browser app (see the note under the web results table).

## Final guide checklist (written after the last spec)

- [ ] Plain-language overview: what the app is and what porting involves.
- [ ] Prerequisites and tools to install.
- [ ] Step-by-step: run on a simulator, run on a real device, build for the stores.
- [ ] List of web-only parts and their native replacements.
- [ ] Known risks and untested areas.
- [ ] Native icon and splash files: Android adaptive icon (foreground, background, monochrome) and a splash image, made by Mike. What is needed: `docs/design-brief.md`, section 12, "Icon files still needed". Then point `app.json` at them (it still uses the Expo template placeholders in `assets/`).
- [ ] How to open the hidden Audio lab (Diagnostics page) and use it as the first test on a phone: play, lock the phone, tap Copy log, send the log.
