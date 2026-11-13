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

### Output delay check (app-shell-ui, Wave 3.9)

Date: 2026-11-13. Build: Netlify draft https://6af713c6e4722b88faacdaff--swing-tempo-beta.netlify.app, opened in the browser. The question: does the app know how late the sound reaches the ears, so the timeline lights land with the beeps?

| Device | Browser | What was recorded |
|---|---|---|
| Mac laptop | Chrome 157 (Macintosh) | Real log. Audio context running, 44100 Hz, base latency 23.2 ms, output latency 56.0 ms. Every swing from the second one logged `Output delay 56 ms (reported)`. |
| iPad (written down earlier as "iPad 11") | Safari, version not recorded this time | By eye and ear the lights land with the beeps ("works great"). Later log: three loops at 30/10, every `Output delay` was 3 ms. |
| Pixel 6 | Chrome 157 (Android version hidden by Chrome) | By eye and ear it works great. Log at 30/10: first three swings reported 24 ms, 272 ms, 280 ms. |

- Known gap: the first swing of a run logged `Output delay 0 ms (reported)`. The browser had not yet filled in its output latency when the first swing was scheduled. Fixed: 0 is treated as not reported, so the first swing uses the platform fallback constant directly (not the base latency, which is far smaller than the real delay, e.g. 23 ms vs 280 ms on Pixel).
- Pixel 6 evidence (user-reported from the Audio lab at 30/10): the first three swings after Play logged 24 ms, 272 ms, 280 ms. The browser reports a small non-zero startup value, so the zero rule does not catch it. New rule: the first swing of every run (start, restart, resume from pause) uses the platform fallback constant (log line ends with `first swing`); from the second swing the reported value is used. Re-checked on the Pixel with the new build (2026-11-13): first swing logged 280 ms (fallback, first swing), then 264 ms and 272 ms (reported); lights looked good; each restart (Play again, preset change) logged `first swing` again. iPad re-check: every log line 3 ms, including the first.
- The first swing of each run uses the fallback value on every platform.
- Fallback values: iOS 3 ms (measured on iPad Safari, every logged delay was 3 ms), Android 280 ms (from the Pixel 6 log: 24, 272, 280 ms), desktop 50 ms (still a placeholder; Mac Chrome reported 56 ms). The iOS constant was 100 ms before the iPad measurement.
- To tighten later: open the Audio lab on the iPad and on the Pixel, play a few presets, copy the log and read the `Output delay` lines.
- Not claimed: nothing here was checked on native (Expo) builds.

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
- What was built: the part that turns the engine's beep list into sound. It makes four beeps in code (no sound files): beat 1, the weight shift beat (shorter and higher, so it stands out), beat 2 and beat 3. It plays them on the audio system's own clock, repeats the swing with a pause that grows at slower tempos, starts and stops cleanly, and restarts from beat 1 when a setting changes. It keeps the screen awake while playing and stops when the phone locks. A temporary test screen, the Audio lab (`src/audio-lab/AudioLab.tsx` (mounted from the menu)), was built to listen and to copy a log.
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

### app-shell-ui
- What was built: everything you see and tap, except sound on a phone. An intro screen, the main screen (Long Game / Short Game switch, preset buttons, play button, tempo numbers, the beat timeline with lights and a moving playhead), a header with a menu (Config placeholder, light/dark switch, Audio lab), the saved light/dark choice, and the Audio lab moved inside the app. Play, pause and restart-on-change work through the audio player from the audio spec. Written with React Native pieces so most of it should run on a phone.
- Carries over unchanged (expected to work, not confirmed beyond this): the app was opened once on a Pixel 6 and an iPad through Expo Go and the first screen showed, with no crash. Nothing else was checked on those devices (see "Phone check" above). Expected to work:
  - Theme and design values: `src/theme/` (`tokens.ts`, `ThemeProvider.tsx`). Light/dark follows the device setting through React Native's `useColorScheme`.
  - Shared building blocks: everything in `src/ui/components/` (text, icons, buttons, header, cards, preset grid, play button, status messages, switch).
  - Screens and layout: `src/app/MainScreen.tsx`, `src/app/IntroScreen.tsx`, `src/app/App.tsx`, `src/app/ConfigPlaceholder.tsx`, and the size rules in `src/ui/hooks/useLayout.ts`.
  - Saved settings: `src/storage/` uses AsyncStorage, which uses the phone's own storage on iOS and Android.
  - Safe areas (keeps content clear of the status bar and notch): `react-native-safe-area-context`, set up in `src/app/App.tsx`. Added after the Android header problem, expected fixed, not re-checked.
  - Reduce motion: `src/ui/hooks/useReduceMotion.ts` uses React Native's accessibility setting (expected, untested).
  - Beat timeline: `src/ui/components/BeatTimeline.tsx` uses React Native's `Animated` and `react-native-svg`. The drawing is expected to work. The animation is untested on native. The playhead and fill move with `useNativeDriver: false`, so they run on the JavaScript side and could look less smooth on a slow phone.
  - Plain TypeScript helpers: `src/ui/lib/outputDelay.ts`, `src/ui/lib/timelineGeometry.ts`. They have tests and no browser code.
