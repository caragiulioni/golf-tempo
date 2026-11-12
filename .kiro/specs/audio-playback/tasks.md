# Tasks: audio-playback

Follows `.kiro/steering/workflow.md`. Stop for review at the end of every wave, and after any task that touches timing or audio.

## Wave 2.1: One swing you can hear (desktop browser)

- [x] 1. Spec docs. Check: requirements, design and tasks exist and `_index.md` is updated.
- [x] 2. Adapter interface with no web code. Check: `npm run typecheck` passes and `src/audio/types.ts` imports nothing from the DOM or React.
- [x] 3. Web tones: four voices, weight shift clearly distinct by default, with the tone switch. Check by ear: each tone plays from the temporary AudioLab button.
- [x] 4. Play one swing from the engine's list on the audio clock. Check: for 30/10, logged audio times match the engine within 1 ms, and by ear the weight shift sits between beat 1 and beat 2.

## Wave 2.2: Repeat, start/stop, restart on change

- [x] 1. Repeat pause in the engine. Check: automated tests; cycle lengths close to the clips (24/8 about 2.5 s, 30/10 about 3.0 s).
- [x] 2. Repeating playback. Check by ear and log: 30/10 repeats with no drift over 2 minutes.
- [x] 3. Start and stop with unlock on the first tap. Check: starts from beat 1 every time; silence after stop, including already scheduled beeps.
- [x] 4. Restart on change. Check: tap three presets quickly and only the last one plays; nothing starts if stopped.

## Wave 2.3: Phone behavior

- [x] 1. Screen wake lock while playing (`webSession.ts`). Check, desktop: Play shows "Wake lock: held", Stop shows "idle".
- [x] 2. Behavior when hidden or locked; pause cleanly if the system takes the audio away; do not catch up after a freeze. First built as keep-playing (checked on desktop). Changed after device tests: stop when hidden, plus a stall guard. Check: see task 5.
- [x] 3. Clock readout and event log in the audio lab. Check: run time and audio-versus-device clock drift update every second.
- [x] 4. An https address for the phones: Netlify draft deploy of the web export. Check: the link opens the audio lab on a phone.
- [ ] 5. Real device testing: desktop, iPad Safari, Android Chrome (two phones). Includes locking the phone while playing. Check: results recorded per device in `docs/porting-guide.md`. Done so far: Mac desktop, Pixel 6 Chrome, iPad (Safari and Chrome). Pending: the brother's Android, tested through the Audio lab menu item once spec 3 exists. Bigger audio buffer is now the default (Pixel tests). Keep-alive trick did not help on the Pixel. Current behavior: stop when hidden. Still to check: stop-on-lock on laptop, Pixel and iPad; Pixel long screen-on run.
- [ ] 6. Porting notes. Check: entry added to `docs/porting-guide.md`.