- Web-only, must be replaced on native:
  - `src/ui/hooks/usePlayerSession.ts`: only creates the web audio adapter and attaches the web session when `Platform.OS === 'web'`. On iOS and Android it makes no player, so Play shows "Audio could not start. Tap play to try again." Replace with the native audio adapter and a native keep-awake and background handler (see the audio-playback entry).
  - `src/ui/lib/silentSwitch.ts` (`readDeviceInfo`) reads the browser's `navigator`. It is safe where `navigator` is missing (returns empty values). `src/ui/lib/platformKey.ts` uses it to guess iOS, Android or desktop in the browser. On native it uses `Platform.OS` first, so it should still pick the right one. Untested.
  - `src/audio-lab/AudioLab.tsx`: Copy log uses the browser clipboard, and the log text reads the page address and browser name. These are all guarded behind `Platform.OS === 'web'`, so on a phone the lab should open but Copy log fails with an error and the text stays selectable. Replace with `expo-clipboard` for a real native copy.
  - `src/ui/hooks/useFocusRing.ts`: the keyboard focus ring uses the browser's `:focus-visible`. Phones do not need it; on native the ring never shows by design.
  - `src/ui/components/Menu.tsx`: the Escape key (listens on the browser `document`), and moving keyboard focus to the first item on open and back to the menu button on close (browser DOM calls), are guarded by `Platform.OS === 'web'`. Closing by tapping outside and by the Android back button uses React Native's `Modal` and should carry over, untested. Screen reader focus on native is not handled.
  - `src/audio/webSession.ts` (used through `usePlayerSession.ts`) uses `navigator.wakeLock` and `document` visibility events. Already listed in the audio-playback entry.
  - The silent-switch hint in `src/app/MainScreen.tsx` ("No sound? Check silent mode, mute in Control Center and the volume.") is written for iPhone and iPad. It shows on any iOS device and in iOS Safari, never on Android or desktop. On a native iOS app with audio set to "playback", the silent switch is ignored, so the wording may need to change or go.
- Needs testing on a real device (all untested on native; the only native result is that the first screen opened in Expo Go):
  - Audio: nothing plays in Expo Go (and the planned `react-native-audio-api` needs a development build). Test on both Android and iOS once built.
  - Keeping the screen awake while playing, and what happens when the phone locks.
  - Light/dark switching on the device, both the menu toggle and following the device setting. The Phone check recorded no issues, but no list of what was looked at, so treat as untested.
  - Menu: open, pick each item, close by outside tap and by the Android back button.
  - Timeline animation: playhead sweep, marker lights landing with the beeps, weight shift pulse, no stuck lights after stop or preset change.
  - Reduce motion: turn on the phone's setting and check the intro fade, playhead and pulse stay still.
  - Fonts offline: the fonts come from the `@expo-google-fonts/*` packages. Open the app with no network and check the text still uses them (Inter, Space Grotesk, Michroma).
  - Android safe area fix: reload the app on the Pixel 6 and check the header clears the status bar.
  - Real phone sizes, rotation, and tap size of the play button.
- Decisions and reasons:
  - Wordmark: the app name is set in Michroma text as a placeholder (`src/ui/components/BrandName.tsx`, `src/ui/brand.ts`) until a finished SVG wordmark exists. Michroma is used for that text only.
  - Output delay: the picture is shifted by how late the sound reaches the ears. The first swing of each run always uses a fixed fallback for the platform: iOS 3 ms, Android 280 ms, desktop 50 ms (a placeholder; Mac Chrome reported 56 ms). From the second swing the browser's reported value is used. Code: `src/ui/lib/outputDelay.ts`. Evidence and devices are in the "Output delay check" section above. Native will need its own measurements.
  - Phone check and the Android header fix are in the "Phone check" section above. The Expo Go iOS sign-in steps are in "Getting Expo Go to open the app on iOS" in the same section. Follow them before testing on an iPhone or iPad.
  - Play button is 75 on phones (`layoutSizes` in `src/theme/tokens.ts`). That is a user decision, not the design handoff value. Do not change it without asking.
  - Named styles: each component keeps its styles in `StyleSheet.create` at the bottom of the file, and values come from the theme, so a porter can find and change them in one place.
  - The loop switch is shown but disabled; the background loop is a later spec. (Now live, see the background-loop entry.)

### background-loop
- What was built: an optional drum loop (kick, snare, hi-hat) that plays under the beeps, made in code with no sound files. One bar of the loop is one swing, so beat 1 always starts a bar, and the loop keeps playing through the pause between swings. The pattern copies Tour Tempo's loop, measured from its Long Game clips: 12 steps per bar, kick on steps 0, 4, 8, snare on 2, 6, 10, a hi-hat on every step. A "Background loop" switch on the main screen turns it on; it is off every time the app starts (not saved). The Audio lab has Kick, Snare and Hat buttons, a loop on/off option, and "Beats: Off" to hear the loop without the beeps.
- Carries over unchanged (expected, not run on a phone):
  - `src/engine/loop.ts`: where every drum hit goes, as plain lists and numbers. No browser, React or audio code. Tested (`src/engine/loop.test.ts`).
  - `src/audio/player.ts`: schedules the loop with the beeps from the same start time on the audio clock, so they cannot drift apart. Plain TypeScript.
  - `src/audio/types.ts`: the optional `playLoopVoice` step any audio system can provide. An audio system without it simply plays no loop.
  - The switch wiring: `src/app/MainScreen.tsx` and `src/ui/hooks/usePlayerSession.ts`, plus `restartKey` on `src/ui/components/BeatTimeline.tsx` so the timeline resets when the loop is toggled while playing.
- Web-only, must be replaced on native:
  - `src/audio/webAudio.ts`, `playLoopVoice`: makes the kick (a falling sine), snare (filtered noise plus a short tone) and hat (high-passed noise) with Web Audio, through one quieter "loop bus". The native audio adapter must make the same three sounds. With `react-native-audio-api` (it copies the Web Audio design) this is expected to port with modest changes. Untested. The levels and sound shapes are named constants at the top of that file.
- Needs testing on a real device (both an Android device and an iOS device):
  - The loop stays locked to the beeps over a long session, and stopping or changing a setting silences the drums without a click.
  - The kick is audible on the phone speaker (it drops to about 45 Hz, which small speakers barely play) and every beep stays clear over the loop.
  - On the web: Pixel 6 (Chrome 157) and iPad (Safari 16.6) scheduled the loop cleanly through many restarts, with no stalls or pauses. Speaker levels were not formally rated on either; no problems were reported and no levels were changed.
- Decisions and reasons:
  - Long Game 18/6 to 30/10 and all Short Game use even steps, exactly like Tour Tempo. Beat 2 and beat 3 then sit slightly off the drums (up to 0.05 s at Long 18/6; Short Game beat 2 comes 0.13 to 0.17 s before the step 4 kick), as in Tour Tempo. Accepted by ear.
  - Long Game 42/14 and slower (not in Tour Tempo) place the steps so beat 2 is on step 4 and beat 3 on the step 6 snare. Without this, beat 3 drifted up to 0.37 s off the loop at 168/56.
  - Placing Short Game's steps around its beats was tried and rejected by ear: the loop sped up between the top of the swing and impact, worse at slower presets.
  - Why no grid does everything: beat 3 has a fixed 0.2 s delay, so beat 2 and beat 3 can only both sit on even steps at one tempo, which is not a preset.
  - Full history, findings and the audit: `docs/background-loop-audit-notes.md`. Plain-language summary for the user: `docs/development-decisions.md`, section 2.

## Final guide checklist (written after the last spec)

- [ ] Plain-language overview: what the app is and what porting involves.
- [ ] Prerequisites and tools to install.
- [ ] Step-by-step: run on a simulator, run on a real device, build for the stores.
- [ ] List of web-only parts and their native replacements.
- [ ] Known risks and untested areas.
- [ ] Native icon and splash files: Android adaptive icon (foreground, background, monochrome) and a splash image, made by Mike. What is needed: `docs/design-brief.md`, section 12, "Icon files still needed". Then point `app.json` at them (it still uses the Expo template placeholders in `assets/`).
- [ ] How to open the hidden Audio lab (Diagnostics page) and use it as the first test on a phone: play, lock the phone, tap Copy log, send the log.
